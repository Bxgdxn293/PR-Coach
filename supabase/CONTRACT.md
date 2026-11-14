# Backend-Vertrag (Supabase) für die App

Quelle der Wahrheit: `supabase/schema.sql` (Migration am Dateiende, idempotent) und `supabase/functions/form-check/index.ts`.

## Allgemeines

- Aufruf: `supabase.rpc('<name>', { <argumente> })`. Alle RPCs nur für eingeloggte Nutzer (`authenticated`); `anon` hat keinen Zugriff.
- **Rückgabe immer `jsonb`.** Geschäftsfehler kommen NICHT als Exception, sondern als `{ "ok": false, "error": "<code>", ... }` (HTTP 200). Erfolg: `{ "ok": true, ... }`. Nur `not_authenticated` (kein JWT) wird als Postgres-Fehler geworfen.
- Clients dürfen **nichts direkt schreiben** (kein INSERT/UPDATE/DELETE auf profiles, credit_ledger, friendships, ...). Lesen: eigene Zeilen von `profiles`, `credit_ledger`, `qualifying_days`, `lift_records`, `workouts`. Fremde Daten nur über die RPCs unten.
- Zeiten sind UTC. Eine Woche ist die ISO-Woche Montag bis Sonntag (UTC). Gewichte immer kg.
- Neue Spalte `workouts.qualifying` (bool, vom Server gesetzt, Client-Wert wird überschrieben): zeigt, ob dieses Training als Gym-Besuch zählt. Beim Speichern eines Trainings gibt es keinen Fehler, wenn es nicht zählt, es wird trotzdem gespeichert. Nach `insert` am besten `select qualifying` mitladen (`.insert(...).select('id,qualifying')`) und danach `my_credits()` neu laden.
- `workouts.created_at` wird serverseitig immer auf die Serverzeit gesetzt (Client-Wert ignoriert).
- Bestehendes Verhalten bleibt: Free-Plan max. 3 Trainings pro Woche (`free_limit_reached` als Exception beim Insert). Das Wochenziel ist 3, ein Free-Nutzer kann es also genau erreichen, aber keine Zusatz-Trainings speichern.

## Konstanten (zentral in SQL: Funktion `public._const`)

| Name | Wert | Bedeutung |
|---|---|---|
| QUALIFY_MIN_DURATION_SEC | 1200 | Mindestdauer eines zählenden Trainings |
| QUALIFY_MAX_DURATION_SEC | 21600 | Maximaldauer (6 h), darüber zählt es nicht |
| QUALIFY_MIN_SETS | 3 | Mindestanzahl gültiger Sätze (`kg` 0..1000, `reps` 1..100, beides Zahlen) |
| QUALIFY_MAX_AGE_HOURS | 36 | `started_at` darf beim Einfügen höchstens so alt sein |
| QUALIFY_FUTURE_TOLERANCE_MIN | 5 | Toleranz Uhrabweichung: `started_at` und Ende (`started_at + duration`) dürfen höchstens 5 min in der Zukunft liegen |
| (fest) | 1 pro UTC-Tag | max. 1 zählendes Training pro Nutzer und UTC-Kalendertag (Tag von `started_at`); das erste eingefügte zählt |
| WEEKLY_GOAL | 3 | zählende Trainings pro Woche |
| WEEKLY_BONUS | 10 | Kredite, einmalig pro Woche (ref = Montag der Woche) |
| THEME_MIN_DURATION_SEC | 1800 | nur Trainings >= 30 min zählen für die Theme-Serien (Credits weiter ab 20 min) |
| THEME_BLUE_WEEKS | 4 | aufeinanderfolgende Wochen mit >= 3 Tagen à >= 30 min für Theme `blue` |
| THEME_RED_WEEKS | 26 | dito, 26 Wochen ohne Lücke für Theme `red` |
| THEME_PURPLE_WEEKS | 52 | dito, 52 Wochen (ein Jahr) ohne Lücke für Theme `purple` |
| THEME_GOLD_BENCH_KG | 100 | Theme `gold`: ein gespeicherter Satz „Barbell Bench Press" mit mindestens diesem Gewicht (kg) und mindestens 1 Wiederholung, unabhängig von der Trainingsdauer |
| INVITE_REDEEM_WINDOW_DAYS | 7 | Code einlösbar bis N Tage nach Kontoerstellung |
| INVITE_REWARD_WINDOW_DAYS | 14 | Eingeladener muss das Ziel in N Tagen nach Kontoerstellung erreichen |
| INVITE_REWARD_WORKOUTS | 3 | zählende Trainings des Eingeladenen in diesem Fenster |
| INVITE_REWARD | 400 | Kredite für den Einladenden, einmalig pro Eingeladenem |
| INVITE_MAX_REWARDS_30D | 5 | belohnte Einladungen pro Einladendem, rollierend 30 Tage |
| GIFT_MIN / GIFT_MAX | 1 / 20 | Betrag pro Geschenk |
| GIFT_MAX_PER_24H | 20 | Summe pro Sender in 24 h |
| FORM_CHECK_COST | 20 | Kosten eines Form Checks für Nicht-Premium |
| FRIEND_REQUESTS_PER_24H | 20 | Freundschaftsanfragen pro Nutzer und 24 h |
| LOOKUP_FAILS_PER_HOUR | 30 | fehlgeschlagene Username-/Code-Suchen pro Nutzer und Stunde |
| TOP_LIFTS_MAX / FRIEND_WORKOUTS_MAX | 4 / 50 | Größen der Freundes-Daten |

Außerdem Edge-Function-Secret `FORM_CHECK_DAILY_LIMIT` (Default 5 pro 24 h, gilt für alle).

`app_config()` liefert die für die UI relevanten Werte (siehe unten), damit die App sie nicht hartkodieren muss.

## Rückgabeformen und Signaturen

### `my_credits()`
```json
{ "ok": true,
  "balance": 410,
  "history": [ { "id": "uuid", "delta": -20, "reason": "form_check|refund|weekly_bonus|referral_reward|gift_in|gift_out",
                 "ref": "text", "created_at": "iso", "counterparty_username": "bob|null" } ],   // letzte 50, neueste zuerst
  "weekly_progress": { "qualifying_this_week": 2, "goal": 3, "bonus": 10, "week_start": "2026-10-26",
                       "bonus_awarded": false, "qualified_today": true },
  "streak_weeks": 4,
  "theme": "lime", "theme_unlocked": ["lime", "blue"],
  "invite_code": "K7M2QX9P", "username": "alice|null",
  "referral": { "redeemed": false, "rewarded_count_30d": 1 } }
```
`streak_weeks`: aufeinanderfolgende Wochen mit >= 3 zählenden Trainings bis heute. Die laufende Woche zählt mit, sobald das Ziel erreicht ist; solange sie noch läuft, bricht sie die Serie nicht.
`referral.redeemed`: ob der Nutzer selbst einen Einladungscode eingelöst hat. `rewarded_count_30d`: belohnte Einladungen, die er selbst ausgesprochen hat.

### `app_config()`
`{ ok, weekly_goal, weekly_bonus, theme_blue_weeks, theme_red_weeks, theme_min_duration_sec, form_check_cost, qualify_min_duration_sec, qualify_min_sets, invite_reward, invite_redeem_window_days, invite_reward_window_days, invite_reward_workouts, invite_max_rewards_30d, gift_min, gift_max, gift_max_per_24h }`

### Profil
- `set_username(username text)` -> `{ok:true, username}`; Fehler `invalid_username` (nicht `[a-z0-9_]{3,20}`; Eingabe wird klein geschrieben), `username_taken`, `too_many_attempts`.
- `unlock_shadow()` -> `{ok:true}`: hängt das geheime Theme `shadow` an `theme_unlocked` an (die App ruft es nach einer versteckten Geste auf, es gibt keinen Hinweis darin). Danach funktioniert `set_theme('shadow')`, und Freunde sehen es über `list_friends`.
- `set_theme(theme text)` -> `{ok:true, theme}`; Fehler `theme_locked`. `blue` wird automatisch nach 4, `red` nach 26, `purple` nach 52 (`gold`: Bankdrücken ≥ 100 kg × 1, siehe THEME_GOLD_BENCH_KG) aufeinanderfolgenden Wochen freigeschaltet, in denen es je >= 3 zählende Tage mit einem Training von >= 30 Minuten gab (Lücke = Serie bricht ab; beim Speichern des Trainings, steht danach dauerhaft in `theme_unlocked`). `my_credits()` liefert `theme_streak_weeks` (laufende 30-Min-Serie, Fortschrittsanzeige). Pro Tag speichert `qualifying_days.duration_sec` das längste gültige Training; ein längeres zweites Training am selben Tag wertet den Tag für die Theme-Serie auf, gibt aber keine zusätzlichen Credits.
- `set_sharing(enabled boolean)` -> `{ok:true, share_enabled}`. **Default ist `false`** (Opt-in). Jederzeit umschaltbar. Den aktuellen Wert liest die App aus `profiles.share_enabled` (eigene Zeile, direkt per select).

### Einladung
- `redeem_invite(code text)` -> `{ok:true, inviter_id, inviter_username}`. Groß/Kleinschreibung egal. Fehler: `already_redeemed`, `invite_window_expired`, `invalid_code` (auch bei Blockierung), `own_code`, `mutual_invite` (der Einladende wurde selbst von dir eingeladen), `too_many_attempts`.
  Effekt: setzt `referred_by`, legt eine akzeptierte Freundschaft an. Die 400 Kredite gehen automatisch an den Einladenden, sobald der Eingeladene in den ersten 14 Tagen 3 zählende Trainings hat (Trainings vor dem Einlösen zählen mit). Ist der Einladende gerade am 30-Tage-Limit, entfällt die Belohnung, kann aber durch ein späteres zählendes Training innerhalb der 14 Tage noch ausgelöst werden.
- Code: 8 Zeichen aus `A-H J K M N P-Z 2-9` (ohne I, L, O, 0, 1), aus `my_credits().invite_code`.

### Freunde
Alle liefern `{ok:true, ...}` oder `{ok:false, error}`.
- `send_friend_request(username text)` -> `{ok:true, status:"pending"|"accepted", request_id?}`. Fehler: `username_required` (eigener Username fehlt), `user_not_found`, `cannot_add_self`, `already_friends`, `already_requested`, `user_blocked` (du hast die Person blockiert), `rate_limited`, `too_many_attempts`. Hat die Person dich bereits angefragt, wird sofort `accepted`. Hat die Person dich blockiert, bekommst du bewusst trotzdem `pending` (Blockierung wird nicht verraten).
- `list_friend_requests()` -> `{ok, incoming:[{id, user_id, username, created_at}], outgoing:[...]}` (`id` = request_id).
- `respond_friend_request(request_id uuid, accept boolean)` -> `{ok, status:"accepted"|"declined"}`; Fehler `request_not_found`. Abgelehnte Anfragen werden gelöscht.
- `remove_friend(friend uuid)` -> `{ok, removed:bool}`. Entfernt Freund oder zieht offene Anfrage (ein- oder ausgehend) zurück.
- `report_user(target uuid, reason text, note text)` -> `{ok:true}`; reason: spam|abuse|inappropriate_name|other; Tabelle `user_reports` (nur Dashboard/service_role lesbar), max 10 pro 24 h. Fehler: `cannot_report_self`, `user_not_found`, `rate_limited`.
- `block_user(target uuid)` / `unblock_user(target uuid)` -> `{ok:true}`; `list_blocked()` -> `{ok, blocked:[{id, username, created_at}]}`. Fehler bei `block_user`: `cannot_block_self`, `user_not_found`. Blockieren entfernt die Freundschaft und verhindert neue Anfragen und Code-Einlösung in beide Richtungen.
- `list_friends()` -> `{ok:true, friends:[ ... ]}`, je Freund:
```json
{ "id": "uuid", "username": "bob|null", "theme": "lime", "share_enabled": true,
  "streak_weeks": 2,
  "qualifying_this_week": 1, "total_workouts": 42, "last_workout_at": "iso|null",
  "top_lifts": [ { "name": "Bench Press", "kg": 100.0, "reps": 5 } ] }
```
  **Ist `share_enabled` = false**, enthält der Eintrag nur `id, username, theme, share_enabled, streak_weeks`; `qualifying_this_week, total_workouts, last_workout_at, top_lifts` sind dann `null`. Zeige dann "teilt nichts" statt 0.
- `friend_workouts(friend uuid, lim int default 20)` -> `{ok, workouts:[{id, name, started_at, duration_sec, entries:[{name, sets:[{kg,reps}]}], qualifying}]}` (neueste zuerst, `lim` wird auf 1..50 begrenzt). Fehler `not_friends` (keine akzeptierte Freundschaft), `sharing_disabled`.

### Kredite verschenken
- `gift_credits(friend uuid, amount int)` -> `{ok, balance, remaining_24h}`. Fehler: `invalid_amount` (nicht 1..20), `cannot_gift_self`, `not_friends`, `gift_limit_reached` (+ `remaining_24h`), `insufficient_credits` (+ `needed`, `balance`).

## Kreditregeln im Überblick

- Quellen: `weekly_bonus` (+10, einmal pro Woche), `referral_reward` (+400), `gift_in`. Senken: `form_check` (-20), `gift_out`. `refund` erstattet einen fehlgeschlagenen Form Check.
- Ledger ist append-only, Saldo = Summe, nie negativ (Datenbank-Trigger mit Sperre pro Nutzer, auch bei parallelen Anfragen). Eindeutig pro (Nutzer, reason, ref), keine Doppelvergabe.
- Zählende Trainings werden in `qualifying_days` dauerhaft festgehalten. Ein gelöschtes Training macht Kredite/Serien nicht rückgängig und erlaubt kein erneutes Zählen am selben Tag. Bestehende Trainings von vor dieser Migration zählen nicht (kein Rückwirkend-Farmen); Serien starten bei 0.

## Edge Function `form-check` (POST, JWT erforderlich)

Request unverändert: `{ exercise: "Squat|Bench|Deadlift|Press", frames: [base64 jpeg x3..6], lang: "de"|"en" }`.

- Premium (`profiles.is_premium`): kostenlos, Tageslimit gilt.
- Nicht-Premium: 20 Kredite werden vor dem Anthropic-Aufruf abgebucht und bei jedem Fehlschlag automatisch erstattet. Gleiches Tageslimit.
- Erfolg: HTTP 200 mit dem bisherigen Ergebnis-JSON. Danach `my_credits()` neu laden.

| HTTP | `error` | Bedeutung |
|---|---|---|
| 400 | `bad_request`, `bad_exercise`, `bad_frames` | Eingabe ungültig (nichts abgebucht) |
| 401 | `unauthorized` | |
| 402 | `insufficient_credits` + `needed`, `balance` | zu wenig Kredite (nur Nicht-Premium); der Versuch verbraucht kein Tageslimit |
| 413 | `too_large` | |
| 429 | `daily_limit` + `limit` | Tageslimit erreicht (nichts abgebucht) |
| 502 | `upstream_error` (+ `status`), `unreadable_answer`, `upstream_unreachable` | Anthropic-Fehler, Kredite erstattet; Versuch zählt trotzdem zum Tageslimit |
| 504 | `timeout` | Kredite erstattet |
| 500 | `internal`, `not_configured` | Kredite erstattet, falls schon abgebucht |

`premium_required` (403) wird nicht mehr zurückgegeben: Nicht-Premium ohne genug Kredite bekommt `insufficient_credits`.

## Ehrliche Grenzen

- Dauer, Sätze, Gewichte und `started_at` meldet der Client selbst. Der Server prüft nur Plausibilität (Regeln oben); ein entschlossener Nutzer kann zählende Trainings fälschen. Kredite sind deshalb nur begrenzt fälschungssicher; Obergrenzen (1 Training/Tag, Wochenbonus 10, max. 5 belohnte Einladungen/30 Tage, Geschenklimit) begrenzen den Schaden.
- Top-Lifts werden mit Plausibilitätsgrenzen (0 < kg <= 1000, reps 1..100) übernommen, sind aber ebenfalls selbstberichtet.
- Mehrere Fake-Konten desselben Menschen können sich gegenseitig einladen; das ist nur durch die Limits gebremst, nicht verhindert.
