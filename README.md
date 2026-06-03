# Restaurant DineFlow

Multi-Tenant SaaS Restaurant Management System built as a clean Vite React app.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Supabase setup

1. Open Supabase Dashboard for `https://pcmetiulmpwehakunmgy.supabase.co`.
2. Go to **SQL Editor**.
3. Run `supabase-schema.sql`.
4. Refresh the app. Status should show **Supabase Online**.

> I cannot run SQL directly with only the anon key. The anon key can read/write after tables/policies exist, but it cannot create database tables.

## Login

- Super Admin: `ak38237@gmail.com` / `9958269235`
- Demo Owner (local preview): `owner@dineflow.in` / `123456`
- Demo Staff: Owner Email `owner@dineflow.in` + Staff ID `W001` + PIN `1234`

## Included modules

- Super Admin tenant onboarding with auto Booking Link + Guest Self Ordering Menu Link
- Super Admin Guest Details Excel/CSV export only
- Owner email/password login
- Staff login with Restaurant Owner Email + Staff ID + 4 digit PIN
- Tables, Rooms, Villas
- Guest mandatory details before order
- Table shifting
- Guest booking and phone/table pre-filled self-ordering
- Magic review button with 10% bill discount, internal low-star review storage, Google redirect for 3+ stars
- Department-wise KOT and 80mm print windows
- Billing with CGST, SGST, Liquor VAT, optional service charge toggle at print/payment time, manager approval for manual discount/complimentary
- Owner detailed sales report CSV only: item, category, department, taxes and service charge share
- Department names management in Menu
- Owner printer settings add/delete with department mapping
- Message slider and background ad image
- Mobile-first responsive UI

Footer: **Design by Ajay**
