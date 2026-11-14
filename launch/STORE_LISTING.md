# Store Listing (EN + DE)

Draft. Updated for credits, invitations, friends and unlockable themes (features not yet in the code at the time of writing: the texts below must only be used once the features are built and tested). Character counts of the new subtitle-class strings and long descriptions were measured (EN long description 2687, DE 3080, limit 4000); the keyword fields and subtitles are unchanged. Everything in `[BRACKETS]` is yours to fill in. Claims below match what the code does today
(PR Coach is rule-based, NOT AI; only Form Check uses AI, from still frames).

## 1. App name suggestions

The current `app.json` name "Fitness" is too generic (hard to find, unlikely to be accepted/unique, bad for ASO). Ideas
(check App Store / Play availability, trademark databases and a free domain BEFORE you commit; I did not check any of them):

| Name | Note |
|---|---|
| Liftlime | plays on the lime accent, easy to say |
| Repform | reps + form, matches Form Check |
| Barlog | short, "bar" + "log" |
| PRlime | PR focus |
| FormLift | descriptive, probably taken - check |

Limits: iOS name 30 characters, Google Play title 30 characters. Put the main keywords into subtitle/short description, not into the name.

## 2. Texts

### English (US/UK)

- **Subtitle (iOS, max 30):** `Log lifts. Fix your form.` (25)
- **Short description (Google Play, max 80):** `Log workouts, chase PRs, train with friends and get AI form feedback.` (69)
- **Promotional text (iOS, max 170, editable without review):** `New: train with friends, earn credits for consistent workouts and use them on an AI form check. Track every lift, see your PRs and know what to lift next.` (154)
- **Keywords (iOS, max 100, comma separated, no spaces after commas):**
  `workout log,gym tracker,strength,PR,personal record,weightlifting,squat,bench,deadlift,form check` (97)
- **Long description (max 4000):**

```
[APP_NAME] is a clean, fast workout log for people who lift.

LOG YOUR TRAINING
- Start a workout, add exercises, enter weight and reps per set
- Switch between kg and lb
- Your history syncs to your account, so a new phone is no problem

SEE YOUR PROGRESS
- PR Records for your lifts at a glance
- Training history with every past workout
- Exercise library with the basics explained

PR COACH
Tell the app your goal, level and training days. After each session it suggests your next target: a bit more weight or one more rep, based on your last top set. (Rule-based suggestions, no guesswork about your gear.)

TRAIN WITH FRIENDS
- Pick a unique username and add friends by username or friend code
- Sharing is off by default: you confirm it once when you add your first friend. Then accepted friends can see your training streak, training days, colour theme, PRs and your workouts with weights. Revoke it any time in Settings
- Remove friends or block users whenever you want
- Unlock the blue theme after 4 weeks in a row the red theme after 26 weeks in a row, the purple theme after 52 weeks in a row, each week with 3 workouts of 30+ minutes. Friends see your colour
- Save your workouts as templates and start them with one tap

EARN CREDITS
- Complete workouts of at least 20 minutes and 3 sets (one per day counts); 3 qualifying workouts in a week earn 10 credits
- Spend 20 credits on an AI Form Check, even without Premium
- Gift credits to accepted friends (up to 20 per 24 hours)
- Credits are an in-app reward only: they cannot be bought, have no cash value and cannot be paid out. Duration and sets are self-reported; misuse can lead to credits being removed
- Invite friends with your code: when a new user joins with your code and completes 3 qualifying workouts in their first 14 days, you get 400 credits (max. 5 rewarded invitations per 30 days)

AI FORM CHECK (Premium or 20 credits)
Film one set of squat, bench press, deadlift or overhead press. The app picks still frames from your video and an AI model reviews them: a score, what looks good, what to fix, and one concrete cue to try on the next set.
- Videos are not saved to your photo library
- Only a few still images are analysed. Still images cannot judge bar speed or bar path, and the AI can be wrong. It is guidance, not a coach and not medical advice.
- You can delete your account and data anytime in Settings

FREE AND PREMIUM
Free: 3 workouts per week, credits and friends.
Premium (monthly or yearly subscription): unlimited workouts, the PR Coach (Premium only), AI Form Check without credits (daily limit applies).
Payment is charged to your Apple ID / Google Play account. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the period. Manage them in your store account settings.

Privacy Policy: [PRIVACY_URL]
Terms of Use: [TERMS_URL]
Support: [EMAIL]
```

- **What's new (1.0.0):** `First release: workout log, PR Coach, AI Form Check, friends, credits and invitations.`

### Deutsch (DE)

- **Untertitel (iOS, max 30):** `Lifts loggen. Form checken.` (27)
- **Kurzbeschreibung (Google Play, max 80):** `Workouts loggen, PRs knacken, mit Freunden trainieren, KI-Formcheck.` (68)
- **Werbetext (iOS, max 170):** `Neu: Trainiere mit Freunden, sammle Kredite für regelmäßiges Training und nutze sie für einen KI-Formcheck. Tracke jeden Lift und sieh deine PRs.` (145)
- **Keywords (iOS, max 100):**
  `Krafttraining,Workout Tagebuch,Gym Tracker,Trainingsplan,Bestleistung,Kniebeuge,Bankdrücken,PR` (94)
- **Langbeschreibung:**

```
[APP_NAME] ist ein klares, schnelles Trainingslogbuch für alle, die Gewichte bewegen.

TRAINING PROTOKOLLIEREN
- Workout starten, Übungen hinzufügen, Gewicht und Wiederholungen pro Satz eintragen
- Umschalten zwischen kg und lb
- Dein Verlauf wird mit deinem Konto synchronisiert, ein neues Handy ist kein Problem

FORTSCHRITT SEHEN
- PR-Rekorde deiner Lifts auf einen Blick
- Trainingsverlauf mit allen bisherigen Workouts
- Übungsbibliothek mit den Grundlagen

PR COACH
Sag der App dein Ziel, dein Level und deine Trainingstage. Nach jeder Einheit schlägt sie dir das nächste Ziel vor: etwas mehr Gewicht oder eine Wiederholung mehr, ausgehend von deinem letzten schwersten Satz. (Regelbasierte Vorschläge, keine KI.)

MIT FREUNDEN TRAINIEREN
- Wähle einen eindeutigen Benutzernamen und füge Freunde per Benutzername oder Freundescode hinzu
- Teilen ist standardmäßig aus: Du bestätigst es einmal, wenn du deinen ersten Freund hinzufügst. Dann sehen akzeptierte Freunde deine Trainingsserie, Trainingstage, dein Farbdesign, deine PRs und deine Workouts mit Gewichten. In den Einstellungen jederzeit widerrufbar
- Freunde entfernen und Nutzer blockieren, wann du willst
- Schalte das blaue Design frei, wenn du 4 Wochen in Folge je 3 qualifizierende Trainings schaffst. Freunde sehen deine Farbe

KREDITE SAMMELN
- Trainiere mindestens 20 Minuten mit mindestens 3 Sätzen (pro Tag zählt ein Training); 3 qualifizierende Trainings pro Woche bringen 10 Kredite
- Setze 20 Kredite für einen KI-Formcheck ein, auch ohne Premium
- Verschenke Kredite an akzeptierte Freunde (bis zu 20 pro 24 Stunden)
- Kredite sind nur eine Belohnung in der App: nicht kaufbar, ohne Geldwert, nicht auszahlbar. Dauer und Sätze gibst du selbst an; bei Missbrauch können Kredite entzogen werden
- Lade Freunde mit deinem Code ein: Wenn sich ein neuer Nutzer mit deinem Code anmeldet und in den ersten 14 Tagen 3 qualifizierende Trainings schafft, erhältst du 400 Kredite (max. 5 belohnte Einladungen pro 30 Tage)

KI-FORMCHECK (Premium oder 20 Kredite)
Filme einen Satz Kniebeuge, Bankdrücken, Kreuzheben oder Schulterdrücken. Die App wählt Standbilder aus deinem Video, und ein KI-Modell bewertet sie: Punktzahl, was gut aussieht, was du verbessern solltest und ein konkreter Hinweis für den nächsten Satz.
- Videos werden nicht in deiner Fotomediathek gespeichert
- Es werden nur wenige Standbilder analysiert. Standbilder können weder Hantelgeschwindigkeit noch Hantelweg beurteilen, und die KI kann irren. Das ist eine Orientierung, kein Trainer und keine medizinische Beratung.
- Du kannst dein Konto und deine Daten jederzeit in den Einstellungen löschen

KOSTENLOS UND PREMIUM
Kostenlos: 3 Workouts pro Woche und das erste PR-Coach-Ziel, Kredite und Freunde.
Premium (Monats- oder Jahres-Abo): unbegrenzt Workouts, PR Coach (nur Premium), KI-Formcheck ohne Kredite (Tageslimit gilt).
Die Zahlung wird deiner Apple-ID bzw. deinem Google-Play-Konto belastet. Abos verlängern sich automatisch, wenn du nicht mindestens 24 Stunden vor Ende des Zeitraums kündigst. Verwaltung in den Einstellungen deines Store-Kontos.

Datenschutz: [PRIVACY_URL]
Nutzungsbedingungen: [TERMS_URL]
Support: [EMAIL]
```

Note: the app UI itself is English only (form-check requests send `lang: 'en'`). A German store listing for an English-only app can lead to
bad reviews or rejection ("metadata does not match app"). The new social/credit texts also appear in the UI only in English at the moment. Either add a German UI before releasing the DE listing, or ship the DE text only after localisation.

## 3. Category

- Apple: Primary **Health & Fitness**, secondary Sports (optional).
- Google Play: **Health & Fitness** (app, not game). Tags: Fitness, Workout/Weight training.
- Support URL, marketing URL (optional), privacy policy URL (required, must be public): `[URLS]`

## 4. Age rating / content rating

Answer honestly in the questionnaires; the questions change over time, so re-read each one. Expected answers for this app:

| Topic | Answer |
|---|---|
| Violence, sexual content, nudity, profanity, horror, drugs/alcohol/tobacco, gambling, contests, loot boxes | None / No |
| User-generated content, messaging, social features between users | **Yes (changed)**: usernames and friend connections; friends see each other's training data. No free-text chat/messages, no photos, no public feed (confirm this stays true). Answer the UGC/social questions truthfully; Apple's and Google's report/block rules then apply, see `REWARDS_COMPLIANCE.md` |
| Unrestricted web access | No (only opens privacy/terms links in the browser) |
| Advertising | No |
| Health or wellness topics (Apple's newer questionnaire) | Yes, fitness and training suggestions (unsure how Apple weighs this: confirm in App Store Connect) |
| Medical or treatment information | No claims of diagnosis or treatment |
| In-app purchases / subscriptions | Yes |
| Collects personal data / account | Yes (email, username, friend list, training data shared with friends) |
| Gambling / contests / rewards | No gambling: credits cannot be bought, have no cash value and no randomised payout. Describe the reward/referral system as "no purchase, no cash value" where the questionnaire asks (re-check wording, questions change) |

Likely results: Apple 4+ or 9+ (depends on the wellness answer); Google (IARC) category "Utility / Productivity / Other", expect Everyone / PEGI 3 or similar.
Google Play target audience: **18+** (or 16+) only, never children (avoids the Families policy).
The Privacy Policy and Terms say "16 and over"; keep these consistent with your answers.

Other store forms to fill in:
- Apple: export compliance is already answered in `app.json` (`ITSAppUsesNonExemptEncryption: false`, only standard HTTPS). Confirm it still fits.
- Google Play: **Health apps declaration** (required for apps in the Health & Fitness area), ads declaration (No ads), financial features (none), government (No), news (No).
- Both: you need a public URL where users can request account deletion. Google asks for it in Data Safety (the in-app deletion exists, but Google also wants a web link). `[DELETION_URL]`

## 5. Privacy questionnaires (match the real data flows)

Facts, taken from the code: Supabase Auth (email + password), tables for workouts / training profile / premium flag / form-check log (no images);
RevenueCat SDK with the account ID as app user ID; Form Check frames go phone -> Supabase Edge Function -> Anthropic API and are not stored by us;
no analytics, ads, crash-reporting or tracking SDKs; no tracking across apps; HTTPS everywhere. In-app account deletion exists.

### Apple "App Privacy" (nutrition labels)

"Do you or third-party partners collect data from this app?" -> **Yes**. "Tracking" -> **No** for all types. Every type below: linked to the user, NOT used for tracking.

| Data type | Collected | Linked to user | Purpose |
|---|---|---|---|
| Contact Info > Email Address | Yes | Yes | App Functionality (account) |
| Health & Fitness > Fitness | Yes (workouts, weights, reps, training profile, form-check results) | Yes | App Functionality |
| User Content > Photos or Videos | Yes (Form Check still frames, sent to the server and AI provider) | Yes (conservative choice: the request is authenticated, even though we do not store the images) | App Functionality |
| Identifiers > User ID | Yes (account ID, also used by RevenueCat; **plus the username** that other users can see: Apple's definition of "User ID" includes screen names/handles) | Yes | App Functionality |
| User Content > Other User Content | Yes (friend list / friend requests / blocks, invitation relationship, credits ledger; **best-fit category is uncertain**: some of this may be better described as "Usage Data > Product Interaction". Pick the conservative option and tick both if in doubt) | Yes | App Functionality |
| Health & Fitness > Fitness | (already ticked above) **now also: shared with other users (friends) on request of the user**. Apple's label has no "shared with friends" flag; it asks about third-party partners. Friends are users, not partners: state this in the privacy policy, not in the label. Confirm in App Store Connect | Yes | App Functionality |
| Purchases > Purchase History | Yes (RevenueCat subscription status) | Yes | App Functionality |
| Usage Data, Diagnostics, Location, Contacts, Browsing History, Search History, Sensitive Info, Financial Info, Other | No | - | - |

Decision for you: Apple counts data as "collected" when it leaves the device, unless it is only processed in real time and not kept longer than needed.
Anthropic keeps API inputs up to 30 days by default, so "Photos or Videos: collected" is the safe answer. Confirm with a lawyer.
Check RevenueCat's and Supabase's current documentation for their own default logging (IP address etc.); if they log device or usage data, add "Diagnostics/Usage" accordingly. This is not something I could verify.

New for the social features: Apple asks for a way to report and block (guideline 1.2), published contact information and in-app account deletion that also removes friendships and shared data. See `REWARDS_COMPLIANCE.md`. Nothing is sold, no ads, no tracking: "Tracking" stays **No**, but re-check if you add device-ID-based fraud signals for the invitation system (device fingerprints may count as "Device ID" collection under "Identifiers").

Also required by Apple (guideline 5.1.2(i), since Nov 2025): the app must clearly disclose sharing personal data with third-party AI and get **explicit permission** before doing so. See the launch checklist: the current app only shows a camera-permission text, no dedicated consent screen.

### Google Play "Data safety"

- Does the app collect or share user data? **Yes.** All data encrypted in transit: **Yes**. Users can request deletion: **Yes** (in app + web link `[DELETION_URL]`).
- Data shared with third parties: Google does not count transfers to service providers that process data on your behalf (Supabase, Anthropic, RevenueCat) as "sharing"; state **No** for sharing, but double-check the current wording of the form and the policy for each provider.

| Category > Type | Collected | Shared | Optional | Purpose |
|---|---|---|---|---|
| Personal info > Email address | Yes | No | Required for account | App functionality, Account management |
| Personal info > User IDs (account ID **and username**, visible to other users) | Yes | No (see note) | Required | App functionality, Account management |
| App activity > Other user-generated content (friend list, invitations, credits ledger, blocks) | Yes | No (see note) | Required for friends/credits (the social features can be skipped) | App functionality |
| Health and fitness > Fitness info (workouts, weights, PRs, streak; **visible to accepted friends if the user turns sharing on**) | Yes | No (see note) | Required for the workout log; sharing with friends is optional | App functionality, Personalisation (PR Coach), Social features |
| Health and fitness > Health info | Only if you decide that the data counts as health data (see Privacy Policy "Note on health data"). **Uncertain**; choose conservatively together with your lawyer | - | - | - |
| Photos and videos > Photos | Yes (Form Check frames) | No | **Optional** (Premium feature) | App functionality; not ephemeral (provider keeps up to 30 days) |
| Financial info > Purchase history | Yes | No | Required for Premium | App functionality |
| Location, Contacts, Audio, Files, Messages, Web browsing, Device IDs, Ads data | No (Device IDs becomes Yes if you add device-based fraud signals) | - | - | - |

Note on "Shared": Google's form counts transfer to third parties as sharing; display of user data to other users at the user's own direction is a grey area in the form. I could not verify how the current form treats friend visibility. Conservative option: answer "Shared: Yes" for Fitness info and User IDs with purpose "App functionality" and explain in the policy. Decide with your lawyer and re-read the form's help text.

## 6. Review notes (App Review / Play review)

```
Thank you for reviewing [APP_NAME].

Sign in with this demo account (Premium is already active):
  Email:    [REVIEW_EMAIL]
  Password: [REVIEW_PASSWORD]

Where to find things:
- Menu > Workout: start a workout, add an exercise and sets.
- Menu > PR Records / Library / Coach / Templates.
- Menu > Form Check (Premium): choose an exercise, tap the record button, film for at least 3 seconds, stop.
  The app extracts 5 still frames, sends them to our server which forwards them to an AI service for technique feedback,
  and shows a score and notes. The camera is used only for this feature; no audio is recorded; videos are not saved to the photo library.
  Real-world use: the user films themselves from 2-3 m away. For review you can film any person or object; the AI will report low confidence.
- Settings > Delete account: deletes the account and data. Settings > Restore purchases. Privacy policy and Terms are linked in Settings and on the paywall.
- Subscriptions: Premium (monthly/yearly) is sold via in-app purchase. Use the sandbox environment to test the purchase flow
  with a fresh account that you create via Sign up.
- Social features: Menu > Friends. Users choose a unique username and can add friends by username or friend code. Only ACCEPTED friends see the user's training streak, training days, colour theme, PRs and workouts with weights; sharing is OFF by default and starts only after the user explicitly confirms a dialog shown when adding the first friend; it can be revoked any time in Settings. (Reviewer: the dialog appears when you send/accept the first friend request with the demo accounts; for the pre-connected demo accounts sharing is already confirmed.) Users can remove friends and block/report users (profile menu: Remove friend, Report, Block; reports are stored in `user_reports` and reviewed within 24 h). There is no chat, no public feed, no photos and no free-text posts; the only user-created text visible to others is the username (moderated: [describe filter, report path and response time, contact [EMAIL]]).
  Demo: two review accounts are provided so you can test a friendship: [REVIEW_EMAIL_2] / [REVIEW_PASSWORD_2] (username "[REVIEW_USER_2]"). Send a request from the first account to this username and accept it on the second.
- Credits: an in-app reward counter. Users earn credits through qualifying workouts (min. 20 minutes and 3 sets, max. 1 per day; 3 qualifying workouts in a week = 10 credits). A Form Check costs 20 credits for non-Premium users; Premium users do not need credits. Credits CANNOT be purchased (no in-app purchase, no external payment), have no cash value, cannot be redeemed for money, gift cards or goods, and are not randomised (no loot boxes, no gambling). They can be given only to accepted friends (max. 20 per 24 hours). Duration/sets are self-reported; abuse leads to removal. So guideline 3.1.1 (own mechanisms to unlock functionality / currencies) does not apply to a purchasable currency, because there is none. Credits are not a substitute for the Premium subscription.
- Invitations: Settings > Invite shows a personal code. If a NEW user enters it within 7 days after sign-up and completes 3 qualifying workouts in their first 14 days, the inviter gets 400 credits (max. 5 rewarded invitations per 30 days). No cash or gift-card reward; rewards depend on real use of the app, not on installs or ratings, and users are never asked to rate or review the app for rewards. [Add: how a reviewer can test the code flow with a fresh account.]
- Account deletion (Settings > Delete account) also removes friendships, shared data, credits and invitation links.
- The app has no ads and no tracking.
- Form Check feedback is general fitness guidance, not medical advice (stated in the app and the Terms).

Contact: [EMAIL], [PHONE] (also the published contact for reports of abusive users/usernames)
```

For you (do before submitting): make the demo account really Premium. The app reads Premium from the RevenueCat entitlement `premium`, while the server (Form Check, workout limit) reads `profiles.is_premium`.
So (1) grant the entitlement in RevenueCat (Customer view, user = the Supabase user ID from the Auth dashboard, "Grant promotional entitlement", lifetime) AND
(2) run `update public.profiles set is_premium = true where id = '<user id>';` in Supabase (the webhook may not fire for promotional grants). Test the demo login on a clean install.
 For the social/review notes: create two Premium-independent demo accounts that are already friends, and a third not-yet-connected account for testing requests. Pre-load the first account with enough credits (>= 20) so the reviewer can test spending without doing workouts. Do the same in Google Play "App access".
Google Play: put the same login in "App access" (Play Console > App content), plus instructions that Form Check needs camera permission.

## 7. Screenshots: the 6 screens (same order on both stores)

Use a seeded demo account with realistic data (weights like 100 kg squat, several weeks of history), lime-on-dark as is. Optional: add a short headline above each screenshot.

| # | Screen | Headline idea (EN / DE) | What must be visible |
|---|---|---|---|
| 1 | Menu | "Everything for your lifting" / "Alles für dein Training" | Menu tiles incl. Form Check and Coach |
| 2 | Workout (set entry in progress) | "Log a set in seconds" / "Satz in Sekunden erfasst" | Exercise, sets with kg/reps, some ticked done |
| 3 | PR Records | "Know your PRs" / "Kenne deine PRs" | List of lifts with best weights |
| 4 | Form Result | "Fix your form with AI" / "Technik verbessern mit KI" | Score, good/issue notes, frame thumbnails; use a staged photo of yourself, never a stranger |
| 5 | Coach | "Know what to lift next" / "Wisse, was als Nächstes dran ist" | Next target card(s) |
| 6 | Templates | "Start your routine in one tap" / "Dein Training mit einem Tipp starten" | Template list with last-used dates |

Optional extra (up to 10 on iOS, 8 on Google Play): Friends (fake usernames only, never real people's data), Credits balance, Paywall (must show price and subscription terms), Library.

Sizes (verify the current requirements in App Store Connect / Play Console before exporting): iPhone 6.9" portrait (e.g. 1320x2868) is the main required set, others can scale from it;
`supportsTablet` is false, so no iPad screenshots are needed. Google Play: min 2 phone screenshots, 9:16, each side 320-3840 px, plus the feature graphic `launch/feature-graphic.png` (1024x500) and the 512x512 icon (export from `assets/icon.png`, resize, Play requires 512x512 PNG up to 1 MB).
