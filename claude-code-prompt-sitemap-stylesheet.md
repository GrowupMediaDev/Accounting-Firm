# Claude Code Prompt — Sitemap als Tabelle anzeigen (XSL-Stylesheet)

**Kontext:** Astro + Cloudflare Pages, Repo `GrowupMediaDev/beethoven-limousine-service`. Die Sitemap wird über einen eigenen Endpoint generiert (vermutlich `src/pages/sitemap.xml.ts`). Aktuell zeigt der Browser die Sitemap als rohen Text. Ziel: Beim Öffnen von `/sitemap.xml` soll der Browser eine **lesbare Tabelle** mit allen URLs anzeigen.

**Wichtig:** Das ist eine reine Darstellungs-Verbesserung über ein XSL-Stylesheet. Der XML-Inhalt der Sitemap darf sich **nicht** ändern (gleiche URLs, gleiche hreflang-Alternates). Googlebot ignoriert das Stylesheet – kein SEO-Effekt.

Bitte zuerst den Ist-Zustand prüfen (wo wird die Sitemap erzeugt, wie sieht der XML-Header aus), dann umsetzen.

---

## Schritt 1 — XSL-Stylesheet anlegen

Lege die Datei `public/sitemap.xsl` mit folgendem Inhalt an:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="s xhtml">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="de">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Sitemap – Beethoven Limousinen</title>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&amp;family=Manrope:wght@400;600&amp;display=swap" rel="stylesheet"/>
        <style>
          :root { --bg:#0e0e0e; --panel:#161616; --line:#2a2a2a; --text:#e8e6e0; --muted:#9a968c; --gold:#c9a227; }
          * { box-sizing:border-box; }
          body { margin:0; background:var(--bg); color:var(--text);
                 font-family:'Manrope', system-ui, -apple-system, sans-serif; }
          .wrap { max-width:1100px; margin:0 auto; padding:48px 24px 80px; }
          h1 { font-family:'Cormorant Garamond', Georgia, serif; font-weight:600;
               font-size:clamp(28px,4vw,44px); color:var(--gold); margin:0 0 4px; letter-spacing:.5px; }
          .sub { color:var(--muted); font-size:14px; margin:0 0 28px; }
          table { width:100%; border-collapse:collapse; background:var(--panel);
                  border:1px solid var(--line); border-radius:10px; overflow:hidden; }
          thead th { text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:.08em;
                     color:var(--gold); padding:14px 16px; border-bottom:1px solid var(--line); }
          tbody td { padding:12px 16px; border-bottom:1px solid var(--line); font-size:14px; vertical-align:top; }
          tbody tr:last-child td { border-bottom:none; }
          tbody tr:hover { background:rgba(201,162,39,.06); }
          .num { color:var(--muted); width:48px; }
          a { color:var(--gold); text-decoration:none; word-break:break-all; }
          a:hover { text-decoration:underline; }
          .langs { color:var(--muted); font-size:12px; }
          .tag { display:inline-block; border:1px solid var(--line); border-radius:4px;
                 padding:1px 6px; margin:0 4px 4px 0; color:var(--text); }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>Sitemap</h1>
          <p class="sub">
            <xsl:value-of select="count(s:urlset/s:url)"/> URLs · beethovenlimousinen.at
          </p>
          <table>
            <thead>
              <tr>
                <th class="num">#</th>
                <th>URL</th>
                <th>Sprach-Alternativen</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="s:urlset/s:url">
                <tr>
                  <td class="num"><xsl:value-of select="position()"/></td>
                  <td>
                    <a href="{s:loc}"><xsl:value-of select="s:loc"/></a>
                  </td>
                  <td class="langs">
                    <xsl:for-each select="xhtml:link">
                      <span class="tag"><xsl:value-of select="@hreflang"/></span>
                    </xsl:for-each>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
```

> Hinweis: Falls die Sitemap kein einfaches `<urlset>`, sondern einen Sitemap-Index (`<sitemapindex>`) verwendet, sag Bescheid bzw. passe das Template entsprechend an. Nach aktuellem Stand ist es ein einzelnes `urlset`.

---

## Schritt 2 — Stylesheet in der Sitemap referenzieren

Finde den Sitemap-Generator (vermutlich `src/pages/sitemap.xml.ts`). Direkt **nach** der XML-Deklaration und **vor** dem `<urlset …>`-Tag muss diese Zeile in den ausgegebenen String eingefügt werden:

```
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
```

Beispielhaft soll der Anfang der ausgegebenen Datei so aussehen:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ...>
```

Die Stylesheet-Zeile ist eine Processing Instruction und gültiges XML – sie verändert den Inhalt für Crawler nicht.

---

## Schritt 3 — Content-Type sicherstellen

Der Browser wendet das Stylesheet nur an, wenn `/sitemap.xsl` mit einem XML-tauglichen Content-Type ausgeliefert wird. Prüfe nach dem Deploy mit den DevTools (Network-Tab), welchen `Content-Type` `/sitemap.xsl` hat. Falls es **nicht** `text/xsl` oder `application/xml` ist (z.B. `text/plain` oder `application/octet-stream`), ergänze in `public/_headers`:

```
/sitemap.xsl
  Content-Type: text/xsl; charset=utf-8
```

---

## Schritt 4 — Testen

1. `npm run build` ausführen und sicherstellen, dass der Build durchläuft.
2. In der Vorschau/dem Deploy `/sitemap.xml` im Browser öffnen (Google-Translate-Overlay ggf. schließen) → es sollte jetzt die Tabelle erscheinen, Links klickbar.
3. Gegenprüfen, dass die Sitemap weiterhin **gültiges XML** ist (z.B. „Quelltext anzeigen" / View Source) und alle URLs inkl. hreflang-Alternates unverändert vorhanden sind – insbesondere `chauffeurservice-wien` und `chauffeur-service-vienna`.

**Abschluss:** Zusammenfassung der Änderungen + Commit mit aussagekräftiger Message.
