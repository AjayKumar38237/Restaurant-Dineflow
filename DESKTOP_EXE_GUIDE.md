# Restaurant DineFlow Desktop EXE Guide

This is the first Electron desktop foundation for DineFlow.

## Purpose

The desktop app is for:

- Cashier POS
- Store manager
- Manager/CA system
- Local backup
- Future silent USB/IP thermal printing
- Future SQLite offline mode
- Future license lock

## Current desktop capabilities

- Loads live DineFlow web app
- Provides Electron bridge for:
  - App info
  - Local backup file save
  - Windows printer list
  - Silent HTML print via Electron

## Install dependencies

```powershell
npm install
```

## Run desktop app in development

```powershell
npm run desktop:dev
```

## Build Windows EXE installer

```powershell
npm run desktop:build
```

Output will be in:

```text
release/
```

## Future phases

1. Local SQLite database
2. Direct ESC/POS print bridge
3. USB printer selection
4. Network IP printer raw printing
5. Offline order queue
6. Cloud sync worker
7. License key + machine lock
8. Auto updater
9. Code obfuscation / ASAR packaging

## Code protection plan

- Production minification
- Electron ASAR packaging
- License key check
- Machine ID binding
- Server subscription validation
- Encrypted local database
- Signed releases
