// Sitemap-Endpoint. Leitet sich AUS dem indexable-Flag der Registry ab,
// keine Handliste. Gibt die Stylesheet-Zeile aus (Tabellen-Ansicht via sitemap.xsl).
// EN-URLs erscheinen nur, wenn ein EN-Slug existiert.
import type { APIRoute } from 'astro';
import { site } from '../config/site';
import { routes, localizedPath, hasEN, type PageKey } from '../config/routes';

export const GET: APIRoute = () => {
  const keys = (Object.keys(routes) as PageKey[]).filter((k) => routes[k].indexable);

  const entries: string[] = [];
  for (const k of keys) {
    const de = new URL(localizedPath(k, 'de'), site.url).href;
    const alternates = hasEN(k)
      ? [
          `<xhtml:link rel="alternate" hreflang="de" href="${de}"/>`,
          `<xhtml:link rel="alternate" hreflang="en" href="${new URL(localizedPath(k, 'en'), site.url).href}"/>`,
          `<xhtml:link rel="alternate" hreflang="x-default" href="${de}"/>`,
        ].join('')
      : '';

    entries.push(`<url><loc>${de}</loc>${alternates}</url>`);
    if (hasEN(k)) {
      const en = new URL(localizedPath(k, 'en'), site.url).href;
      entries.push(`<url><loc>${en}</loc>${alternates}</url>`);
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
