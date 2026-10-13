import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import configurator from './integrations/configurator/index.mjs';

// Aktives Kanzlei-Profil (wie src/config/firm.ts): FIRM=… oder src/firms/active.json.
const firmSlug = process.env.FIRM || JSON.parse(readFileSync(new URL('./src/firms/active.json', import.meta.url), 'utf8')).firm;
const firm = JSON.parse(readFileSync(new URL(`./src/firms/${firmSlug}/firm.json`, import.meta.url), 'utf8'));

export default defineConfig({
  site: firm.seo?.url || 'https://example.com',
  output: 'static',
  // Konfigurator (/konfigurator) haengt sich nur an den Dev-Server.
  integrations: [configurator()],
  vite: {
    plugins: [tailwindcss()],
  },
});
