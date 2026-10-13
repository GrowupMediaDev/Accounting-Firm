// Konfigurator fuer Kanzlei-Profile. Laeuft NUR im Dev-Server (npm run dev):
// /configurator (auch /konfigurator) zeigt Formular + Live-Vorschau, die API unter /__cfg liest und
// schreibt src/firms/<slug>/firm.json und images/. Im Build existiert davon nichts.
//
// Die Konfigurator-Seite selbst kommt bewusst nicht aus Astro/Vite (kein
// HMR-Client): Speichert sie, laedt Vite nur die Vorschau neu, nicht das Formular.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, cpSync, statSync, renameSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const UI = join(dirname(fileURLToPath(import.meta.url)), 'ui');
const SLUG = /^[a-z0-9][a-z0-9-]{0,47}$/;
const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg']);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.svg': 'image/svg+xml' };
const MAX_UPLOAD = 20 * 1024 * 1024;
// Referenzprofil: liefert alle Bilder, die ein Profil nicht selbst hat (wie img() in src/config/firm.ts).
const REFERENCE = 'hartmann-vogt';

/** Dateiname fuer Uploads: klein, ohne Umlaute/Leerzeichen. */
function safeName(name) {
  const ext = extname(name).toLowerCase();
  const base = name.slice(0, name.length - ext.length).toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'bild';
  return { base: base.slice(0, 60), ext };
}

function readBody(req, limit = MAX_UPLOAD) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('File too large (max. 20 MB)')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default function configurator() {
  let root = '';
  return {
    name: 'firm-configurator',
    hooks: {
      'astro:config:done': ({ config }) => { root = fileURLToPath(config.root); },
      'astro:server:setup': ({ server, logger }) => {
        const firmsDir = join(root, 'src/firms');
        const firmDir = (slug) => join(firmsDir, slug);
        const firmFile = (slug) => join(firmDir(slug), 'firm.json');
        const activeFile = join(firmsDir, 'active.json');
        const listFirms = () => readdirSync(firmsDir, { withFileTypes: true })
          .filter((d) => d.isDirectory() && existsSync(firmFile(d.name)))
          .map((d) => {
            let name = d.name;
            try { name = JSON.parse(readFileSync(firmFile(d.name), 'utf8')).brand?.name || d.name; } catch { /* kaputtes JSON: Slug zeigen */ }
            return { slug: d.name, name };
          });
        // Atomar schreiben: erst Temp-Datei, dann umbenennen (Vite sieht nie halbes JSON).
        const writeJson = (file, data) => {
          const tmp = `${file}.tmp`;
          writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`);
          renameSync(tmp, file);
        };

        const send = (res, status, body, type = 'application/json') => {
          res.statusCode = status;
          res.setHeader('Content-Type', type);
          res.setHeader('Cache-Control', 'no-store');
          res.end(type === 'application/json' ? JSON.stringify(body) : body);
        };
        const fail = (res, status, message) => send(res, status, { error: message });
        const needSlug = (res, slug) => {
          if (!SLUG.test(slug || '') || !existsSync(firmFile(slug))) { fail(res, 404, `Profile "${slug}" not found`); return false; }
          return true;
        };

        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url, 'http://localhost');
          const p = url.pathname;
          try {
            // ---------- Oberflaeche ----------
            if (/^\/(configurator|konfigurator)\/?$/.test(p)) {
              return send(res, 200, readFileSync(join(UI, 'index.html')), 'text/html; charset=utf-8');
            }
            if (p.startsWith('/__cfg/ui/')) {
              const file = join(UI, p.slice('/__cfg/ui/'.length).replace(/\.\.+/g, ''));
              if (!file.startsWith(UI) || !existsSync(file)) return fail(res, 404, 'Not found');
              return send(res, 200, readFileSync(file), `${TYPES[extname(file)] || 'text/plain'}; charset=utf-8`);
            }
            if (!p.startsWith('/__cfg/')) return next();

            // ---------- API ----------
            const parts = p.split('/').filter(Boolean).slice(1); // ohne "__cfg"
            const [route, slug, name] = parts;

            if (route === 'state' && req.method === 'GET') {
              const active = JSON.parse(readFileSync(activeFile, 'utf8')).firm;
              return send(res, 200, { active, firms: listFirms() });
            }

            if (route === 'patterns' && req.method === 'GET') {
              const mod = await server.ssrLoadModule('/src/config/pattern-tiles.ts');
              const color = url.searchParams.get('color') || '#cb530a';
              const tiles = Object.fromEntries(Object.entries(mod.tiles).map(([k, fn]) => [k, fn(color)]));
              return send(res, 200, { patterns: mod.PATTERNS, tiles });
            }

            if (route === 'firm') {
              if (!needSlug(res, slug)) return;
              // ?lang=en: englische Texte (firm.en.json, nur Uebersetzungen)
              const en = url.searchParams.get('lang') === 'en';
              const file = en ? join(firmDir(slug), 'firm.en.json') : firmFile(slug);
              if (req.method === 'GET') return send(res, 200, existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {});
              if (req.method === 'PUT' || req.method === 'POST') { // POST: sendBeacon beim Schliessen
                const data = JSON.parse((await readBody(req, 2 * 1024 * 1024)).toString('utf8'));
                if (!data || typeof data !== 'object' || (!en && (!data.brand || !data.theme))) return fail(res, 400, 'Invalid profile');
                writeJson(file, data);
                return send(res, 200, { ok: true });
              }
            }

            if (route === 'active' && req.method === 'POST') {
              const { slug: next } = JSON.parse((await readBody(req, 4096)).toString('utf8'));
              if (!needSlug(res, next)) return;
              writeJson(activeFile, { firm: next });
              return send(res, 200, { ok: true });
            }

            if (route === 'duplicate' && req.method === 'POST') {
              const { from, slug: to, name: firmName } = JSON.parse((await readBody(req, 4096)).toString('utf8'));
              if (!needSlug(res, from)) return;
              if (!SLUG.test(to || '')) return fail(res, 400, 'Short name may only use a-z, 0-9 and hyphens');
              if (existsSync(firmDir(to))) return fail(res, 409, `"${to}" already exists`);
              // Nur die eigenen Bilder der Vorlage kopieren; der Rest wird vom Referenzprofil geerbt.
              mkdirSync(join(firmDir(to), 'images'), { recursive: true });
              cpSync(firmFile(from), firmFile(to));
              if (from !== REFERENCE && existsSync(join(firmDir(from), 'images'))) cpSync(join(firmDir(from), 'images'), join(firmDir(to), 'images'), { recursive: true });
              const data = JSON.parse(readFileSync(firmFile(to), 'utf8'));
              if (firmName) data.brand.name = firmName;
              // Englische Texte der Vorlage passen nicht zur neuen Kanzlei.
              data.languages = { ...(data.languages ?? {}), en: false };
              writeJson(firmFile(to), data);
              logger.info(`New firm profile: ${to} (copy of ${from})`);
              return send(res, 200, { ok: true, slug: to });
            }

            if (route === 'images' && req.method === 'GET') {
              if (!needSlug(res, slug)) return;
              const list = (s) => { const dir = join(firmDir(s), 'images'); return existsSync(dir) ? readdirSync(dir).filter((f) => IMG_EXT.has(extname(f).toLowerCase())) : []; };
              const own = list(slug);
              const inherited = slug === REFERENCE ? [] : list(REFERENCE).filter((f) => !own.includes(f));
              return send(res, 200, [
                ...own.sort().map((f) => ({ name: f, size: statSync(join(firmDir(slug), 'images', f)).size })),
                ...inherited.sort().map((f) => ({ name: f, size: statSync(join(firmDir(REFERENCE), 'images', f)).size, inherited: true })),
              ]);
            }

            if (route === 'image' && req.method === 'GET') {
              if (!needSlug(res, slug)) return;
              const fname = decodeURIComponent(name || '');
              let file = join(firmDir(slug), 'images', fname);
              if (!existsSync(file)) file = join(firmDir(REFERENCE), 'images', fname); // geerbt
              if (!file.startsWith(firmsDir) || fname.includes('/') || !existsSync(file)) return fail(res, 404, 'Image missing');
              return send(res, 200, readFileSync(file), TYPES[extname(file).toLowerCase()] || 'application/octet-stream');
            }

            if (route === 'upload' && req.method === 'POST') {
              if (!needSlug(res, slug)) return;
              const { base, ext } = safeName(url.searchParams.get('name') || 'bild.png');
              if (!IMG_EXT.has(ext)) return fail(res, 400, 'Only PNG, JPG, WebP, AVIF, GIF or SVG');
              const dir = join(firmDir(slug), 'images');
              mkdirSync(dir, { recursive: true });
              let file = `${base}${ext}`;
              for (let i = 2; existsSync(join(dir, file)); i++) file = `${base}-${i}${ext}`;
              writeFileSync(join(dir, file), await readBody(req));
              return send(res, 200, { name: file });
            }

            return fail(res, 404, 'Unknown request');
          } catch (e) {
            logger.error(`Configurator: ${e.message}`);
            return fail(res, 500, e.message);
          }
        });

        logger.info('Configurator: http://localhost:' + (server.config.server.port || 4321) + '/configurator');
      },
    },
  };
}
