import type { APIRoute } from 'astro';
import { site } from '../config/site';

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /dev/

Sitemap: ${new URL('/sitemap.xml', site.url).href}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
