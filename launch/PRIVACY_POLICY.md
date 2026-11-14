> **DRAFT - not legal advice.** This text was prepared from the app's source code and must be reviewed by a lawyer
> (GDPR / app store rules) before publication. Replace every `[PLACEHOLDER]`. If the app's behaviour changes, update this policy.

# Privacy Policy

**Last updated:** [DATE]
**Controller:** [COMPANY], [ADDRESS], [COUNTRY]
**Contact for privacy questions:** [EMAIL]

This policy explains what personal data the app **[APP_NAME]** ("the app") processes, why, who receives it, and what rights you have.
The app is for people aged 16 and over.

## 1. Short version

- You create an account with an email address and a password. Your workouts and profile are stored on our servers so they sync across devices.
- If you are a Premium subscriber and use **Form Check**, still images taken from your recorded set are sent to our server and forwarded to Anthropic (the AI provider) for analysis. We do not store these images; we store only the text result.
- Payments are handled by Apple or Google. RevenueCat manages subscription status for us.
- The app has no advertising, no analytics SDK and no tracking across other apps or websites.
- You can delete your account and data inside the app (Settings > Delete account).
- **Social features:** you choose a unique username. You can connect with friends. **Accepted friends can see your training streak, training days, colour theme, personal records (PRs) and your workouts including the weights you lifted** - but only while sharing is switched on, and you can switch it off at any time in Settings. People who are not your accepted friends do not see this data.
- **Credits and invitations:** the app keeps a ledger of the credits you earn and spend, and records who invited whom (invitation code), to run the rewards feature and to prevent abuse.

## 2. Data we process

| Data | Where it comes from | Why | Where it is stored |
|---|---|---|---|
| Email address, password (stored as a hash by our auth provider), account ID | You, at sign-up | Create and secure your account | Supabase |
| Workouts: workout name, start time, duration, exercises, weights (kg) and reps | You, while training | Show history and PRs, sync between devices, enforce the free-plan limit (3 workouts per week) | Supabase |
| Training profile: goal, level, training days per week, focus lifts | You, in the profile setup | Personalised PR Coach suggestions | Supabase, and cached on your phone |
| Premium status (yes/no) | RevenueCat, via a webhook to our server | Unlock Premium features, enforce them on the server | Supabase |
| Subscription and purchase information (app user ID = your account ID, product, purchase and renewal status, store receipt data) | Apple / Google, via RevenueCat | Provide and verify your subscription | RevenueCat (we do not receive card or payment details) |
| Form Check request log: account ID, exercise name, time of request, and the text result (score, notes) | Created when you run a Form Check | Show the result, enforce a daily usage limit, prevent abuse | Supabase |
| Form Check images (see section 3) | Your camera, only when you record a set | Technique analysis | **Not stored by us** |
| App settings (e.g. kg/lb), login session | Your phone | Keep you signed in and remember preferences | On your phone only |
| **Username** (unique, public to other users who search for it or receive your friend code) | You, in the app | Let other users find you and send friend requests | Supabase |
| **Friend list and friend requests** (who is connected to whom, status pending/accepted/blocked, time) | You and other users | Run the friends feature, show shared data only to accepted friends, honour blocks | Supabase |
| **Shared training data** shown to accepted friends: training streak, training days, colour theme (including unlocked designs), PRs, and workouts with exercises, weights and reps (derived from the workout data above, not a separate copy where possible) | You, while training | Let friends see your progress | Supabase; visible on the devices of your accepted friends |
| **Sharing settings** (sharing on/off, [any finer options]) | You, in Settings | Control what friends see | Supabase |
| **Invitation relationship** (your invitation code, the account that invited you, the date you redeemed it, whether the reward conditions were met) | You and the inviter | Run the invitation reward, prevent abuse | Supabase |
| **Credits ledger** (each credit earned or spent or gifted: amount, reason, time, related workout / Form Check / friend account ID) | Created by the app server | Show your balance, apply the rules, prevent abuse and fraud | Supabase |
| **Qualifying-workout data used for credits**: duration and number of sets of a workout. These values are **self-reported** by you; we do not verify them with sensors | You, while training | Decide whether a workout qualifies | Supabase |
| **Abuse-prevention signals** (e.g. counts of redeemed codes, timing patterns, [device or IP-based signals - delete this entry if not implemented]) | Generated by the server | Detect fake accounts or manipulated rewards | Supabase |
| **Reports and blocks** [only if the report/block function is implemented, see launch checklist]: who reported or blocked whom, reason, time | You | Protect users, moderate usernames and content | Supabase |

We do not collect your name, location, contacts, photos from your gallery, health-sensor data or advertising identifiers. Audio is not recorded.

## 3. Form Check (camera and AI analysis)

1. The app asks for camera permission. It records a short video (3 to 25 seconds, without sound) of your set. The video is not saved to your photo library.
2. On your phone the app cuts 5 still frames out of the video. These frames and the video file exist temporarily in the app's private storage on your phone; the app does not copy them elsewhere on the device, and the operating system may clear them at any time. They may show you and your surroundings.
3. The 5 frames, the selected exercise and the language setting are sent over an encrypted connection to our server function (Supabase Edge Function). The server checks that you are signed in and Premium.
4. The server forwards the frames and exercise name to the **Anthropic API** to produce feedback on your technique. Your name, email address and account ID are not included in that request.
5. The server does **not write the images to a database or file storage and does not log them**. Only the text result is stored in your account (score, short notes, a safety remark), together with the exercise and time.
6. Anthropic processes the images on its servers (United States and possibly other locations) under its commercial API terms. According to Anthropic's published policy at the time of writing, inputs and outputs sent through the API are deleted from its back end within 30 days unless the law or its usage policy requires longer retention. See Anthropic's own privacy and retention documentation: [ANTHROPIC_PRIVACY_LINK].
7. Form Check is optional. Nothing is sent unless you start an analysis. Before the first analysis the app [ASKS FOR YOUR EXPLICIT CONSENT - confirm this is implemented before release].

Form Check feedback is generated automatically, can be wrong, and is not medical advice or a substitute for a qualified coach.

## 3a. Friends, sharing and what other users can see

1. You pick a unique username. It is visible to other users who look you up by username or friend code, and to your friends. Do not use your real name or other personal data in it if you do not want that.
2. A friendship exists only after the other person **accepts** your request. Friend requests work via username or friend code.
3. **Accepted friends can see:** your training streak, your training days, your colour theme, your PRs, **and your workouts with the weights, reps and exercises.** Weights and workout history can say something about your fitness, body and health, so please consider whether you want to share them. Friends could take screenshots or tell others; we cannot prevent that.
4. **Sharing is OFF by default.** It starts only after you explicitly confirm it in a dialog shown when you add your first friend (we record your confirmation: time and text version). Until then, no friend sees any of your data. **You control this.** You can switch sharing off at any time in Settings. After that, friends no longer see new or existing data through the app. [Confirm in implementation: sharing off takes effect immediately and hides everything, not only future data.]
5. You can remove a friend or block a user at any time. A blocked user cannot find you, send requests or see your data. [Confirm in implementation.]
6. Non-friends never see your workouts, weights, PRs, streak, training days or colour theme.
7. Invitation codes: if you use a friend's code, that friend learns that someone redeemed the code and, once the reward conditions are met, receives credits. [Decide and implement what the inviter sees about the invitee: we recommend only the username and whether the reward conditions are met.]

## 3b. Credits and invitations (data aspects)

Credits are an in-app reward points balance with no monetary value (see Terms of Use). To run them we process your workout duration and sets (self-reported), the date of qualifying workouts, your credit ledger, your Form Check usage and, for gifts, the receiving friend's account. For invitations we process the code, the redeeming account and its sign-up date, and the number of qualifying workouts (3) in the first 14 days. We use abuse-prevention checks to detect fake accounts or manipulated data. These checks may lead to credits being withdrawn or an account being restricted. [Lawyer: if the checks go beyond simple rule-based counting, e.g. device fingerprints, describe them and re-check Art. 22 GDPR. A person should review any account suspension.]

## 4. Legal bases (GDPR)

- Account, workouts, profile, Premium status: performance of the contract with you (Art. 6(1)(b)).
- Form Check images and their transfer to Anthropic: your consent (Art. 6(1)(a)), given when you start a Form Check; you can withdraw it by not using the feature or by deleting your account. [Lawyer: decide whether fitness data / body images need explicit consent under Art. 9.]
- Security, abuse prevention and daily limits: our legitimate interest (Art. 6(1)(f)).
- Username, credits ledger, invitation relationship and the reward rules: performance of the contract (Art. 6(1)(b)) and, for abuse and fraud prevention, our legitimate interest (Art. 6(1)(f)).
- **Sharing training data with friends (streak, training days, theme, PRs, workouts with weights):** your **explicit consent** (Art. 6(1)(a) and, to the extent the data counts as health data, Art. 9(2)(a)). You give it in the confirmation dialog shown when you add your first friend (sharing is off by default), after being shown what friends will see; you can withdraw it at any time by switching sharing off in Settings or by removing the friend. Withdrawal does not affect earlier processing. Sharing only reaches friends you have accepted.
- Reports and blocks: our legitimate interest in keeping the community safe (Art. 6(1)(f)); blocks that you set are also part of the contract (Art. 6(1)(b)).

**Note on health data (Art. 9 GDPR) - for the lawyer.** Workout logs, weights and reps are fitness data. Whether they are "data concerning health" (Art. 4(15), Art. 9(1) GDPR) is not settled by a clear rule. The GDPR defines health data as personal data that reveal information about a person's physical or mental health status (Recital 35: past, present or future state of health); the Court of Justice of the EU interprets special categories broadly where health can be inferred (C-21/23 Lindenapotheke and C-446/21 Schrems/Meta, both 4 Oct 2024), but a remote possibility is not enough. Plain strength-training numbers are more likely ordinary personal data than clinical data, but together with a username, a profile, a body-image-based Form Check and a goal such as weight loss they could be treated as health-related, in particular by a cautious supervisory authority. Because friends can see the weights and workouts, we handle sharing and Form Check on the safe side with **explicit, separate, revocable consent**. [Lawyer: confirm the assessment. Consider a data protection impact assessment (Art. 35) and recording the consent (time, version of the text).]
- Legal duties such as accounting and tax records: Art. 6(1)(c).

## 5. Who receives data (service providers)

| Provider | Role | Data |
|---|---|---|
| Supabase, Inc. (database, authentication, server functions; project region: [SUPABASE_REGION]) | Processor | Account, workouts, profile, premium status, form-check log, username, friends, sharing settings, invitations, credits ledger, Form Check images in transit |
| Anthropic PBC (AI analysis) | Processor | Form Check frames and exercise name |
| RevenueCat, Inc. | Processor / independent controller for its own purposes, see its policy | Account ID, purchase and subscription data, technical data such as IP address |
| Apple Inc. / Google LLC | Independent controllers | Payment processing, subscriptions, app distribution |
| Your accepted friends (other users of the app) | Recipients (independent from us; they decide what to do with what they see) | Username, streak, training days, colour theme, PRs, workouts with weights - while sharing is on |

We do not sell personal data and we do not use it for advertising. Data may be transferred outside the EU/EEA (for example to the United States). Where required we rely on the EU-US Data Privacy Framework certification of the recipient or on Standard Contractual Clauses. [Lawyer: confirm the mechanism per provider and sign the data processing agreements.]

## 6. Retention and deletion

- **Account data** is kept until you delete your account.
- **Delete in the app:** Settings > Delete account. This permanently deletes your account and, through database cascades, your profile row, workouts, training profile and the Form Check log with results. You can also request deletion by email to [EMAIL] or via [DELETION_URL].
- **Subscriptions are not cancelled by deleting your account.** Cancel in your Apple ID or Google Play subscription settings first.
- **RevenueCat:** the subscriber record at RevenueCat is not removed automatically when you delete your account in the app. We delete it on request and, [within X days of an in-app deletion - implement or confirm manually]. 
- **Backups:** deleted data may remain in routine encrypted backups of our database provider for up to [BACKUP_RETENTION] and is then overwritten.
- **Legal retention:** purchase records may be kept by Apple, Google and us as long as tax law requires.
- **Form Check images:** not stored by us; retention at Anthropic as described in section 3.
- **What happens to friends and social data when you delete your account:** your username is released, your friend list, friend requests, sharing settings and blocks are deleted, and you disappear from your friends' lists. Your workouts, PRs, streak, theme and other shared data are deleted and no longer visible to anyone. [Confirm in implementation, including that nothing remains in caches or snapshots on friends' devices after their next sync.]
- **Credits ledger and invitations:** deleted with your account. Credits are lost on deletion and are not paid out. Credits you gifted to a friend stay with that friend as a balance without a link to you [Confirm]. If you invited someone, the invitation link to that person is removed; their account is not affected. [Decide whether a minimal record (e.g. a hashed marker) is kept for a limited time to prevent repeated reward abuse; if yes, state it here and justify it under Art. 6(1)(f).]
- **Reports and blocks:** reports about you may be kept for [X days/months] after deletion where necessary to handle the report or to defend legal claims. [Decide.]
- **Turning off sharing** does not delete your workouts; it only stops friends from seeing them.

## 7. Your rights

Under the GDPR you have the right to access, rectification, erasure, restriction, data portability and objection, to withdraw consent at any time (without affecting earlier processing), and to complain to a supervisory authority, for example the authority of your country of residence or [SUPERVISORY_AUTHORITY]. Write to [EMAIL]. We answer within one month. We do not use automated decision-making that has legal or similarly significant effects; the Form Check score is informational only. Credit rules are applied automatically; if credits are withdrawn or an account is restricted for suspected abuse, you can contact [EMAIL] and ask for a review by a person. You can switch off sharing with friends, remove friends and block users in the app.

## 8. Security

Connections use HTTPS/TLS. Database access is restricted by row-level security so you can read only your own rows and, while sharing is on, the shared data of your accepted friends [confirm that the policies are implemented exactly this way and that blocked users are excluded]; Premium status can only be written by our server. Our AI provider key is kept on the server and is not part of the app. No system is perfectly secure.

## 9. Children

The app is not directed at people under 16 and we do not knowingly collect their data. If you believe a child has signed up, contact [EMAIL].

## 10. California and other regions

We do not sell or share personal information as those terms are defined under the CCPA/CPRA. You can ask us to access or delete your data at [EMAIL]. [Lawyer: add region-specific wording if you target these markets.]

## 11. Changes

We will post changes here and update the date above. For material changes we will notify you in the app or by email.

## 12. Contact

[COMPANY], [ADDRESS] - [EMAIL]
[Germany/EU: add Impressum details and, if required, the data protection officer]
