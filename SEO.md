# SEO.md

SEO-Architektur und -Regeln für dieses Projekt. Enthält **Prinzipien**, keine
Daten. Konkrete Seiten, Slugs, Keywords und Fahrzeuge leben im Code, nie hier.

Was hier steht, gilt immer. Was ein Skript prüfen kann, prüft `seo-check.mjs`
(mechanisch, beim Build). Was Urteil braucht (Ist der Text gut?), prüft
`SEO-REVIEW.md` (auf Abruf, nach dem Onpage-SEO).

---

## 1. Routen-Registry (das Fundament)

Eine zentrale Registry ist die einzige Quelle für alle Routen:

```ts
routes: Record<PageKey, { de: string; en: string }>
```

- Jede Seite hat einen `pageKey`. Dieser Key verbindet alles: Routing, Schema,
  robots, Breadcrumb, interne Links.
- **DE ist Pflicht, EN ist optional.** Websites entstehen zuerst komplett auf
  Deutsch; die EN-Version kommt später. Eine reine DE-Seite ist erlaubt und
  darf den Build **nicht** brechen.
- Sobald eine Seite ein EN-Pendant hat, sind DE und EN über den `pageKey`
  gekoppelt. Fehlt EN, wird für diese Seite kein EN-Slug und kein hreflang
  ausgegeben. Der EN-Abgleich ist höchstens eine **Warnung** oder ein
  Go-Live-Check, nie ein Build-Fehler während der DE-Bauphase.
- Interne Links werden ausschließlich über `localizedPath(key, locale)`
  erzeugt. Nie ein roher `<a href="/…">`-String – weder im Markup noch in
  Content-Daten. Sonst driften DE- und EN-Version bei jeder Slug-Änderung
  auseinander.
- DE/EN-Kopplung läuft über den `pageKey`/Index, **nie** über String-Matching
  auf URLs. EN-Slugs sind übersetzt, nicht gespiegelt
  (`/flughafentransfer-muenchen/` ↔ `/en/airport-transfer-munich/`) – sie
  haben keine gemeinsame String-Basis.

---

## 2. URL-Struktur: Hub-Spoke (wo es eine Hierarchie gibt)

Nicht jedes Projekt ist hierarchisch. Wo es aber thematische Cluster gibt:

- **Hub** = Übersichtsseite eines Clusters, trägt das breite Haupt-Keyword im
  Slug (`/flughafentransfer-muenchen/`).
- **Spoke** = spezifischer Einzelfall darunter. Der Spoke-Slug trägt **nur den
  Differenzierer**, nicht den Hub-Begriff erneut:
  `/flughafentransfer-muenchen/flughafen-muc/`, nicht
  `…/muc-flughafentransfer/`. Wiederholung = Term-Stuffing, verwässert die
  Signale zwischen Hub und Spoke.
- Standalone-Seiten bleiben flach, keine künstliche Verschachtelung.
- Grundsatz: **ein Rankingziel, eine URL.** Keine zweite Seite für dasselbe
  Keyword – das kannibalisiert die eigene Seite.

### Option: Hub/Leistungsseiten-Split

Nur relevant, wenn die Struktur wie oben hierarchisch aufgebaut ist. Eine reine
Linkgrid-Hub-Seite (nur Links auf Spokes, kein Volltext) **rankt nicht** für
ihr eigenes Haupt-Keyword – Google sieht dort keinen Inhalt. Wenn ein Hub ein
starkes Keyword trägt, aber nur verteilt:

- Content-Rolle und Navigations-Rolle auf zwei URLs trennen: ein
  `noindex,follow`-Linkgrid-Hub **und** eine indexierbare Leistungsseite mit
  Volltext unter eigenem Slug.
- Trägt der Hub kein nennenswertes Suchvolumen, lohnt der Split nicht – dann
  bleibt es ein reiner Linkgrid-Hub.

Das ist eine Option, kein Zwang. Standardfall ist der einfache Hub mit
Volltext.

---

## 3. hreflang & Canonical

- Sobald eine Seite **DE und EN** hat: `hreflang="de"`, `hreflang="en"`,
  `hreflang="x-default"` auf beiden Versionen. Ohne hreflang clustert Google
  die Sprachversionen falsch und sie kannibalisieren sich.
- Eine reine **DE-Seite** (EN noch nicht übersetzt) bekommt **kein** hreflang.
  Sobald das EN-Pendant in der Registry existiert, wird hreflang automatisch
  ergänzt.
- Canonical wird zentral im Layout aus der Registry berechnet, nicht pro Seite
  von Hand.
- `noindex`-Seiten: **kein** hreflang/Canonical ausgeben (das Signal soll der
  indexierbaren Seite zugutekommen). Meta-Title/Description trotzdem setzen –
  falls die Seite später doch indexiert wird.

---

## 4. Schema.org / JSON-LD

Zentral in einer `Schema.astro`-Komponente, `pageKey` → Schema-Typ. Nicht pro
Seite von Hand.

**Zuordnung Seitentyp → Schema-Typ:**

| Seitentyp | Schema-Typ |
|---|---|
| Startseite + Kernseiten | `LocalBusiness` (voll, mit fester `@id`) |
| Leistungsseite | `Service` |
| Fahrzeug-/Flottenseite | `Vehicle` (nur bei echtem Fahrzeug-Datensatz, sonst `Service`) |
| FAQ-Seite | `FAQPage` |
| Tour-/Ausflugsseite | `TouristTrip` |
| Hub mit gleichrangigen Subs | `Service` + `ItemList` |
| Sub-Seite mit Hub-Zuordnung | zusätzlich `BreadcrumbList` |
| jede Seite mit sichtbarem FAQ-Akkordeon | zusätzlich `FAQPage`-Fragment |

**`LocalBusiness` genau einmal** mit fester `@id` (`${site}/#business`) voll
definieren. Alle anderen Seiten referenzieren es via `provider: {"@id": …}`.
Nicht auf jeder Seite den vollen Block duplizieren.

**Zwei Prinzipien, die stärker sind als die Tabelle:**

1. **Schema-Reichweite ≤ Content-Reichweite.** Schema darf nie mehr behaupten,
   als die Seite zeigt. `areaServed` = das tatsächlich beworbene Gebiet, nicht
   werblich auf „ganz Europa" aufgeblasen. Kein `Vehicle`-Schema ohne konkrete
   Fahrzeugdaten. Kein Typ, für den es keinen echten Inhalt gibt.
2. **Schema und sichtbarer Text speisen sich aus derselben Variable.**
   Breadcrumb-Schema aus denselben Strings wie der sichtbare Breadcrumb,
   FAQ-Schema aus denselben Q&A wie das Akkordeon. So können beide nie
   auseinanderlaufen. Das ist die Schema-Version der obersten Regel: eine
   Quelle.

**Breadcrumb-Detail:** Das `BreadcrumbList`-Schema spiegelt exakt den
sichtbaren Breadcrumb. Es zeigt nie auf eine `noindex`-Seite – der Breadcrumb
ist ein Ranking-Signal für die Elternseite; zeigt er auf noindex, verpufft es.

---

## 5. Indexierung & Sitemap

- `noindex` wird zentral über ein `indexable`-Flag pro Seite gesteuert, nicht
  im Markup hartkodiert. Kein Wellen-/Rollout-System: jede Seite ist schlicht
  entweder indexierbar oder nicht.
- Die **Sitemap leitet sich aus dem `indexable`-Flag ab**, ist keine
  Handliste. Was live geht, steht automatisch drin; was `noindex` ist, fehlt
  automatisch. Kein vergessener Eintrag, kein indexierter Entwurf.
- `robots.txt` als API-Route, verweist auf die Sitemap, sperrt interne Pfade
  (Dashboard, Dev-Seiten).
- Entwurfs-/Rechtstexte mit Platzhaltern sind **nie** indexierbar und **nie**
  in der Sitemap.

---

## 6. Meta: Title & Description

Title/Description werden pro Seite gepflegt (zentral im Datensatz), zentral
ins Layout durchgereicht. Layout setzt zusätzlich auf **jeder** Seite –
inkl. Startseite – Canonical, OG (`og:type/title/description/url/image`) und
Twitter-Card mit Defaults. Keine Seite ohne diese Tags.

**Kein `<meta name="keywords">`.** Google ignoriert ihn seit 2009, und er legt
die Keyword-Strategie offen. Recherchierte Keywords sind Input für die
Textproduktion – sie werden nie ins Markup ausgegeben.

**Muster** (nicht Wortlaut – der kommt projektweise):

- *Title:* `{Leistung/Ziel} {Ort} – {Differenzierer}`. Ortsname verankert das
  lokale Keyword und taucht praktisch in jedem Title auf. Wortstellung folgt
  der vermuteten Suchintention (was der Nutzer zuerst eingibt, steht vorn).
- *Description:* `{Leistung} + {konkretes Detail} + {Trust-/Conversion-Signal}`.
  Ein Detail (Distanz, Inklusivleistung) und ein Vertrauenssignal
  (Festpreis, Wartezeit inklusive) schlagen generische Werbefloskeln.

Längen prüft `seo-check.mjs` mechanisch. *Ob* Title und Text gut sind, prüft
`SEO-REVIEW.md`.

---

## 7. Interne Verlinkung (gilt immer, auch ohne Hub)

Interne Verlinkung ist ein eigenständiger Ranking-Hebel, nicht nur ein
Nebenprodukt der Navigation. In fast allen Projekten ist sie die größte
ungenutzte Chance: Seiten hängen nur an Dropdowns, keine redaktionelle
Verlinkung aus dem Fließtext.

Claude Code trifft die **Auswahl** (welche Seite auf welche verweist) pro Seite
selbst – nach diesen Leitplanken. Ein Skript kann das nicht entscheiden, nur
das Mechanische prüfen (Waisenseiten, rohe Links, Ankertext).

**Leitplanken:**

- Verlinke nur zwischen **thematisch verwandten** Seiten – dort, wo ein Nutzer
  von A aus plausibel auch B braucht. Ein zufälliger Link hilft nicht.
- **Ankertext beschreibt das Ziel** („Limousinenservice für Hochzeiten"),
  nie „hier klicken" und nie die nackte URL.
- **Pro Zielseite höchstens ein Link**, beim ersten sinnvollen Vorkommen im
  Text.
- **Richtwert 2–5** redaktionelle Fließtext-Links pro Seite. Mehr verwässert
  die Signale und liest sich schlecht.
- Der Link entsteht nur, wo das Ziel **thematisch ohnehin im Text vorkommt**.
  Kein Satz wird erfunden, nur um einen Link unterzubringen.
- Immer über `localizedPath()`, nie roh.
- **Keine Waisenseiten:** jede wichtige Seite braucht eingehende interne Links.

**Zusätzlich, falls Hub-Spoke-Struktur vorhanden:**

- Der Hub verlinkt auf **alle** seine Spokes (beschreibender Ankertext).
- Jede Spoke verlinkt via Breadcrumb **und** einem Inhaltslink zurück zum Hub.
- Maximale Klicktiefe: jede Seite von der Startseite in **3 Klicks** erreichbar.

---

## 8. Content-Konsistenz

- **Das Template rendert jedes deklarierte Feld.** Kein Pflichtfeld im
  Interface, das im Template nie ausgegeben wird (der klassische Fehler: ein
  `introImage`-Feld auf 60 Seiten gepflegt, aber nie im Markup). `seo-check.mjs`
  prüft das. Das ist eine Konsistenzregel, keine Maximalismus-Regel: *ob* eine
  Seite einen Block haben soll, bleibt inhaltliche Entscheidung.
- **Anti-Kannibalisierung durch Differenzierung.** Zwei Seiten im selben
  Themenfeld müssen unterschiedliche Suchintentionen bedienen und inhaltlich
  klar unterscheidbar sein – URL-Trennung allein reicht nicht. Welche Seite
  welche Intention besetzt, ist eine projektspezifische Entscheidung (gehört
  in den Code/die Keyword-Planung, nicht hierher).
- **Primary-Keyword folgt dem Suchvolumen, nicht der URL-Kosmetik.** Nie ein
  Keyword zum Primary erklären, nur damit URL und Title zusammenpassen. Google
  versteht semantische Relevanz über die URL-Struktur hinweg.

---

## 9. Typografie für SEO-Texte

- **Kein Em-Dash (—)** in Texten. Deutscher **Halbgeviertstrich (–)** ist
  korrekt und bleibt. Die beiden nie verwechseln. `seo-check.mjs` prüft auf
  Em-Dash.
- Einheitliches Title-Trennzeichen im ganzen Projekt (Halbgeviertstrich, bei
  Bedarf Pipe `|` für einen Zusatz). Nicht mischen.
- Umlaute 1:1, kein HTML-Escaping in Content-Daten.

---

## 10. Performance & Bilder

- Bilder über `astro:assets` → WebP, srcset, Lazy-Loading kommen automatisch.
  Keine rohen `<img>` für Inhaltsbilder.
- Hero-Bild: `fetchpriority="high"` + Preload. Alles darunter lazy.
- `public/_headers` mit Cache-Regeln (`/images/*` lang, gehashte `/_astro/*`
  immutable).
- Core Web Vitals im Blick: LCP < 2.5s, INP < 200ms, CLS < 0.1.

---

## 11. Tracking-Setup vor Launch (Checkliste)

- Google Search Console für die Domain
- GA4 mit Conversion-Zielen (Buchungsanfrage, Telefon-Klick, WhatsApp-Klick)
- Google My Business (NAP, Bilder, Beschreibung, Öffnungszeiten)
- Rank-Tracking für die Money-Pages
- Tracking lädt nur mit Consent (falls Tracking eingesetzt wird)

---

## 12. Pre-Launch-Checkliste pro Seite

Das, was der Build nicht automatisch erzwingt, hier zum Durchgehen:

- [ ] Slug folgt der URL-Regel (Spoke trägt nur den Differenzierer)
- [ ] DE- und EN-Variante existieren (erzwingt TypeScript)
- [ ] hreflang de/en/x-default + Canonical (erzwingt Layout)
- [ ] Korrektes Schema.org für den Seitentyp – und der Typ passt semantisch
- [ ] OG + Twitter vorhanden (erzwingt Layout)
- [ ] Interne Verlinkung nach §7 gesetzt, keine Waisenseite
- [ ] Bilder über `astro:assets`
- [ ] Content klar vom Nachbar-Cluster abgegrenzt (Anti-Kannibalisierung)
- [ ] Keine Platzhalter auf indexierbaren Seiten
- [ ] `npm run build` grün (seo-check.mjs)

Was ein Skript nicht sehen kann, steht hier bewusst als menschlicher Prüfpunkt:
ob der Schema-*Typ* semantisch der richtige ist und ob zwei Seiten sich
inhaltlich **genug** unterscheiden. Ein grüner Check ist notwendig, nicht
hinreichend.
