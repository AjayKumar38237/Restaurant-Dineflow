# Fresh Start Steps for Restaurant DineFlow

Use these steps after downloading/copying this clean source.

## 1. Install dependencies

```powershell
cd "D:\\restaurant\\Restaurant Dineflow"
npm install
```

## 2. Run website locally

```powershell
npm run dev
```

## 3. Build website

```powershell
npm run build
```

## 4. Supabase

Run `supabase-schema.sql` in Supabase SQL Editor.

Deploy functions:

```powershell
supabase functions deploy google-booking
supabase functions deploy ai-agent
supabase functions deploy send-push
```

## 5. Firebase / APK

Place Android `google-services.json` here (do not commit):

```text
android/app/google-services.json
```

Then:

```powershell
npm run cap:build
cd android
.\gradlew assembleDebug
```

APK output:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## 6. Desktop EXE

```powershell
npm run desktop:build
```

EXE output:

```text
release/
```

## 7. GitHub clean push

```powershell
git init
git branch -M main
git remote add origin https://github.com/AjayKumar38237/Restaurant-Dineflow.git
git add .
git commit -m "Clean DineFlow source"
git push -u origin main --force
```
