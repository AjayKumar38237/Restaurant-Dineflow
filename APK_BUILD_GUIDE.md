# Restaurant DineFlow Android APK Guide

## What is ready

DineFlow now has a Capacitor Android project with native plugins:

- Push Notifications
- Local Notifications
- Haptics / Vibration
- Splash Screen
- Status Bar

Package name:

```text
com.dineflow.restaurant
```

App name:

```text
Restaurant DineFlow
```

The APK loads the live web app:

```text
https://restaurant-dineflow.vercel.app
```

This means website updates can reflect in the APK without rebuilding every time, while native notification/vibration support is available in the app shell.

---

## Required before building APK

### 1. Add Firebase Android app

Open Firebase Console:

```text
https://console.firebase.google.com
```

Project:

```text
dineflow-restaurant-4971-990f7
```

Add Android app with package name:

```text
com.dineflow.restaurant
```

Download:

```text
google-services.json
```

Place it here:

```text
android/app/google-services.json
```

Without this file, native push notification will not work.

---

## Build commands

Install dependencies:

```powershell
npm install
```

Build and sync Android:

```powershell
npm run cap:build
```

Open Android Studio:

```powershell
npm run cap:open
```

In Android Studio:

```text
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

APK output is usually here:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Native notification test

1. Install APK on Android phone.
2. Login as staff/waiter.
3. Tap **Allow Notifications**.
4. Android permission popup should appear.
5. Mark an order as **Ready** from another device.
6. Assigned waiter should receive notification + vibration.

---

## Production release later

For Play Store / signed APK:

- Create keystore
- Configure signing in Android Studio
- Build release APK/AAB
- Keep keystore safe

---

## Future EXE phase

The EXE will be separate:

- Electron/Tauri desktop app
- Local SQLite
- Direct USB/IP thermal printing
- Offline mode
- Cloud sync
- License lock
