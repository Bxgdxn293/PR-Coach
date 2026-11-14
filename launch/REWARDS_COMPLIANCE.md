# Compliance-Prüfung: Kredite, Einladungen, Verschenken, Freunde

Stand der Recherche: 26.10.2026. Entwurf, **keine Rechtsberatung**. Die Store-Regeln ändern sich häufig; vor dem Einreichen die verlinkten Originalseiten erneut lesen.

## 0. Gegenstand und Ehrlichkeits-Hinweis

Geprüft wird die geplante Mechanik (nur Dokumentation, noch nicht im Code):

- **Kredite:** Sammeln durch qualifizierende Trainings (mind. 20 Min und 3 Sätze, max. 1 pro Tag, 3 Trainings pro Woche = 10 Kredite). Einsatz: Form-Check 20 Kredite (Premium braucht keine Kredite, hat Tageslimit). Kein Geldwert, nicht kaufbar, nicht auszahlbar, nur an akzeptierte Freunde verschenkbar (max. 20 pro 24 h), bei Missbrauch entziehbar. Dauer und Sätze sind selbstberichtet.
- **Einladungen:** Code, Einlösen bis 7 Tage nach Anmeldung, 3 qualifizierende Trainings in den ersten 14 Tagen, dann 400 Kredite für den Einladenden (max. 5 belohnte Einladungen pro 30 Tage).
- **Freunde:** eindeutiger Benutzername, Anfragen per Username/Code, nur akzeptierte Freunde sehen Serie, Trainingstage, Farbdesign, PRs und Workouts mit Gewichten; **Teilen standardmäßig aus**, Start erst nach ausdrücklicher Bestätigung (Dialog beim ersten Freund), widerrufbar in den Einstellungen; entfernen/blockieren; Löschung entfernt alles.
- **Design:** blaues Design nach 4 Wochen in Folge mit je 3 qualifizierenden Trainings.

**Was ich verifiziert habe und was nicht** (Details in Abschnitt 5):

| Quelle | Status |
|---|---|
| Apple App Review Guidelines (UK-Version, Abschnitte 1.2, 3.1.1, 3.2.2, 4.8, 5.1.1(v), 5.1.2(i)) | Wörtlich abgerufen. Seite zeigt "Last Updated: 8 June 2026". |
| Apple "Offering account deletion in your app" (Hilfeseite zu 5.1.1(v)) | Abgerufen, ohne Datum. |
| Google Play Richtlinie "User Generated Content" | Abgerufen; **die Seite liefert nur eine Zusammenfassung ohne Datum** und sagt selbst, dass die vollständige Richtlinie Vorrang hat. Zu **Benutzernamen** enthält sie nichts. |
| Google Play "App-account deletion requirements" | Abgerufen. Fristen auf der Seite stammen von 2023/2024, aktuelle Verschärfungen nicht geprüft. |
| Google Play Zahlungsrichtlinie (Payments), Metadata-/Bewertungs-Anreize, Health-Apps-Richtlinie | **Nicht abrufbar** (URL in dieser Umgebung gesperrt). Aussagen dazu sind Allgemeinwissen aus meinem Training und **nicht verifiziert**. |
| DSGVO Art. 9 / Rechtsprechung | Nur über eine Sekundärquelle (Anwaltsblog) und Suchtreffer geprüft, nicht über die Urteilstexte. |
| Apple "4.x Social" | Es gibt in dem abgerufenen Text keinen eigenen Abschnitt "4.x Social". Die soziale Regelung steht in **1.2** (UGC / Social Networking). In Abschnitt 4 fand ich nur 4.8 (Login-Dienste) im gelesenen Teil; **4.1, 4.2 und die übrigen 4.x habe ich nicht gelesen** (der abgerufene Text war gekürzt und ein Teil nicht ausgewertet). |

## 1. Gesamtbild (Ampel)

| Thema | Apple | Google Play | Kurzbegründung |
|---|---|---|---|
| Kredite nur durch Training verdienbar, nicht kaufbar | **Grün** | **Grün** (unverifiziert) | Keine Zahlung, daher kein IAP-Zwang. Nur sicher, solange es nie einen Kauf-Pfad gibt (auch nicht extern). |
| Kredite schalten Form-Check frei (sonst Premium-Funktion) | **Gelb** | **Gelb** (unverifiziert) | 3.1.1 verbietet "eigene Mechanismen" zum Freischalten kostenpflichtiger Funktionen. Hier ist es verbrauchbare Nutzung gegen Aktivität, kein Lizenzschlüssel. Vermutlich ok, aber Auslegungssache. |
| Einladungs-Belohnung (400 Kredite) | **Gelb** | **Gelb** | Keine Geld-/Gutscheinprämie, an echte Nutzung gekoppelt. Risiko: Spam, Mehrfachkonten, Gleichsetzung mit Premium-Ersatz (400 Kredite = 20 Form-Checks). |
| Verschenken von Krediten | **Gelb** | **Gelb** | 3.1.1 regelt Geschenke nur für IAP-fähige Artikel. Verschenken verdienter Punkte ist nicht ausdrücklich geregelt. Hauptrisiko ist Handel/Verkauf außerhalb der App. |
| Freunde mit Benutzernamen | **Rot bis Gelb**, solange Melden/Blockieren fehlt | **Rot bis Gelb**, solange Melden/Blockieren fehlt | Das ist soziale Funktion mit nutzererzeugten Namen, 1:1-Interaktion. Apple 1.2 und Google UGC verlangen Filter, Melden, Blockieren, Kontakt. |
| Training/Gewichte für Freunde sichtbar | **Gelb** | **Gelb** | Datenschutz: ausdrückliche Einwilligung, Labels, Löschung. Nicht Store-Verbot, aber Prüf- und DSGVO-Risiko. |
| Kontolöschung inkl. Freundschaften | **Pflicht** | **Pflicht** (App + Web-Link) | Muss alles Gesharte mit löschen. |

## 2. Apple App Store

### 2.1 Guideline 3.1.1 In-App-Käufe (Kredite, Einladungen, Verschenken)

Relevanter Wortlaut (Apple, UK-Version, wörtlich):

- "If you want to unlock features or functionality within your app (by way of example: subscriptions, in-game currencies, game levels, access to premium content or unlocking a full version), you must use in-app purchase. Apps may not use their own mechanisms to unlock content or functionality, such as licence keys, augmented reality markers, QR codes, cryptocurrencies and cryptocurrency wallets, etc."
- "Any credits or in-game currencies purchased via in-app purchase may not expire, and you should make sure you have a restore mechanism for any restorable in-app purchases."
- "Apps may enable gifting of items that are eligible for in-app purchase to others. Such gifts may only be refunded to the original purchaser and may not be exchanged."
- 3.2.2(x): "Apps may otherwise incentivise users to take specific actions within apps (e.g. completing a level, watching an ad)."

Bewertung:

1. **Verdiente, nicht kaufbare Kredite:** Die 3.1.1-Währungsregeln (Nicht-Verfall, Wiederherstellen) beziehen sich auf **per In-App-Kauf erworbene** Kredite. Eure Kredite werden nicht gekauft. Das Verdienen für Aktionen in der App ist durch 3.2.2(x) gedeckt ("incentivise users to take specific actions within apps"). **Grün**, mit der Bedingung unten.
2. **Wichtigste Bedingung:** Es darf **nie** einen Weg geben, Kredite gegen Geld zu bekommen: weder In-App noch per Link/Webshop/Spende, noch durch "Belohnung für Kauf eines Abos". Sonst wären es In-App-Währungen, die über IAP laufen müssen (und dann nicht verfallen dürfen). Auch Verschenken gegen Geld unter Nutzern (Handel) müsst ihr in den Bedingungen verbieten, siehe `TERMS.md` 5a/7a.
3. **Gelbes Risiko "Umgehung des Premium-Abos":** Form-Check ist Premium-Funktion. Free-Nutzer können sie per Kredite freischalten. Das ist kein "Lizenzschlüssel", sondern eine Aktivitätsprämie. Ob ein Prüfer das als "eigenen Mechanismus zum Freischalten" einstuft, kann ich **nicht sicher beurteilen**. Abmilderung: Kredite nur für verbrauchbare, kleine Nutzung (Form-Check einzeln), **kein** Kredite-gegen-Premium, kein dauerhaftes Freischalten, Hinweis in den Review-Notizen (bereits in `STORE_LISTING.md` Abschnitt 6).
4. **Verschenken:** Der Satz zu Geschenken gilt für IAP-Artikel. Bei Krediten ohne Kauf ist kein Zahlungsfluss betroffen. Es gibt dazu **keine ausdrückliche Regel**, die ich gefunden habe. Gelb wegen Missbrauch (Konten-Farmen, Handel). Limit 20 pro 24 h ist eine gute Bremse.
5. **Kein Zwang zu Berechtigungen für Belohnungen:** 5.1.2(i): "Your app may not require users to enable system functionalities (e.g. push notifications, location services, tracking) in order to access functionality, content, use the app, or receive monetary or other compensation, including but not limited to gift cards and codes." Also: Kredite/Einladungsbelohnung **nicht** an Push-Zustimmung, Kontakte-Zugriff oder Tracking knüpfen. Die Einladung per Systemdialog "Teilen" ist ok, aber nicht den Zugriff auf Kontakte verlangen.
6. **Keine Anreize für Bewertungen:** Guideline 3 (Einleitung) verbietet bezahlte/anreizbasierte Bewertungen zur Rangverbesserung; 3.2.2(x): keine Pflicht zum Bewerten für Funktionen. **Nie Kredite für App-Store-Bewertungen oder Downloads anderer Apps geben.** Die Einladungsbelohnung ist an echte Trainings gekoppelt, nicht an den Download allein: das ist der richtige Aufbau.

### 2.2 Guideline 1.2 User-Generated Content / Social (statt "4.x Social")

Wörtlich (Apple, UK-Version): Apps "with user-generated content or social networking services must include:
- A method for filtering objectionable material from being posted to the app
- A mechanism to report offensive content and timely responses to concerns
- The ability to block abusive users from the service
- Published contact information so users can easily reach you"

Und: "It is your responsibility to remove content that violates this guideline, your terms of service or your community standards." Wiederholte Verstöße können zur Entfernung aus dem Store und aus dem Developer Program führen.

Bewertung für eure App:

- Nutzererzeugt und für andere sichtbar sind: **Benutzername**, Freundesliste, geteilte Trainingsdaten. Es gibt (laut Aufgabe) keinen Chat und keinen Freitext. Ob Apple euch als "social networking service" einstuft, ist **unsicher**. Wegen sichtbarer Benutzernamen, Anfragen und Verschenken unter Fremden würde ich **vorsichtshalber von Ja ausgehen**.
- Konsequenz: **Filter** (z. B. Sperrliste, reservierte Namen), **Melden** (Benutzername/Profil), **Blockieren** (Anfragen und Sichtbarkeit), **veröffentlichte Kontaktadresse** (E-Mail in Settings und Store), **zeitnahe Reaktion** (interner Prozess).
- Die Fragebögen für Altersfreigabe müssen "UGC/Soziales: Ja" widerspiegeln (in `STORE_LISTING.md` angepasst). Was Apple im neuen Fragebogen genau fragt, ist **nicht verifiziert**.
- Prüfer-Hinweis: "Apps with ... services that end up being used primarily for ... bullying ... do not belong on the App Store". Gewichte und Körpernähe laden zu Körperbeschämung ein. Melde-Weg und Möglichkeit, das Teilen abzuschalten, sind eure Hauptabsicherungen.

### 2.3 Guideline 5.1 Datenschutz

- **5.1.1(v)** (wörtlich): "If your app supports account creation, you must also offer account deletion within the app." Apple-Hilfeseite: Es muss "the entire account record, along with associated personal data" gelöscht werden; Löschen muss leicht auffindbar sein; "People expect that all data associated with their account will be deleted when the account is deleted. This includes user-generated content that's shared with others..."; bei laufendem Abo "notify them that billing will continue through Apple and ask them to cancel". Das deckt eure Anforderung "Account-Löschung entfernt Freundschaften und Daten": Freundschaften, Anfragen, Sharing-Einstellungen, Benutzername, Kredite-Ledger, Einladungsbezug mitlöschen. Auch **keine Support-Mail als einziger Löschweg** ("should not require people to make a phone call, send an email...").
- **5.1.2(i)**: Daten dürfen nicht ohne Erlaubnis verwendet oder weitergegeben werden; Offenlegung bei Dritten inkl. KI. Für Freunde: Sichtbarkeit nur nach Annahme und mit Abschalt-Möglichkeit. Apple unterscheidet Freunde (andere Nutzer) nicht ausdrücklich von "Dritten"; ob die Freigabe an Freunde in den App-Privacy-Labels extra auszuweisen ist, ist **unklar** (siehe `STORE_LISTING.md`, Abschnitt 5).
- **Privacy Labels:** User ID (inkl. Benutzername), Fitness, Other User Content, ggf. Product Interaction aktualisieren (vorgeschlagen in `STORE_LISTING.md`).
- **Kontolöschung vs. RevenueCat:** besteht schon als Lücke in `LAUNCH_CHECKLIST.md` Abschnitt 0 und bleibt.

### 2.4 Weitere Apple-Punkte

- **4.8 Login-Dienste:** Nur relevant, falls ihr Google/Facebook-Login ergänzt. Mit eigener E-Mail-Anmeldung entfällt die Pflicht.
- **Nicht gelesen:** die übrigen 4.x-Regeln (z. B. Mindestfunktionalität, Kopien) sowie 1.1 und 5.6 (Entwicklerverhalten). Wer sicher gehen will, liest die Seite erneut vollständig.
- Wettbewerbs-/Gewinnspielregeln (5.3): Kredite sind **kein Los-, Wett- oder Zufallssystem** und nicht in Geld umtauschbar. Das nicht ändern (keine Zufallsbelohnungen, keine Verlosungen), sonst greifen Glücksspiel- und Gewinnspielregeln. Habe 5.3 nicht gelesen.

## 3. Google Play

### 3.1 User Generated Content

Quelle (Zusammenfassung der Richtlinie, abgerufen am 26.10.2026): Apps mit UGC müssen "robust, effective, and ongoing UGC moderation" haben, Nutzer müssen "accept the app's terms of use and/or user policy before users can create or upload UGC", und es braucht "an in-app system for reporting and blocking objectionable UGC and users". Für Funktionen mit 1:1-Interaktion zwischen Nutzern ist Blockieren verlangt; öffentlich zugängliche UGC/soziale Apps müssen "in-app functionality to report users and content, and to block users" bieten. Ferner: objektionable Inhalte in AGB definieren und verbieten; "safeguards to prevent in-app monetization from encouraging objectionable user behavior".

Bewertung:

- Freundschaftsanfragen und Verschenken sind **1:1-Interaktionen**. Also: **Blockieren in der App ist sehr wahrscheinlich Pflicht**, Melden ebenfalls dringend empfohlen.
- **AGB-Zustimmung vor dem Erstellen von UGC:** Der Benutzername ist erster UGC. Beim Anlegen des Benutzernamens (oder bei der Registrierung) muss eine Zustimmung zu `TERMS.md` stehen (Checkbox mit Link), nicht nur ein Link im Menü.
- **Benutzernamen:** Die abgerufene Zusammenfassung sagt dazu **nichts**. Ob Google Benutzernamen als UGC im Sinne der Richtlinie behandelt, ist **unsicher**; konservativ: ja.
- **Monetarisierung:** "safeguards to prevent in-app monetization from encouraging objectionable user behavior": Kredite-Anreize dürfen nicht Spam oder Belästigung fördern. Einladungs-Limit (5/30 Tage) und Spam-Verbot in den AGB helfen.

### 3.2 Kontolöschung

Google (abgerufen 26.10.2026): Apps mit Kontoerstellung müssen "an in-app path to delete their app accounts and associated data" und "a web link resource where users can request app account deletion and associated data deletion" bieten; beim Löschen "you must also delete the user data associated with that app account"; wenn Daten aus Sicherheits-/Betrugs-/Rechtsgründen bleiben, "you must clearly inform users about your data retention practices". Das passt zur Anforderung, dass Freundschaften und geteilte Daten mitgelöscht werden. **Wichtig für Betrugsprävention:** Wenn ihr nach Löschung Marker gegen Mehrfach-Belohnungen behalten wollt, muss das offen in der Datenschutzerklärung stehen (Platzhalter in `PRIVACY_POLICY.md` Abschnitt 6).

### 3.3 Nicht verifiziert (aus Allgemeinwissen, bitte selbst prüfen)

- **Zahlungsrichtlinie:** digitale Güter in der App müssen über Google Play Billing verkauft werden. Da Kredite nicht verkauft werden, nicht betroffen. **Nicht abgerufen.**
- **Anreize für Bewertungen/Installationen:** Google verbietet meines Wissens, Bewertungen oder Installs zu belohnen oder in der Beschreibung Anreize für Bewertungen zu bieten. **Nicht abgerufen.** Einladungsbelohnung ist an Nutzung statt an Installation gekoppelt; trotzdem im Play-Eintrag nicht mit "Installiere und erhalte Belohnung" werben.
- **Health-Apps-Erklärung / Data Safety:** Pflichtformulare; Zuordnung der Datentypen siehe `STORE_LISTING.md`. Wie das aktuelle Formular "Weitergabe" an andere Nutzer behandelt, konnte ich nicht prüfen.

## 4. DSGVO / deutsches Recht (kurz, nur soweit für diese Features relevant)

1. **Art. 9 DSGVO und Fitnessdaten:** "Gesundheitsdaten" sind personenbezogene Daten, die Informationen über den Gesundheitszustand preisgeben (Art. 4 Nr. 15, Erwägungsgrund 35 DSGVO). Die Sekundärquelle (siehe Quellen) ordnet **Messwerte von Wearables wie Puls oder Schlaf** klar als Gesundheitsdaten ein; zur Einordnung reiner Trainingsprotokolle (Gewichte, Wiederholungen) sagt sie nichts Eindeutiges. Der EuGH legt Art. 9 weit aus, wenn Rückschlüsse auf die Gesundheit möglich sind (EuGH C-21/23 "Lindenapotheke" und C-446/21 "Schrems/Meta", beide 04.10.2024), verlangt aber "hinreichend konkreten Informationsgehalt", eine bloß entfernte Möglichkeit genügt nicht. Das habe ich **nicht an den Urteilstexten** geprüft.
   **Ergebnis:** Reine Kraftwerte sind eher normale personenbezogene Daten. Gemeinsam mit Zielen (z. B. Abnehmen), Körperbildern im Form-Check und der Sichtbarkeit für andere kann eine vorsichtige Aufsichtsbehörde sie als gesundheitsnah einstufen. Deshalb **ausdrückliche, getrennte, widerrufbare Einwilligung** (Art. 6 Abs. 1 lit. a und Art. 9 Abs. 2 lit. a) vor dem ersten Teilen sinnvoll. Zusätzlich DSFA (Art. 35) prüfen lassen. Wurde so in `PRIVACY_POLICY.md` eingearbeitet.
2. **Standardwert (entschieden):** Teilen ist **standardmäßig aus** (Privacy by Default, Art. 25) und startet erst nach ausdrücklicher Bestätigung im Dialog beim ersten Freund; widerrufbar in den Einstellungen. Das ist die richtige Richtung. Der Dialog muss klar sagen, dass Freunde Gewichte und Workouts sehen, und die Zustimmung (Zeit, Textversion) protokollieren.
3. **Belohnung/Empfehlung (UWG):** Wenn die App selbst Einladungs-Mails/SMS verschickt oder Kontakte importiert, droht unzulässige Werbung (§ 7 UWG). Aus meinem Wissen hat der BGH bei "Tell-a-friend"-Mails den Anbieter in der Verantwortung gesehen (Aktenzeichen aus dem Gedächtnis, **nicht geprüft**). Sicherer: nur Code anzeigen und über das System-Teilen-Menü durch den Nutzer selbst versenden lassen, keine Kontaktimporte.
4. **Betrugsprävention als Datenverarbeitung:** Geräte-Fingerprints/IP-Auswertung sind eigene Verarbeitungen (berechtigtes Interesse, Art. 6 Abs. 1 lit. f, Interessenabwägung) und können das Store-Label "Device ID" auslösen. Automatisierte Sperren: auf menschliche Überprüfbarkeit achten (Art. 22). Siehe Platzhalter in `PRIVACY_POLICY.md`.
5. **Verbraucherrecht:** Einseitige Änderung der Kredite-Kosten (z. B. Form-Check 20 auf 40) und Entzug von Punkten kann AGB-rechtlich angreifbar sein. Anwalt soll Klausel `TERMS.md` 5a Nr. 6/7 prüfen. Steuer: bei Kredite ohne Geldwert vermutlich unkritisch, **nicht geprüft**.
6. **Mindestalter:** App ist ab 16. Bei sozialer Funktion mit Fremden (Freundescode) ist ein höheres Mindestalter oder eine strengere Altersfreigabe zu überlegen. Entscheidung offen.

## 5. Konzept-Lücken und Widersprüche in der Vorgabe (bitte klären)

1. **Free-Limit und Wochenziel passen zusammen:** Free bleibt bei 3 gespeicherten Workouts pro Woche, das Wochenziel für Kredite und Design sind 3 qualifizierende Trainings. Kein Konflikt mehr; die Qualifikation (20 Min, 3 Sätze, 1 pro Tag) muss aber ebenfalls für die gespeicherten Workouts gelten, sonst kann ein nicht qualifizierendes Workout einen der 3 Free-Plätze verbrauchen. Das ist für Free-Nutzer ein spürbarer Punkt, in der App erklären.
2. **Rechnung:** 20 Kredite = 2 volle Wochen Training pro Form-Check. 400 Kredite = 20 Form-Checks ≈ ca. 0,70 USD Anthropic-Kosten (bei 3,5 Cent pro Analyse laut `LAUNCH_CHECKLIST.md`). Bei 5 belohnten Einladungen/30 Tage = bis zu 100 Form-Checks ≈ 3,50 USD pro Monat und Einladendem. Für ein 5-USD-Abo ist das kein Problem, aber **Betrugsanreiz** (Mehrfachkonten) ist real: Ein Tageslimit auch für Kredite-Nutzer und das Ausgabenlimit in der Anthropic-Console sind Pflicht.
3. **Selbstberichtet:** Dauer/Sätze lassen sich leicht fälschen (Timer laufen lassen, leere Sätze). Es gibt kein technisches Mittel, das ich ohne Sensoren vorschlagen kann, außer Plausibilitätsregeln (Mindestzeit pro Satz, keine Überlappung, nicht rückdatierbar, max. 1 pro Tag serverseitig). **Unsicher, wie gut sich das gegen Betrug hält.**
4. **Zeitzone/Woche:** Free-Limit zählt "Kalenderwoche UTC, Montag". Für Kredite und Wochenziel dieselbe Definition festlegen, sonst Streit mit Nutzern in anderen Zeitzonen.
5. **Atomarität:** Kredite buchen/ausgeben nur **serverseitig** mit Ledger (Idempotenz, keine Doppelausgabe, kein negatives Konto). Clientwerte nie vertrauen.

## 6. Empfehlungen und neue Pflichtfunktionen

**Pflicht (ohne diese droht Ablehnung oder Abmahnung):**

1. **Benutzer melden** (mindestens Benutzername/Profil) mit Grund und Rückmeldung; Meldungen landen bei euch (Tabelle + E-Mail/Dashboard) und werden zeitnah bearbeitet. (Apple 1.2, Google UGC.)
2. **Benutzer blockieren:** Blockierte können nicht suchen/anfragen/Daten sehen; bestehende Freundschaft wird beendet; Blocken ist umkehrbar. (Apple 1.2, Google 1:1-Interaktion.)
3. **Benutzernamen-Moderation:** Sperrliste (Beleidigungen, Hass, Sexuelles, Marken/Behörden, "admin/support"), reservierte Namen, Längen-/Zeichenregeln, Eindeutigkeit ohne Groß/Klein, Möglichkeit für euch, einen Namen zwangsweise zu ändern. Kein Name mit E-Mail-Adresse oder Klarnamen als Vorgabe.
4. **Moderationsprozess und Kontakt:** veröffentlichte Kontaktadresse in der App (Settings) und in den Store-Einträgen; interne Frist für Reaktionen (z. B. 24 bis 72 h, selbst festlegen); Möglichkeit, Konten zu sperren/Kredite zu entziehen.
5. **AGB-Zustimmung vor dem Anlegen des Benutzernamens** (Checkbox mit Link zu `TERMS.md`, Version speichern). (Google UGC.)
6. **Einwilligungsdialog für das Teilen mit Freunden** (beim ersten Freund, vor dem Aktivieren, mit klarem Text, was Freunde sehen: Serie, Tage, Farbe, PRs, Workouts mit Gewichten), Standard aus, Zustimmung protokollieren, jederzeit widerrufbar. (DSGVO Art. 6/9, Apple 5.1.2(i)-Geist.)
7. **Teilen abschalten wirkt sofort und vollständig** (RLS-Regeln: Freunde sehen nichts mehr, auch keine Altdaten).
8. **Kontolöschung erweitern:** Freundschaften, Anfragen, Blocks (eigene), Sharing-Einstellungen, Ledger, Einladungsbezug, Benutzername freigeben; in-App-Weg bleibt; **öffentliche Web-URL** zur Löschanfrage für Google; RevenueCat-Datensatz löschen (bestehende Lücke).
9. **Server-seitige Anti-Missbrauch-Regeln:** Ledger-Funktion für Buchungen; pro Tag max. 1 qualifizierendes Training; Verschenk-Limit 20/24 h; Einladungs-Limit 5/30 Tage; Code-Einlösung nur einmal pro Nutzer und nur im 7-Tage-Fenster; Selbsteinladung verhindern; Rate-Limits auf Benutzername-Suche und Freundschaftsanfragen (Spam/Enumeration).
10. **Anzeige der Regeln in der App:** "Kredite haben keinen Geldwert, nicht kaufbar, nicht auszahlbar, Missbrauch führt zum Entzug" an Kredite-Bildschirm und Einladung (Transparenz, Prüfer lesen das).
11. **Altersfreigabe-Fragebögen** (Apple/IARC) neu ausfüllen: UGC/Soziales Ja.
12. **Privacy-Labels / Data Safety** aktualisieren (siehe `STORE_LISTING.md`).

**Sehr empfehlenswert:**

- Freundschaftsanfragen nur per **exakter** Eingabe von Username/Code, keine Volltextsuche oder Vorschlagslisten (weniger Belästigung, weniger Enumeration).
- Einstellung "Anfragen nur mit Code erlauben" oder "Niemand darf mich finden".
- Kein Rangliste/Vergleichsdruck (Körperbeschämung): wenn Rangliste, optional.
- Keine Belohnung für Bewertungen oder Store-Aktionen; keine Push-Pflicht für Belohnungen.
- Einladungen nur über System-Teilen, kein Kontaktimport, kein App-seitiger Mailversand.
- Kredite-Verfall klar entscheiden und in den AGB benennen (siehe `TERMS.md` 5a).
- DSFA kurz dokumentieren (Fitnessdaten + Sichtbarkeit für andere + KI-Bilder).
- Melden/Blockieren in den Review-Notizen mit Screenshots belegen (Apple prüft das).

**Zusammenfassung der Unsicherheiten:** (a) Apple-Auslegung von "eigene Mechanismen zum Freischalten" bei Kredite-für-Form-Check; (b) ob Benutzernamen/Freundschaften als "UGC/Social Networking" gelten (vorsichtig: ja); (c) Google-Zahlungs- und Anreizrichtlinien nicht abgerufen; (d) Art.-9-Einstufung von Trainingsdaten nicht abschließend klärbar; (e) Behandlung von "Freunde sehen Daten" in Apple-Labels und Google-Data-Safety nicht prüfbar; (f) Fragebogen-Wortlaute ändern sich.

## 7. Quellen (alle abgerufen am 26.10.2026, sofern nicht anders vermerkt)

- Apple, App Review Guidelines (UK-Version, "Last Updated: 8 June 2026"): https://developer.apple.com/app-store/review/guidelines/uk/ (die Hauptseite https://developer.apple.com/app-store/review/guidelines/ ließ sich in dieser Umgebung nicht abrufen)
- Apple, Offering account deletion in your app / Guideline 5.1.1(v): https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion
- Google Play, User Generated Content policy (Zusammenfassung): https://support.google.com/googleplay/android-developer/answer/9876937
- Google Play, Understanding Google Play's app-account deletion requirements: https://support.google.com/googleplay/android-developer/answer/13327111 (abgerufene Variante: ?hl=en-GB)
- Thomas Helbing, Data concerning health (Art. 4(15) GDPR) (Sekundärquelle, Anwaltsseite, keine Rechtsberatung): https://www.thomashelbing.com/en/wissen/dsgvo-hub/begriffe-und-definitionen/1.2.15-gesundheitsdaten
- Suchtreffer zu Lindenapotheke / Schrems vs. Meta (nur Treffer-Titel, nicht gelesen): https://www.europeanpapers.eu/europeanforum/gdpr-meets-unfair-competition-law
- Nicht abrufbar (gesperrt): Google Payments Policy (support.google.com/googleplay/android-developer/answer/9858738), Google Metadata/Bewertungs-Anreize (…/answer/9876714), Apple-Hauptseite der Guidelines.
