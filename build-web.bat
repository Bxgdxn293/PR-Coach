@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === Fitness App: Web-Version bauen ===
where node >nul 2>nul || (echo Node.js fehlt. Installiere es von https://nodejs.org ^(LTS^) und starte diese Datei neu. & pause & exit /b 1)
set EXPO_PUBLIC_SUPABASE_URL=https://bgjmtsjeiupkafefvjgb.supabase.co
set EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_QXGF8rr33-JVw64WZWBi4g_AH4PJpkY
set EXPO_PUBLIC_DEV_PREMIUM=1
if not exist app\package.json (
  echo [1/5] Projekt anlegen...
  call npx --yes create-expo-app@latest app --template blank-typescript || goto fail
)
cd app
echo [2/5] Pakete installieren (dauert einige Minuten)...
call npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill react-native-purchases expo-font @expo-google-fonts/space-grotesk @expo/vector-icons react-native-svg expo-status-bar expo-camera expo-video-thumbnails expo-constants react-native-web react-dom @expo/metro-runtime || goto fail
echo [3/5] App-Dateien kopieren...
copy /Y ..\App.tsx App.tsx >nul
copy /Y ..\app.json app.json >nul
xcopy /E /I /Y ..\src src >nul
xcopy /E /I /Y ..\assets assets >nul
xcopy /E /I /Y ..\scripts scripts >nul
echo [4/5] Web-Version bauen...
call npx expo export --platform web || goto fail
echo [5/5] Home-Bildschirm-Dateien hinzufuegen...
call node scripts\patch-web.js || goto fail
echo.
echo FERTIG. Ziehe jetzt den Ordner "dist" auf https://app.netlify.com/drop
start https://app.netlify.com/drop
explorer dist
pause
exit /b 0
:fail
echo.
echo FEHLER. Mache einen Screenshot dieses Fensters und schick ihn an Claude.
pause
exit /b 1
