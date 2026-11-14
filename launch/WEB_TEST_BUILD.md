# Web test version (friends, Premium unlocked)

Goal: open the app in Safari on an iPhone, add it to the home screen, no PC running, no TestFlight.
NOT tested yet - never built or run. If a step errors, send the error text.

## 1. Build (on your PC, in the project folder)
```
npx expo install react-native-web react-dom @expo/metro-runtime
```
Windows PowerShell (Premium unlocked + your Supabase keys):
```
$env:EXPO_PUBLIC_DEV_PREMIUM="1"
$env:EXPO_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
$env:EXPO_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
npx expo export --platform web
node scripts/patch-web.js
```
`DEV_PREMIUM=1` only works in __DEV__ or the web build. Never set it for EAS store builds.

## 2. Host
Drag the `dist` folder onto https://app.netlify.com/drop (free). You get a https link.

## 3. iPhone
Open the link in Safari -> Share -> "Zum Home-Bildschirm".

## 4. Server side Premium (needed for the 3 workouts/week limit and Form Check)
In Supabase SQL editor, after your friends signed up:
```
update public.profiles set is_premium = true where id in (
  select id from auth.users where email in ('friend1@mail.com','friend2@mail.com'));
```
(Remove again before the public launch.)

## Limits on web
- Purchases (RevenueCat) and push notifications do not work on web.
- Form Check (camera/video) may not work in the browser.
- Data is stored per browser/device for local things (templates, goals, notes).
