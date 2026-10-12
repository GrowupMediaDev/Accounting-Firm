# Alt-Text-Optimierung (Astro) — Task-Vorlage für Claude Code

> **Verwendung:** Diese Datei nach der On-Page-SEO-Erstellung ins Projekt legen und ihren Inhalt als Auftrag an Claude Code geben. Vor dem Ausführen einmal die **Platzhalter** im Abschnitt "Projekt-Konfiguration" ausfüllen. Der Rest ist wiederverwendbar.

---

## Projekt-Konfiguration (vor jedem Lauf ausfüllen)

> Alle Werte in `<...>` durch die projektspezifischen Angaben ersetzen. Gilt für beliebige Astro-Projekte (ein- oder mehrsprachig).

- **Projektordner (Astro-Root):** `<z.B. astro-site/ oder ./ >`
- **Bildverzeichnis(se):** `<z.B. src/assets/images/ und/oder public/>`
- **Sprachen:** `<z.B. einsprachig DE  |  DE (Root) + EN (/en/)  |  andere Kombination>`
- **Seiten-Priorität (wichtigste zuerst — bestimmt, welche Seite bei mehrfach genutzten Bildern "gewinnt"):**
  - Prio 1: `<Homepage, wichtigste Money-/Conversion-Seiten>`
  - Prio 2: `<mittlere Seiten>`
  - Prio 3: `<Trust-/Infoseiten>`
  - Prio 4 / Quick-Win: `<Detail-/Rechtsseiten>`
- **Primärkeyword je Seite:** `<aus der On-Page-SEO-Datei / Keyword-DB des Projekts übernehmen>`
- **Logo-Alt (bleibt Marke, nicht mit Keywords aufladen):** `<Firmenname> Logo`

> Falls das Projekt **einsprachig** ist: die Hinweise zu `/<lang>/`-Seiten und sprachabhängigen Alts im Auftrag einfach ignorieren (Claude Code erkennt anhand der Struktur, dass es nur eine Sprache gibt).

---

## Auftrag an Claude Code

```
Work autonomously. Do not ask for confirmation, permission or clarification. Look at the actual image files, implement and verify yourself. Report only at the end.

# Ziel
Optimiere die Alt-Texte aller gerenderten Bilder im Astro-Projekt (siehe Projekt-Konfiguration oben). Grundprinzip: Jede Bilddatei bekommt EINEN Alt-Text, optimiert auf die WICHTIGSTE Seite, auf der das Bild vorkommt. Kommt dasselbe Bild auf mehreren Seiten vor, gewinnt die höher priorisierte Seite; die weniger wichtige Seite übernimmt denselben Text (kein zweiter, abweichender Alt für dasselbe Bild).

# WICHTIGSTE REGEL: Alt-Text muss das Bild BESCHREIBEN
Sieh dir JEDE Bilddatei tatsächlich an (öffne/betrachte die Datei als Bild), bevor du ihren Alt-Text schreibst. Der Alt-Text muss zuerst korrekt beschreiben, was auf dem Bild zu sehen ist, und das Keyword natürlich einbauen. NIEMALS Keyword-Stuffing, das nicht zum Bildinhalt passt (ein Foto von Fahrzeug A darf nicht nach Leistung B benannt werden). Wenn Keyword und Bildinhalt nicht zusammenpassen, hat die korrekte Beschreibung Vorrang und das Keyword wird nur eingebaut, soweit es natürlich passt. Alt-Texte in der Sprache der Seite (Standard-Sprache auf Standard-Seiten, Zweitsprache auf /<lang>/-Seiten). Keine Em-Dashes. Länge idealerweise unter ~125 Zeichen.

# Vorgehen (Schritt für Schritt)
1. Erstelle zuerst ein Inventar: Durchsuche alle Seiten (src/pages, inkl. Sprachunterordner) und Komponenten (src/components) nach Bildern (<Image>, <img>, getImage(), inhaltsrelevante Hintergrundbilder). Notiere pro EINDEUTIGER Bilddatei: auf welchen Seiten sie vorkommt, aktueller Alt-Text, ob der Alt-Text pro Seite überschreibbar ist (Page-Prop) oder komponentengebunden (überall gleich).
2. Bestimme pro Bild die "Heimseite" nach der Seiten-Priorität aus der Projekt-Konfiguration.
3. Sieh dir jede Bilddatei an und schreibe den Alt-Text: beschreibend + Primärkeyword der Heimseite, natürlich eingebaut.

# Sonderfälle
- KOMPONENTENGEBUNDENE Alts (z.B. ein Karussell/Section-Component, das auf vielen Seiten mit identischem Alt erscheint): NICHT auf den Komponenten-Kontext optimieren, sondern auf das Motiv/die Heimseite des Bildes. Diese Alts müssen weiterhin sprachabhängig über den bestehenden Sprachmechanismus der Komponente ausgegeben werden.
- MEHRFACHNUTZUNG DERSELBEN DATEI AUF EINER SEITE: pro Bilddatei genau EIN Alt-Text, nicht pro Instanz variieren.
- HERO-/SLIDER mit mehreren Bildern, die sich technisch einen Alt-Text teilen: erweitere die Props so, dass JEDES Bild seinen eigenen, das Motiv beschreibenden Alt-Text bekommt (Verhalten/Design/Autoplay unverändert).
- THEMENFREMD wiederverwendetes Bild (dieselbe Datei auf inhaltlich unterschiedlichen Seiten): Heimseite = die höher priorisierte/inhaltlich passendere Seite; die andere Seite übernimmt denselben Text.
- LOGO: bleibt Markenname (siehe Projekt-Konfiguration), nicht mit Service-Keywords aufladen.
- REIN DEKORATIVE Bilder (z.B. Hintergrund hinter dunklem Overlay + Text, wo die Bildaussage nicht relevant ist und die Info bereits im Text steht): alt="" ist zulässig. Je Fall sinnvoll entscheiden und im Report kennzeichnen.
- NICHT verwendete Assets (nicht importiert/gerendert): ignorieren, kein Alt nötig.

# NACHWEISPFLICHT: Bild-Betrachtung dokumentieren
Für JEDE Bilddatei, die du bearbeitest, musst du sie zuerst mit deinem Read-/View-Tool tatsächlich als Bild öffnen und ihren visuellen Inhalt erfassen. Führe darüber Buch. Im Report muss pro Bild eine Spalte "gesehen?" stehen mit einem dieser Werte:
- JA + ein konkretes visuelles Detail, das NICHT aus dem Dateinamen ableitbar ist (z.B. Farbe, Perspektive, Tageszeit, sichtbarer Text/Schild, Anzahl Personen, Bildkomposition). Dieses Detail ist dein Beweis, dass du das Bild wirklich gesehen hast.
- NEIN + Grund (Datei nicht lesbar, Format nicht unterstützt, Tool-Fehler). Wenn ein Bild nicht betrachtet werden konnte, schreibe seinen Alt-Text NICHT auf Verdacht, sondern markiere ihn als "unbestätigt" und liste ihn separat auf.

Am Ende des Reports zwingend:
- Gesamtzahl der zu bearbeitenden Bilder
- Wie viele davon tatsächlich visuell betrachtet wurden (mit Detail-Beweis)
- Vollständige Liste aller Bilder, die NICHT betrachtet werden konnten (falls vorhanden), mit Grund
- Falls 100% betrachtet: explizite Bestätigung "Alle X Bilder wurden visuell betrachtet und beschrieben."

Wenn du feststellst, dass dein Tooling Bilder technisch gar nicht als Bild lesen kann, brich NICHT still ab und rate NICHT anhand der Dateinamen, sondern melde das klar im Report, damit ein alternativer Weg gewählt werden kann.

# Rahmen
- Nur Alt-Texte (und die dafür nötige minimale Prop-Erweiterung z.B. beim Hero-Slider). Keine anderen Änderungen, kein Design, keine Bilder tauschen.
- Keine neuen Dependencies.
- Keine Em-Dashes in sichtbaren Texten.

# Verifikation (im gebauten dist/)
- rm -rf dist && npm run build fehlerfrei.
- Kein gerendertes Bild mit leerem Alt AUSSER bewusst dekorativen.
- Slider-/Hero-Bilder haben individuelle Alt-Texte (nicht alle denselben).
- Stichprobe: mindestens ein zuvor keyword-lastiger Alt beschreibt jetzt tatsächlich das Bild.
- Em-Dash-Check = 0.

# Report
Tabelle: Bilddatei -> gesehen? (JA/NEIN + Detail-Beweis) -> neuer Alt-Text (pro Sprache) -> Heimseite. Plus: geänderte Dateien, Liste dekorativer alt="", Nachweis-Zusammenfassung (X/Y betrachtet), Build-Status.
```

---

## Checkliste nach dem Lauf (manuell prüfen)

- [ ] Report zeigt für **jedes** Bild ein konkretes visuelles Detail (Beweis, dass es gesehen wurde).
- [ ] Kein Bild in der "nicht betrachtet"-Liste (oder: alternative Klärung für die betroffenen).
- [ ] Stichprobe im Browser: 2-3 Bilder auf den wichtigsten Seiten, Alt-Text passt zum Bild und trägt das Keyword natürlich.
- [ ] Slider-/Hero-Bilder haben unterschiedliche Alt-Texte.
- [ ] Sprache korrekt (Standard-Seiten Standard-Sprache, /<lang>/-Seiten Zweitsprache).
- [ ] Build fehlerfrei, keine Em-Dashes.
