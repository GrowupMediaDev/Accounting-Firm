# FORMS.md

Formular- und Backend-Standard fuer dieses Projekt. Enthaelt **Prinzipien und
Struktur**, keine projektspezifischen Keys, Domains oder Adressen. Konkrete
Werte leben in Env-Variablen bzw. im Code, nie hier.

Referenz-Setup: zwei Formulare (Kontakt, Buchung) ueber Cloudflare Pages
Functions an Resend, abgesichert mit Turnstile und Honeypot.

---

## 1. Architektur

- **Kontaktformular** und **Buchungsformular** posten je auf eine eigene
  Cloudflare Pages Function unter `functions/`.
- Versand transaktionaler Mails ueber **Resend**.
- Bot-Schutz: **Cloudflare Turnstile** (serverseitig geprueft) plus verstecktes
  Honeypot-Feld `_gotcha` (ist es gefuellt, wird still verworfen).
- Die Functions werden **eigenstaendig gehalten**, kein geteiltes Modul. Marken-
  und Absender-Konstanten stehen oben in jeder Function und werden synchron
  gehalten. Lieber leichte Dopplung als eine fragile gemeinsame Abhaengigkeit.

## 2. Mails pro Formular

Jedes Formular loest zwei Mails aus:

- **Interne Benachrichtigung** (an das Postfach der Agentur/des Kunden), immer DE.
  `reply_to` = E-Mail des Absenders, damit direkt geantwortet werden kann.
- **Kundenbestaetigung** an den Absender, Sprache nach dem `lang`-Feld des
  Formulars (DE oder EN).

## 3. Env-Variablen

| Variable | Typ | Wann |
|---|---|---|
| `PUBLIC_TURNSTILE_SITE_KEY` | Plaintext, Build-time | ins HTML inlined |
| `TURNSTILE_SECRET_KEY` | Secret, Runtime | nur in der Function |
| `RESEND_API_KEY` | Secret, Runtime | nur in der Function |

- Alle erwarteten Variablen stehen (nur mit Namen) in `.env.example`.
- **Secrets nie ins Repo.** Nur in den Cloudflare-Env-Einstellungen.
- **Keys nie zwischen Projekten kopieren.** Jedes Projekt hat eigene Keys.

## 4. Lokale Entwicklung

- Die Functions laufen **nicht** in `astro dev`, nur auf der deployten
  Cloudflare-Site (oder via `wrangler pages dev`). Formular-Tests also gegen die
  Preview/Deploy-Umgebung, nicht gegen den lokalen Dev-Server.

## 5. Testschritte (nur live/Preview)

1. Formular absenden, gueltige Turnstile-Loesung. Beide Mails kommen an.
2. Honeypot `_gotcha` per DevTools fuellen und senden. Keine Mail, kein Fehler.
3. Ungueltiges/leeres Turnstile-Token. Serverseitig abgelehnt.
4. `reply_to` der internen Mail zeigt auf die Absender-Adresse.
5. `lang=en` gesetzt. Kundenbestaetigung kommt auf Englisch.

## 6. Konventionen

- ⚠️ Placeholders: `TODO`-Werte (Absenderadresse, Empfaenger, Markenname) vor
  dem ersten Deploy setzen.
- Kein Secret im Client-Code. `grep -rn "re_[A-Za-z0-9]" src/ functions/` muss
  leer sein (der seo-check prueft das mit).
