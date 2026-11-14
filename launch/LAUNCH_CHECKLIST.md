# Launch-Checkliste (Einzelentwickler)

Stand der Recherche: 26.10.2026. Preise und Regeln ändern sich: vor jeder Zahlung auf den offiziellen Seiten gegenprüfen.
Mit `[ ]` abhaken. Alle Platzhalter (`[COMPANY]`, `[EMAIL]`, `[DATE]`, `com.yourcompany.fitness`, `TODO_...`) sind von dir zu ersetzen.

## 0. Stand vor dem Release (ehrlich)

**Die App wurde noch nie auf einem Gerät gestartet.** Geprüft wurden nur: TypeScript-Syntax der geänderten Dateien, die reine Logik (Coach, Templates, Ziele) und das SQL-Schema/die Credits-/Themen-Regeln auf PostgreSQL 16. Nicht geprüft: alle Screens, Navigation, Kauf, Edge Functions, Kamera.

Bereits im Code vorhanden (kein Handlungsbedarf, nur testen):
- [x] KI-Einwilligung vor dem ersten Form Check (`FormCheckScreen`)
- [x] Passwort vergessen (Login)
- [x] Konto löschen in der App + Hinweis, dass das Abo selbst gekündigt werden muss
- [x] Freunde entfernen, **blockieren und melden** (Profil > Menü; Meldungen landen in der Tabelle `user_reports`)
- [x] Sharing standardmäßig aus, mit Einwilligungsdialog
- [x] Terms/Privacy-Links in Paywall, Settings und Onboarding (erscheinen nur, wenn die URLs gesetzt sind)
- [x] Tageslimit Form Check Standard 5 (Premium)

**Noch offen, vor dem Store-Release zu lösen:**
- [ ] **Erster echter Test** (README "Testing on an iPhone"): `npx tsc --noEmit`, `npx expo-doctor`, Expo Go, alle Screens durchklicken, Fehler beheben. Danach Dev-Build, Sandbox-Kauf, Form Check, Konto löschen.
- [ ] **UI ist nur Englisch.** Store-Texte nur auf Englisch veröffentlichen, Deutsch erst nach Lokalisierung.
- [ ] **RevenueCat-Kundendatensatz** wird bei Kontolöschung nicht gelöscht (optional per REST-API nachziehen).
- [ ] **Meldungen bearbeiten:** Supabase Dashboard > Table Editor > `user_reports` regelmäßig ansehen (Versprechen: 24 h), Kontakt-E-Mail in den Store-Angaben eintragen.
- [ ] **Preise:** Premium 7,99 €/Monat und 50 €/Jahr sind im Design gesetzt. Apple bietet feste Preisstufen an (50 € kann 49,99 € werden): im Store anlegen und Paywall-Texte ans Ergebnis anpassen (die Paywall liest den Preis aus RevenueCat, nichts hartcodieren).
- [ ] **Rechtstexte** (`TERMS.md`, `PRIVACY_POLICY.md`) sind Entwürfe von mir, keine Rechtsberatung. Anwalt/Datenschutz prüfen lassen (DSGVO, Körperbilder/Videos als Gesundheitsnähe, KI-Anbieter).
- [ ] **Credits** zählen ab 20 Minuten, Themes ab 30 Minuten (bewusst so entschieden, in den Texten sichtbar halten). Gold nutzt selbst eingegebene Gewichte und gilt nicht rückwirkend.
- [ ] Templates, PR-Ziele und Notizen liegen nur auf dem Gerät (kein Cloud-Sync): bei Gerätewechsel weg. In der Store-Beschreibung nicht als "synchronisiert" bewerben.
- [ ] Aufgenommenes Video/Thumbnails bleiben im App-Cache bis das System aufräumt (Datenschutzerklärung beschreibt das).
- [ ] Premium-Quelle ist doppelt (RevenueCat-Entitlement in der App, `profiles.is_premium` per Webhook auf dem Server): Webhook-Deployment ist Pflicht.

## 1. Rechtliches und Grundlagen (Woche 1)

- [ ] Entscheiden: Privatperson oder Firma. Als Privatperson erscheint dein echter Name als Verkäufer. Firma braucht eine D-U-N-S-Nummer (kostenlos, mehrere Werktage Wartezeit) und Domain-E-Mail.
- [ ] **EU/DSA-Händlerangaben**: Als Anbieter von Abos in der EU musst du in beiden Stores "Trader"-Daten (Anschrift, Telefon, E-Mail) angeben, die öffentlich sichtbar sein können. Eine Impressums-/Firmenadresse bereithalten. (Genaue Regeln im jeweiligen Store prüfen.)
- [ ] Domain und eine einfache öffentliche Webseite (z. B. GitHub Pages, kostenlos) mit: Datenschutz (`PRIVACY_POLICY.md`), Nutzungsbedingungen (`TERMS.md`), Support-E-Mail, Seite "Konto/Daten löschen" (Google verlangt eine Web-URL dafür). Impressum nach deutschem Recht (§ 5 DDG).
- [ ] Datenschutzerklärung und AGB **juristisch prüfen lassen**, Platzhalter ersetzen. AV-Verträge (DPA) mit Supabase, Anthropic, RevenueCat abschließen (jeweils im Dashboard bzw. auf deren Seiten verfügbar), Region des Supabase-Projekts eintragen.
- [ ] App-Namen festlegen (STORE_LISTING.md, Abschnitt 1), Verfügbarkeit in beiden Stores, Marken- und Domain-Recherche.
- [ ] Bundle-ID / Package-Name festlegen (z. B. `com.deinefirma.appname`) und in `app.json` bei `ios.bundleIdentifier` und `android.package` eintragen. **Später nicht mehr änderbar**, sobald veröffentlicht. Außerdem `name` in `app.json` ersetzen ("Fitness" ist zu generisch).

## 2. Konten anlegen

- [ ] **Apple Developer Program**: 99 USD pro Jahr (developer.apple.com/programs). Zwei-Faktor-Auth für die Apple-ID nötig. Freischaltung dauert Stunden bis Tage. Danach in App Store Connect: Vereinbarungen für "Paid Apps" akzeptieren, Bank- und Steuerdaten ausfüllen (sonst keine Abos).
- [ ] Apple **Small Business Program** beantragen (15 % statt 30 % Provision bis 1 Mio. USD Umsatz im Vorjahr; Zahlen laut Drittquelle, bei Apple prüfen).
- [ ] **Google Play Console**: einmalig 25 USD, keine Jahresgebühr. Identitätsprüfung mit Ausweis und Kreditkarte auf deinen Namen (keine Prepaid-Karte). Zahlungsprofil für Abos einrichten.
- [ ] **Expo-Konto** (expo.dev) anlegen, `npm i -g eas-cli`, `eas login`, im Projektordner `eas init` (schreibt `extra.eas.projectId` in app.json: nicht raten, wird erzeugt).
- [ ] **Supabase**, **RevenueCat**, **Anthropic Console** (console.anthropic.com) Konten anlegen.

## 3. Supabase (Backend)

- [ ] Projekt anlegen, Region (EU, wenn deine Nutzer in der EU sind). **Free-Plan pausiert Projekte nach 1 Woche Inaktivität** (laut Supabase-Preisseite): für den Live-Betrieb den **Pro-Plan (ab 25 USD/Monat)** einplanen.
- [ ] `supabase/schema.sql` im SQL-Editor ausführen (komplett, inkl. Teil "Form Check and PR Coach").
- [ ] Auth > Providers > E-Mail: E-Mail-Bestätigung entscheiden. Eigenen **SMTP-Server** (z. B. ein Transaktionsmail-Dienst) einrichten: der Standard-Versand von Supabase ist stark begrenzt und nicht für Produktion gedacht. Absender, Vorlagen anpassen.
- [ ] Edge Functions deployen: `supabase functions deploy form-check` (JWT-Prüfung AN lassen) und `supabase functions deploy revenuecat-webhook --no-verify-jwt`.
- [ ] Secrets setzen: `supabase secrets set ANTHROPIC_API_KEY=... REVENUECAT_WEBHOOK_SECRET=<lange Zufallszeichenkette> FORM_CHECK_DAILY_LIMIT=5` (und optional `CLAUDE_MODEL=...`; Standard im Code ist `claude-sonnet-5-5`).
- [ ] Testen: Konto anlegen, 4. Workout in einer Woche wird blockiert, `delete_my_account` funktioniert, Form-Check-Aufruf ohne Premium liefert 403.
- [ ] Backups/Retention-Dauer nachsehen und in die Datenschutzerklärung eintragen (`[BACKUP_RETENTION]`).

## 4. Anthropic (Form Check)

- [ ] API-Key in der Console erzeugen (nur auf dem Server als Secret, nie in der App).
- [ ] Guthaben aufladen und **monatliches Ausgabenlimit** in der Console setzen (z. B. 20 bis 50 USD am Anfang), damit ein Fehler oder Missbrauch nicht teuer wird.
- [ ] Anthropic-Datenschutz-/Aufbewahrungsseite verlinken (`[ANTHROPIC_PRIVACY_LINK]`) und DPA prüfen. Laut Anthropic werden API-Ein-/Ausgaben standardmäßig innerhalb von 30 Tagen gelöscht (Ausnahmen: Vereinbarung ohne Aufbewahrung, Rechtspflicht, Policy-Verstöße): so steht es im Entwurf.

## 5. RevenueCat und Store-Produkte

- [ ] App Store Connect: App anlegen (Bundle-ID), Abo-Gruppe "Premium", zwei auto-erneuernde Abos (Monat, Jahr), Preise, Lokalisierung, Prüf-Screenshot der Paywall.
- [ ] Google Play Console: App anlegen, **mindestens einen App-Bundle-Upload** (interner Test) nötig, bevor Abos angelegt werden können; Abo "premium" mit Basis-Plänen monatlich und jährlich.
- [ ] RevenueCat: Projekt, iOS-App und Android-App hinzufügen (Store-Zugangsdaten: App Store Connect API-Schlüssel / In-App-Purchase-Key bzw. Google-Service-Account mit Berechtigungen), Produkte importieren.
- [ ] Entitlement **`premium`** (genau dieser Name, siehe `src/context/PremiumContext.tsx`) anlegen, beide Produkte zuordnen. **Current Offering** mit Packages Monthly und Annual.
- [ ] Öffentliche SDK-Schlüssel (`appl_...`, `goog_...`) notieren. Webhook-URL der Edge Function unter Integrations > Webhooks eintragen, Authorization-Header = `REVENUECAT_WEBHOOK_SECRET`.
- [ ] Preise unter Berücksichtigung der Form-Check-Kosten festlegen (Abschnitt 9).

## 6. EAS Build und Umgebungsvariablen

- [ ] `.env` wird **nicht** automatisch in EAS-Builds hochgeladen (und gehört nicht ins Git). Die `EXPO_PUBLIC_*`-Werte als EAS-Umgebungsvariablen anlegen (`eas env:create` bzw. expo.dev > Projekt > Environment variables, Umgebung production + preview + development): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_RC_IOS_KEY`, `EXPO_PUBLIC_RC_ANDROID_KEY`, `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_TERMS_URL`. Niemals den Service-Role-Key oder Anthropic-Key hier ablegen (alles `EXPO_PUBLIC_` steckt in der App).
- [ ] `.gitignore` anlegen/prüfen: `.env`, `google-service-account.json`, `node_modules`.
- [ ] Dev-Build zum Testen: `eas build --profile development --platform android` (bzw. ios). Expo Go reicht nicht (Kamera, Käufe).
- [ ] Versionsverwaltung: `eas.json` nutzt `appVersionSource: remote` + `autoIncrement`. Dann zählt EAS `buildNumber`/`versionCode` selbst hoch; die Werte `1` in `app.json` sind nur Ausgangswerte. Bei Bedarf `eas build:version:set` verwenden. `version` ("1.0.0") ist die sichtbare Versionsnummer, die du selbst erhöhst.
- [ ] Produktions-Builds: `eas build --platform all --profile production` (Android liefert ein AAB, iOS ein IPA).
- [ ] **Datenschutz-Manifest (iOS)**: In `app.json` stehen die üblichen "Required Reason"-Einträge für React Native/Expo (UserDefaults `CA92.1`, FileTimestamp `C617.1`, SystemBootTime `35F9.1`, DiskSpace `E174.1`). Laut Expo-Doku sind das nur Ausgangswerte: nach dem ersten TestFlight-Upload schickt Apple eine E-Mail, falls Gründe fehlen, dann ergänzen. (Unsicher: ob alle vier Einträge für deine Paketversionen nötig sind. Überdeklarieren schadet normalerweise nicht, fehlende Einträge führen zu Warnungen.)
- [ ] Nicht gesetzt, weil unsicher/nicht erratbar: `extra.eas.projectId` (kommt von `eas init`), `ios.appStoreUrl`, Universal-Links/`associatedDomains`, `runtimeVersion`/`updates` (nur nötig bei OTA-Updates), `scheme` (nur bei Deep Links). Android-Berechtigungen sind auf `CAMERA` begrenzt, `RECORD_AUDIO` und Speicherzugriff sind in `blockedPermissions`. Nach dem ersten Build das **Manifest prüfen** (z. B. `eas build:inspect` oder AAB im Play Console Bericht "Berechtigungen"), weil Bibliotheken zusätzliche Berechtigungen hinzufügen können (`INTERNET` ist normal).

## 7. Test: TestFlight und Google Play

**Apple**
- [ ] `eas submit --platform ios --profile production` (vorher `ascAppId` und `appleTeamId` in `eas.json` ersetzen, beide `TODO_...`; die Werte stehen in App Store Connect bzw. im Developer-Konto).
- [ ] TestFlight **Interner Test** (bis 100 Personen, ohne Prüfung) für dich selbst, dann optional externer Test (Beta-Review durch Apple).
- [ ] Sandbox-Kauf mit einem Sandbox-Tester durchspielen (Kauf, Wiederherstellen, Verlängerung läuft im Sandbox-Zeitraffer).

**Google Play: die 12-Tester-Regel**
- Stand laut Google-Hilfe (Support-Artikel 14151465): Für **persönliche** Entwicklerkonten, die **nach dem 13.11.2023** erstellt wurden, ist vor dem Produktionszugang ein **geschlossener Test mit mindestens 12 Testern erforderlich, die mindestens 14 Tage ununterbrochen angemeldet (opted in) sind**. Wer zwischendurch aussteigt und wieder einsteigt, muss die 14 Tage zusammenhängend erfüllen. Danach im Dashboard den Antrag auf Produktionszugang mit Fragen zu Test, App und Produktionsreife ausfüllen. Google antwortet meist innerhalb von etwa 7 Tagen, bei zu wenig Testern/Engagement kann weiter getestet werden müssen. Für Organisationskonten wird die Regel in der gefundenen Quelle nicht genannt: bei Google nachsehen.
- [ ] Plane **mindestens 3 bis 4 Wochen** vor dem gewünschten Android-Release ein (Tester finden, 14 Tage, Prüfung).
- [ ] 12+ Tester sammeln (Freunde, Fitnessstudio, Familie), per E-Mail-Adresse oder Google-Gruppe in die Closed-Testing-Liste eintragen, Opt-in-Link schicken. Mehr als 12 einladen, falls jemand abspringt. Echte Nutzung und Feedback einholen, denn Google fragt danach.
- [ ] `eas submit --platform android --profile production` (erste Abgabe oft manuell: AAB aus EAS herunterladen und in der Console hochladen; `google-service-account.json` erst nach Einrichtung des API-Zugriffs in der Play Console). In `eas.json` steht `track: internal`, `releaseStatus: draft`; für den geschlossenen Test Track auf `alpha` bzw. den Namen deines Tracks ändern.
- [ ] Die Play-Console-Pflichtformulare ausfüllen: Datensicherheit, Inhaltseinstufung, Zielgruppe, Anzeigen (Nein), Health-App-Erklärung, App-Zugriff (Testkonto), Datenlöschung-URL (siehe STORE_LISTING.md).

## 8. Store-Einträge und Einreichung

- [ ] Texte, Keywords, Kategorie aus `STORE_LISTING.md` kopieren (nur die Sprachen, die die App kann).
- [ ] Icon: `assets/icon.png` (1024, ohne Alpha) wird per Expo verwendet. Für Google Play zusätzlich 512x512 PNG exportieren. Feature-Grafik: `launch/feature-graphic.png` (1024x500).
- [ ] 6 Screenshots nach der Liste in STORE_LISTING.md, Seed-Konto mit realistischen Daten, auf echten Geräten oder Simulator in der aktuell geforderten Größe.
- [ ] App-Datenschutz (Apple "Nutrition Labels") und Data Safety (Google) nach STORE_LISTING.md, Abschnitt 5, ausfüllen. Den Teil "Photos/Videos" und die Behandlung der Dienstleister bewusst entscheiden.
- [ ] Testkonto anlegen **und Premium wirklich freischalten** (RevenueCat-Entitlement vergeben **und** `profiles.is_premium = true`; Details in STORE_LISTING.md, Abschnitt 6). Mit sauberer Installation prüfen.
- [ ] Abos in App Store Connect mit der App-Version zur Prüfung einreichen. Paywall muss Preis, Laufzeit, automatische Verlängerung, Restore, Terms und Privacy zeigen.
- [ ] Zuerst App Store Connect "Zur Prüfung einreichen" (Prüfung dauert meist 1 bis 3 Tage), Google erst nach Produktionszugang.
- [ ] Nach dem Release: Anthropic-Verbrauch, Supabase-Last und RevenueCat-Dashboard täglich ansehen (erste Woche).

## 9. Kostenübersicht

### Feste und einmalige Kosten

| Posten | Kosten | Bemerkung |
|---|---|---|
| Apple Developer Program | 99 USD / Jahr | Pflicht für TestFlight und App Store |
| Google Play Console | 25 USD einmalig | keine Jahresgebühr |
| Supabase | Free 0 USD, **Pro ab 25 USD / Monat** | Free pausiert nach 1 Woche Inaktivität (Preisseite), für Live-Betrieb Pro einplanen |
| RevenueCat | 0 USD bis 2.500 USD getrackter Monatsumsatz, danach 1 % | laut revenuecat.com/pricing; ob 1 % auf alles oder nur auf den Überschuss gilt, ist dort nicht eindeutig: nachlesen |
| Expo EAS | Free (begrenzte Builds mit niedriger Priorität) oder Starter 19 USD / Monat | Für Release-Wochen reicht meist Free (Wartezeit) |
| Domain + Webseite | ca. 1 bis 3 EUR / Monat (Annahme) | GitHub Pages ist kostenlos |
| Anwaltliche Prüfung | individuell | nicht geschätzt |
| Store-Provision | Apple 15 % (Small Business Program) oder 30 %; Google je nach Markt etwa 15 % auf Abos | Quellen sekundär, bei Apple und Google prüfen |
| Anthropic | nutzungsabhängig, siehe unten | Prepaid-Guthaben |

### Kosten pro Form Check (konservativ)

Quellen/Annahmen:
- Preis **Claude Sonnet 5.5: 2,00 USD pro 1 Mio. Eingabe-Tokens, 10,00 USD pro 1 Mio. Ausgabe-Tokens** (zwei Preisaggregatoren, Stand 26.10.2026; die offizielle Anthropic-Seite war in dieser Umgebung nicht abrufbar. **Bitte auf anthropic.com/pricing gegenprüfen**). Das ist das Standardmodell im Code (`CLAUDE_MODEL` überschreibbar).
- 5 Standbilder pro Analyse (`FRAME_COUNT = 5` in `src/lib/formCheck.ts`; Server erlaubt bis 6). Annahme: bis zu **2.000 Eingabe-Tokens pro Bild** (typisch ca. Breite x Höhe / 750 bei Hochformat-Frames, nach Skalierung; Annahme, nicht gemessen) = 10.000. Dazu System-Prompt und Text ca. 700 Tokens. Summe **ca. 10.700 Eingabe-Tokens**.
- Ausgabe: Obergrenze im Code `max_tokens: 1200`. Konservativ 1.200 Tokens, realistisch eher 400 bis 600.
- Rechnung: 10.700 x 2 / 1.000.000 = 0,0214 USD plus 1.200 x 10 / 1.000.000 = 0,0120 USD = **ca. 0,033 USD (3,3 Cent) pro Analyse**, realistisch ca. 2,5 bis 3 Cent. Keine Caching- oder Batch-Rabatte angenommen. Plane mit **3,5 Cent**.

| Nutzung pro Premium-Nutzer | Kosten Anthropic |
|---|---|
| 4 Analysen pro Monat (1 pro Woche) | ca. 0,14 USD |
| 12 Analysen pro Monat (3 pro Woche) | ca. 0,42 USD |
| 30 Analysen pro Monat (täglich) | ca. 1,05 USD |
| Maximum bei Tageslimit 10 (300 pro Monat) | ca. 10,50 USD |

Bewertung: Bei einem Abopreis von z. B. 5 USD pro Monat und 15 % Store-Provision bleiben ca. 4,25 USD. Typische Nutzer kosten Cent-Beträge, aber ein Dauernutzer am Tageslimit 10 kann mehr kosten, als er einbringt. Gegenmaßnahmen: `FORM_CHECK_DAILY_LIMIT` auf 3 bis 5 setzen, ggf. Monatslimit ergänzen, Ausgabenlimit in der Anthropic-Console setzen. Fehlgeschlagene Versuche zählen im Code schon gegen das Tageslimit, kosten aber nicht immer API-Geld (Fehler vor dem API-Aufruf kosten nichts).

### Beispiel: erstes Jahr (ohne Anwalt, ohne Provision)

Apple 99 + Google 25 + Supabase Pro 12 x 25 = 300 + Domain ca. 25 + Anthropic ca. 20 bis 100 (Tests, wenige Nutzer) = **ca. 470 bis 550 USD**. Mit EAS Starter zusätzlich 228 USD (optional).

## 10. Reihenfolge in Kurzform

1. Lücken aus Abschnitt 0 schließen, App auf dem Gerät testen.
2. Konten und Rechtliches (Abschnitte 1 und 2), Webseite mit Datenschutz/AGB live.
3. Supabase, Anthropic, RevenueCat, Produkte einrichten (3 bis 5).
4. EAS-Builds, TestFlight, **Google Closed Test mit 12 Testern starten (14 Tage laufen lassen)**.
5. Store-Einträge, Datenschutzfragebögen, Testkonto.
6. Einreichen (Apple), Produktionsantrag (Google), danach Monitoring.
