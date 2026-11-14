# Fitness app (Expo / React Native, iOS + Android)

Menu, Workout, PR Records, Exercise Library, Templates, Settings, Login and a Premium paywall,
in the neon-lime dark design. Accounts and workout sync run on Supabase; subscriptions run on RevenueCat.

> **Status: written but not yet run.** This code was produced in an environment without npm access, so it has
> never been compiled or tested on a device. Expect to fix a few small type or version issues on first run.

## 1. Create the project and drop these files in

```bash
npx create-expo-app@latest fitness-app --template blank-typescript
cd fitness-app
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens \
  react-native-safe-area-context @supabase/supabase-js @react-native-async-storage/async-storage \
  react-native-url-polyfill react-native-purchases expo-font @expo-google-fonts/space-grotesk \
  @expo/vector-icons react-native-svg expo-dev-client expo-status-bar expo-camera expo-video-thumbnails expo-constants
```

Copy `App.tsx`, `src/`, `supabase/`, `eas.json`, `.env.example` into the project and merge `app.json`
(change both IDs `com.yourcompany.fitness` to your own; keep the icon/splash assets create-expo-app generated,
and replace them with your real 1024x1024 icon). Then `cp .env.example .env` and fill it in.

## 2. Supabase (accounts + sync)

1. Create a project at supabase.com. Put the URL and **anon** key into `.env`.
2. Run `supabase/schema.sql` in the SQL editor. It creates the tables, row-level security, the server-side
   free limit (3 workouts per week) and the account-deletion function.
3. Authentication > Providers > Email: decide whether email confirmation is on (the app handles both).
4. Deploy the webhook (see step 3.4) before you release. **Without it, paying users are still treated as free by
   the database and get blocked after 3 workouts.**

## 2b. PR Coach and AI Form Check (new)

1. Run the new part of `supabase/schema.sql` (tables `user_settings` and `form_checks`).
2. Deploy the Form Check function (the Anthropic API key stays on the server, never in the app):
   ```bash
   supabase functions deploy form-check
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   # optional: supabase secrets set CLAUDE_MODEL=... FORM_CHECK_DAILY_LIMIT=5
   ```
   Keep JWT verification ON. The function checks `profiles.is_premium` and a daily limit itself.
3. The camera needs a development build (`eas build --profile development --platform android`), (Expo Go works for trying it).

Costs: every Form Check calls the Anthropic API and is billed per analysis to your API key
(separate from any Claude subscription). The daily limit caps the cost per user.

How it works / limits:
- The app records 3-25 s, takes 5 still frames and sends them. It cannot judge bar speed or bar path.
  The result is a guide, not a replacement for a coach (the app says so).
- PR Coach (`src/lib/prGoal.ts`, screens `Coach`, `PrGoal`, `PrGoalEdit`) is a 1-rep-max goal coach, rule-based,
  no AI cost. You enter your current 1-rep max and a goal (e.g. bench 120 -> 150 kg). It plans a 4-week cycle
  (volume 5x5 @78%, strength 4x3 @85%, heavy 3x2 @91%, max test with attempts) with a warm-up ladder, estimates
  the time (about 0.75% per week, 120 -> 150 kg is about 35 weeks) and updates the max when you log a heavier
  single in a workout. Free: 1 goal, Premium: 5. Goals are stored on the device only.

- Exercise notes (`src/lib/exerciseNotes.ts`): one note per exercise in the workout screen, kept on the device and
  shown again next time. The streak (weeks in a row) sits next to the credits chip on every screen.

- Exercise animation (`src/lib/figure.ts`, `src/lib/figurePatterns.ts`, `src/components/ExerciseFigure.tsx`): the exercise
  info screen shows a looping drawn figure (side view) whose trained muscles are red. About 57 movement patterns cover
  all library exercises (`patternIdFor` maps names to patterns); the geometry is pure code and was checked by
  rendering every pattern to images. It is a drawn animation, not filmed video.

Status: only the pure logic (`src/lib/prGoal.ts`, templates, SQL) has been run against tests. The React Native screens and the edge function
were written without being able to compile or run them, so expect small fixes on the first start.

## 3. Subscriptions (RevenueCat)

1. Create the app in App Store Connect and Google Play Console, then create two auto-renewing subscriptions
   (monthly, yearly) in each. Planned prices: 7.99 EUR per month and 50 EUR per year (set them in App Store Connect and Google Play; the app shows whatever the store returns, so no price is hard-coded).
2. In RevenueCat: add both apps, import the products, create an **entitlement named `premium`**, attach the
   products, and create a **current offering** with a Monthly and an Annual package.
3. Put the public SDK keys (`appl_…`, `goog_…`) into `.env`.
4. Webhook: `supabase functions deploy revenuecat-webhook --no-verify-jwt`, set the secret
   `REVENUECAT_WEBHOOK_SECRET`, then add the function URL under RevenueCat > Integrations > Webhooks with the
   same secret as the Authorization header value.

In-app purchases do not work in Expo Go. Use a development build: `eas build --profile development`
(or `npx expo run:ios` / `run:android`). Test with Apple sandbox and Google Play license testers.

## 4. Release

```bash
npm i -g eas-cli && eas login
eas build --platform all --profile production
eas submit --platform ios      # and: --platform android
```

Checklist you must do yourself:

- Apple Developer Program (about 99 USD/year) and Google Play Console (one-time about 25 USD) accounts.
- Privacy policy and terms URLs (set `EXPO_PUBLIC_PRIVACY_URL` / `EXPO_PUBLIC_TERMS_URL`; both stores require them).
- App Store privacy "nutrition labels" and Google Play Data safety form (the app collects email and workout data).
- Give the reviewers a working test account (email + password) in the review notes.
- Screenshots, description, age rating, category, support URL.
- Subscription metadata in both stores (name, duration, price, localised description).

Already handled in the app: Restore Purchases, subscription auto-renew disclosure, links to terms/privacy on
the paywall, in-app account deletion (Apple requires this when accounts can be created).

## Known limits of this first version

- The free weekly limit is counted per calendar week; the server uses the UTC week, the app your local week, so
  right at the week boundary they can differ by a few hours.
- Right after buying, the webhook may take a few seconds to flip `is_premium`; a workout saved in that window can
  be rejected once. Retrying works.
- Workouts need a connection to save (no offline queue yet).
- Cancelling a subscription happens in the store settings, not in the app.

## Launch

Everything for the store release is in `launch/` (privacy policy and terms drafts, store texts DE/EN, checklist,
cost overview, feature graphic). Start with `launch/LAUNCH_CHECKLIST.md`. Fill every `[PLACEHOLDER]` and
`TODO_` value first and have the legal texts reviewed.

Known gaps: no localisation (UI is English only), account deletion does not cancel the store subscription,
password reset sends the Supabase default email (no in-app deep link yet).

## Testing on an iPhone (no Apple account needed)

1. Install **Expo Go** from the App Store. 2. In the project: `npx expo start --tunnel`. 3. Scan the QR code with the iPhone camera.
Put `EXPO_PUBLIC_DEV_PREMIUM=1` in `.env` to see the Premium screens (dev only). Purchases cannot be tested in Expo Go.
For a real Form Check also set `is_premium = true` for your user in Supabase (`profiles` table) and deploy `form-check`.
expo-camera is part of Expo Go, so a development build is not required just to try the camera (not verified by me).

## Credits, friends, invites, themes (new)

Backend: the whole migration is at the end of `supabase/schema.sql` (run it again in the SQL editor; it is
idempotent). Contract for the app: `supabase/CONTRACT.md`. Redeploy `form-check` (it now charges credits).

- **Credits:** a workout counts if it lasts 20+ min with 3+ sets, 1 per day. 3 counting workouts per week = +10 credits.
  A Form Check costs 20 credits for non-Premium users; Premium users pay nothing (daily limit still applies).
- **Invites:** every user has a code. If the invited user (redeems within 7 days of sign-up) completes 3 counting
  workouts within 14 days, the inviter gets +400 credits (max 5 rewarded invites per 30 days).
- **Friends:** username or code; friends see streak, week progress, colour, records and workouts with weights ONLY after
  the user confirmed sharing (default off, can be turned off any time). Block and remove are in the app.
- **Gifting:** credits can be sent to accepted friends (max 20 per 24 h).
- **Blue theme:** unlocked after 4 weeks in a row with 3 workouts of at least 30 min each. **Red theme:** same rule for 26 weeks (half a year) without a missed week. **Purple theme:** same rule for 52 weeks (one year). **Gold theme:** log a Barbell Bench Press set of 100 kg or more for at least 1 rep (the server checks the saved workout; the weight is entered by the user, like all workout data). Friends see your colour.
- **Workout flow:** Menu > Workout opens the Templates screen (with when each template was last used); pick one (every workout starts from a template; create the first one with "New template"). Tap the small body map on an exercise for the how-to. The Training History screen was removed. Exercise lists are A-Z with a switch to group by muscle.
- **Templates:** after a workout the app offers "Save as template"; start one from the Templates bar in the Workout screen (stored on the device; Free plan keeps 2, Premium up to 30).
- **Friend profiles** are shown in the friend's colour theme.

Known limits: workout duration/sets are self-reported (a determined user can fake them); many fake accounts can still
farm invite rewards within the limits (consider requiring a confirmed e-mail); users can report and block others (profile menu; reports land in the table `user_reports`, check it in the
Supabase dashboard, see `launch/REWARDS_COMPLIANCE.md`). None of the new screens has been run:
expect small fixes on the first start. The Snack version does not include friends or credits (needs the server).

Settings: the colour themes live in their own screen (Settings > Interface colors). Adding friends opens its own screen (Friends > +). Each library exercise has its own steps, tip and animation (`src/data/exerciseInfo.ts`).

PR Coach, reaching the goal sooner: the goal screen offers "Reach it faster" (add the support session: about +15% pace; fast pace: +30% on top, with a higher max-test attempt) only when it makes sense. Not offered if the goal is one test cycle away, already reached, or real progress is far behind the plan (then it advises to stay steady). The pace never exceeds 1.25% of the max per week. The multipliers are rule-of-thumb assumptions, not measured. Logic and tests: `src/lib/prGoal.ts`.


## PR Coach: Premium only, one-time templates
The whole PR Coach (Coach, PrGoal, PrGoalEdit screens) is Premium-only (`FREE_GOAL_LIMIT = 0`; non-premium users see a locked card / are sent to the Paywall). Tapping Start on a coach session builds a brand-new one-time template (`coachTemplate` in `src/lib/templates.ts`, id `coach-<goalId>`, `once: true`): warm-up ladder first, then exactly the prescribed kg/reps (`plan`). It does not count towards the template limit, is removed after the workout is saved, and is never offered as 'Save as template'. Starting the same goal again replaces an unfinished one. Warm-up & plates stays available in the workout.

## Web test version for friends (Premium unlocked)
See `launch/WEB_TEST_BUILD.md`. Untested; `scripts/patch-web.js` adds home-screen metadata after `expo export`.
