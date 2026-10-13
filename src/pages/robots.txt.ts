import type { APIRoute } from 'astro';
import { site, previewMode } from '../config/site';

export const GET: APIRoute = () => {
  // Vorschau-Build (NOINDEX=1): alles sperren.
  if (previewMode) return new Response('User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  const body = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /dev/

Sitemap: ${new URL('/sitemap.xml', site.url).href}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
