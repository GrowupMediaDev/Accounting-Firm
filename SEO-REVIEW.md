# SEO-REVIEW.md

Qualitativer Onpage-Review. **Auf Abruf**, nach dem Onpage-SEO, nicht beim Build.
Waehrend `seo-check.mjs` nur Mechanisches prueft (Laengen, rohe Links, Em-Dash),
beantwortet dieser Review die Frage, die ein Skript nicht kann: **Ist der Inhalt
gut?**

So einsetzen: diesen Review pro Seite oder pro Cluster durchlaufen lassen
(als Prompt an Claude Code oder Claude), Ergebnis ist eine Bewertung plus
konkrete Verbesserungen, keine automatische Aenderung.

---

## Rubrik (pro Seite bewerten)

**1. Title**
- Trifft er die vermutete Suchintention? Steht das Haupt-Keyword vorn?
- Ort verankert? Unterscheidbar von den Nachbarseiten?
- Laenge im brauchbaren Bereich (grob 50–60 Zeichen)?

**2. Description**
- Enthaelt sie ein konkretes Detail (Distanz, Inklusivleistung) UND ein
  Trust-/Conversion-Signal (Festpreis, Wartezeit inklusive)?
- Kein generischer Werbesprech? Laenge grob 140–160 Zeichen?

**3. H1 und Struktur**
- Genau eine H1, deckt sich mit der Suchintention?
- Sinnvolle H2/H3-Hierarchie, antwortfaehig (klare Absaetze, Q&A wo passend)?

**4. Content**
- Beantwortet die Seite die Nutzerfrage frueh (answer-first)?
- Klar abgegrenzt von der Nachbarseite im selben Cluster
  (Anti-Kannibalisierung), oder ueberschneiden sich die Intentionen?
- Keyword-Abdeckung ohne Stuffing? Primary folgt dem Suchvolumen?

**5. Interne Verlinkung**
- 2–5 redaktionelle Fliesstext-Links auf thematisch verwandte Seiten?
- Beschreibender Ankertext, kein "hier klicken"? Keine Waisenseite?

**6. FAQ (falls vorhanden)**
- Echte Kundenfragen? Antworten eigenstaendig verstaendlich?

## Ausgabeformat

Pro Seite:
- **Urteil:** gut / brauchbar / ueberarbeiten
- **Staerken:** 1–2 Punkte
- **Konkrete Verbesserungen:** nummeriert, umsetzbar (nicht "besser machen",
  sondern was genau)

## Abgrenzung

- Keine Aenderung an Slugs/URLs hier (das ist Architektur, siehe SEO.md).
- Keine mechanischen Punkte doppeln, die schon `seo-check.mjs` faengt.
