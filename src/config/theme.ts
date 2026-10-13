// Farbschema aus dem Kanzlei-Profil. Konfiguriert werden nur vier Grundfarben;
// Abstufungen (dunkler Akzent, Akzent als Schrift, abgesetzter Hintergrund)
// werden hier berechnet. Akzent als Schrift wird so lange abgedunkelt, bis er
// auf Weiss UND auf dem Hintergrund WCAG AA (4.5:1) erreicht.

import { firm } from './firm';

type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const toHex = (c: RGB) => `#${c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function luminance([r, g, b]: RGB): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function contrast(a: RGB, b: RGB): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const t = firm.theme;
const accent = hexToRgb(t.accent);
const bg = hexToRgb(t.background);
const dark = hexToRgb(t.dark);
const light = hexToRgb(t.light);

let accentInk = accent;
for (let i = 0; i < 40 && Math.min(contrast(accentInk, light), contrast(accentInk, bg)) < 4.5; i++) {
  accentInk = mix(accentInk, dark, 0.06);
}

export const themeColors = {
  accent: toHex(accent),
  accentDeep: toHex(mix(accent, dark, 0.17)),
  accentInk: toHex(accentInk),
  sky: toHex(bg),
  skyDeep: toHex(mix(bg, dark, 0.06)),
  ink: toHex(dark),
  inkSoft: toHex(mix(dark, light, 0.13)),
  paper: toHex(light),
  // Muster: eigene Farbe oder Akzent.
  pattern: t.pattern.color ? toHex(hexToRgb(t.pattern.color)) : toHex(accent),
};

/** CSS-Variablen fuer :root (ueberschreiben die Tokens aus global.css). */
export const themeCss = `:root{${[
  ['--color-accent', themeColors.accent],
  ['--color-accent-deep', themeColors.accentDeep],
  ['--color-accent-ink', themeColors.accentInk],
  ['--color-sky', themeColors.sky],
  ['--color-sky-deep', themeColors.skyDeep],
  ['--color-ink', themeColors.ink],
  ['--color-ink-soft', themeColors.inkSoft],
  ['--color-paper', themeColors.paper],
  ['--color-pattern', themeColors.pattern],
  ['--accent-rgb', accent.map(Math.round).join(' ')],
].map(([k, v]) => `${k}:${v}`).join(';')}}`;
