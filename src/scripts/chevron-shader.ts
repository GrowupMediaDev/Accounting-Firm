// Hintergrundmuster als WebGL-Shader hinter dem CTA. Form, Farbe und Staerke
// kommen aus dem Kanzlei-Profil (data-pattern/-color/-intensity am Canvas, siehe
// config/pattern.ts): 0 Zickzack (Figma-Original, 14x10px), 1 Diagonal,
// 2 Punkte, 3 Raster, 4 Wellen. Die Staerke steigt ab der Mitte der Haende an und
// laeuft zur Footer-Kante wieder in Schwarz aus (Verlauf aus dem Footer nach
// oben); der Footer selbst bleibt einfarbig.
//
// Flimmerfrei: Das Muster hat 1px-Linien mit 10px-Periode. Liegt das Canvas
// zwischen zwei Geraetepixeln oder wird minimal gestreckt, rechnet der Browser
// es beim Scrollen jedes Frame neu um (Moire). Deshalb setzt das Modul Lage und
// Hoehe des Canvas selbst, exakt auf Geraetepixel.
//
// Performance: 30 fps (Bewegung ist langsam), zeichnet nur sichtbar, Geometrie
// nur bei Groessenaenderung (keine Layout-Abfragen pro Frame), Aufloesung auf
// schwachen Geraeten begrenzt, billiges 2-Oktaven-Rauschen.

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;      // Canvas in Geraetepixeln
uniform float u_scale;   // Geraetepixel pro CSS-Pixel
uniform vec2 u_origin;   // Seitenposition (CSS-Pixel) der Canvas-Oberkante links
uniform float u_time;
uniform vec2 u_mouse;    // Seitenposition der Maus (CSS-Pixel)
uniform float u_mouseOn;
uniform float u_gain;    // Gesamtstaerke (schmal: Text liegt direkt darauf)
uniform vec3 u_stops;    // Start (Mitte Haende), Hoehepunkt, Ende (Footer-Kante)
uniform float u_pattern; // Musterform (Index)
uniform vec3 u_color;    // Musterfarbe
uniform vec3 u_bg;       // Grundfarbe = dunkle Flaeche des Profils (sonst Kante zu Nicht-Schwarz)

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm2(vec2 p) { return 0.65 * noise(p) + 0.35 * noise(p * 2.03 + 7.1); }

void main() {
  vec2 local = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y) / u_scale;
  vec2 page = u_origin + local;               // y nach unten
  vec2 pos = vec2(page.x, -page.y);           // Muster in y-oben
  float t = u_time;

  // Staerke: steigt bis zum Hoehepunkt, laeuft zur Footer-Kante in Schwarz aus
  float up = smoothstep(u_stops.x, u_stops.y, page.y);
  float down = 1.0 - smoothstep(u_stops.y, u_stops.z, page.y);
  float mask = up * up * down * u_gain;
  if (mask < 0.003) { gl_FragColor = vec4(u_bg, 1.0); return; }

  // Stroemung wie Stoff
  float n = fbm2(pos * 0.0035 + vec2(t * 0.05, -t * 0.03));
  vec2 q = pos + vec2(0.0, (n - 0.5) * 16.0);

  // Maus-Linse
  vec2 dm = page - u_mouse;
  float lens = exp(-dot(dm, dm) / 28900.0) * u_mouseOn;
  q.y += lens * 7.0;

  // Abstand zur naechsten Linie (Pixel) je nach Musterform
  float d;
  float w = 0.6; // halbe Linienbreite
  if (u_pattern < 0.5) {
    // Zickzack: Zelle 14x10, Linie (0,1) -> (7,8) -> (14,1)
    vec2 f = mod(q, vec2(14.0, 10.0));
    float v = 1.0 + 7.0 * (1.0 - abs(f.x / 7.0 - 1.0));
    d = min(abs(f.y - v), min(abs(f.y - v - 10.0), abs(f.y - v + 10.0))) * 0.7071;
  } else if (u_pattern < 1.5) {
    // Diagonal: 45 Grad, Abstand 8.5
    float v = mod((q.x + q.y) * 0.7071, 8.5);
    d = min(v, 8.5 - v);
  } else if (u_pattern < 2.5) {
    // Punkte: Raster 12, Radius 1.3
    d = length(mod(q, 12.0) - 6.0) - 1.3;
    w = 0.0;
  } else if (u_pattern < 3.5) {
    // Raster: Linien alle 16
    vec2 g = mod(q, 16.0);
    d = min(min(g.x, 16.0 - g.x), min(g.y, 16.0 - g.y));
    w = 0.45;
  } else {
    // Wellen: Periode 10, Wellenlaenge 40
    float v = mod(q.y + 3.0 * sin(q.x * 0.15708), 10.0);
    d = min(v, 10.0 - v);
  }
  float aa = 1.0 / u_scale;
  float line = 1.0 - smoothstep(w - aa * 0.5, w + aa, d);

  // Licht: Wellen + diagonaler Streif
  float shimmer = fbm2(pos * 0.0022 + vec2(-t * 0.06, t * 0.025));
  float sweep = 0.5 + 0.5 * sin(pos.x * 0.0035 + pos.y * 0.002 - t * 0.55);
  float bright = 0.3 + smoothstep(0.35, 0.8, shimmer) * 0.5 + pow(sweep, 8.0) * 0.3 + lens * 0.75;

  vec3 col = u_bg + u_color * line * bright * mask;
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Seitenkoordinaten (CSS-Pixel): Muster beginnt bei `from` und ist bei `to` (Footer-Kante) wieder schwarz. */
type Range = { from: number; to: number };

export function initChevronField(canvas: HTMLCanvasElement, measure: () => Range): void {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power' });
  const host = canvas.offsetParent as HTMLElement | null;
  const prog = gl && host ? build(gl) : null;
  if (!gl || !host || !prog) { canvas.classList.add('no-gl'); return; } // CSS zeigt das statische Muster

  const u: Record<string, WebGLUniformLocation | null> = {};
  for (const n of ['u_res', 'u_scale', 'u_origin', 'u_time', 'u_mouse', 'u_mouseOn', 'u_stops', 'u_gain', 'u_pattern', 'u_color', 'u_bg']) u[n] = gl.getUniformLocation(prog, n);
  // Muster aus dem Profil (data-Attribute am Canvas).
  const [cr, cg, cb] = (canvas.dataset.color ?? '0.796,0.325,0.039').split(',').map(Number);
  const intensity = Number(canvas.dataset.intensity ?? 1);
  gl.uniform1f(u.u_pattern, Number(canvas.dataset.pattern ?? 0));
  gl.uniform3f(u.u_color, cr, cg, cb);
  const [br, bg, bb] = (canvas.dataset.bg ?? '0,0,0').split(',').map(Number);
  gl.uniform3f(u.u_bg, br, bg, bb);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Schwaechere / mobile Geraete: Aufloesung begrenzen.
  const weak = (navigator.hardwareConcurrency || 8) <= 4 || matchMedia('(pointer: coarse)').matches;
  const maxScale = weak ? 1.5 : 2;

  // Geometrie in Seitenkoordinaten, nur bei Groessenaenderung neu.
  const geo = { left: 0, top: 0, height: 0, from: 0, to: 0, scale: 1 };
  let time = 12;
  const mouse = { cx: -1e4, cy: -1e4, x: 0, y: 0, on: 0, active: false };

  const draw = () => {
    gl.uniform1f(u.u_time, time);
    gl.uniform2f(u.u_mouse, mouse.x, mouse.y);
    gl.uniform1f(u.u_mouseOn, mouse.on);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const layout = () => {
    const dpr = window.devicePixelRatio || 1;
    const scale = Math.min(dpr, maxScale);
    const { from, to } = measure();
    const hostRect = host.getBoundingClientRect();
    const hostTop = hostRect.top + scrollY;
    // Oberkante auf ganze Geraetepixel, Hoehe als ganzes Vielfaches der Pixelgroesse.
    const top = Math.round(from * dpr) / dpr;
    const rows = Math.max(1, Math.ceil((to - top) * scale));
    const height = rows / scale;
    canvas.style.top = `${top - hostTop}px`;
    canvas.style.height = `${height}px`;
    const cols = Math.max(1, Math.round(hostRect.width * scale));
    if (canvas.width !== cols || canvas.height !== rows) { canvas.width = cols; canvas.height = rows; }
    Object.assign(geo, { left: hostRect.left + scrollX, top, height, from, to, scale });
    gl.viewport(0, 0, cols, rows);
    gl.uniform2f(u.u_res, cols, rows);
    gl.uniform1f(u.u_scale, scale);
    gl.uniform2f(u.u_origin, geo.left, top);
    // Verlauf aus dem Footer: die unteren ~40 % (200 bis 420px) blenden aus.
    const fade = Math.min(420, Math.max(200, (to - from) * 0.4));
    gl.uniform3f(u.u_stops, from, to - fade, to);
    // Schmal laeuft der Absatz mitten durch den Hoehepunkt: Muster zuruecknehmen.
    gl.uniform1f(u.u_gain, (hostRect.width < 768 ? 0.55 : 1) * intensity);
    draw();
  };

  // Maus (nur echte Maus): Bildschirmposition merken, Seitenposition pro Frame,
  // damit die Linse auch beim Scrollen unter dem Zeiger bleibt.
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (!mouse.active) { mouse.x = e.clientX + scrollX; mouse.y = e.clientY + scrollY; }
    mouse.cx = e.clientX; mouse.cy = e.clientY; mouse.active = true;
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { mouse.active = false; });

  let raf = 0;
  let last = 0;
  let acc = 0;
  let visible = false;
  const FRAME = 1 / 30;
  const loop = (now: number) => {
    raf = 0;
    const dt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    acc += dt;
    if (acc >= FRAME) {
      time += acc;
      const py = mouse.cy + scrollY;
      const inside = mouse.active && py >= geo.top && py <= geo.top + geo.height;
      const k = Math.min(1, acc * 6);
      mouse.x += (mouse.cx + scrollX - mouse.x) * k;
      mouse.y += (py - mouse.y) * k;
      mouse.on += ((inside ? 1 : 0) - mouse.on) * Math.min(1, acc * 3);
      acc = 0;
      draw();
    }
    if (visible) raf = requestAnimationFrame(loop);
  };

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf && !reduce) { last = 0; raf = requestAnimationFrame(loop); }
  }).observe(canvas);

  // Hoehe/Lage aendern sich mit dem Abschnitt, dem Inhalt darueber und der Pixeldichte.
  const ro = new ResizeObserver(layout);
  ro.observe(host);
  ro.observe(document.body);
  const watchDpr = () => {
    matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener('change', () => { layout(); watchDpr(); }, { once: true });
  };
  watchDpr();
  layout();
}

function build(gl: WebGLRenderingContext): WebGLProgram | null {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  return prog;
}
