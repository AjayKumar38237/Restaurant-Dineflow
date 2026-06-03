# Restaurant DineFlow — Pilot Test Checklist

Use this checklist when testing DineFlow at a restaurant/resort before giving a trial.

## 0. Before Visit

- [ ] Latest GitHub/Vercel deployment done
- [ ] Supabase SQL schema updated
- [ ] Functions deployed: `google-booking`, `ai-agent`, `send-push`
- [ ] APK installed on waiter phone
- [ ] Cashier PC has Chrome / EXE ready
- [ ] Thermal printer installed and default printer set
- [ ] Test restaurant owner login ready
- [ ] Staff IDs/PINs ready

---

## 1. Landing Page Test

- [ ] Landing page opens on desktop
- [ ] Landing page opens on mobile
- [ ] Ask DineFlow AI button visible
- [ ] Ask AI answers: “DineFlow mein kya features hain?”
- [ ] Pricing section visible
- [ ] Plan comparison correct
- [ ] WhatsApp button works: 9599457544

---

## 2. Super Admin Test

- [ ] Super Admin login works
- [ ] Add Restaurant works
- [ ] Booking link auto-generated
- [ ] Guest menu link auto-generated
- [ ] Plan selection works
- [ ] Payment status update works
- [ ] Mark as Paid works
- [ ] AI Agent Settings save works
- [ ] Guest CRM CSV download works
- [ ] Support tickets visible

---

## 3. Owner Setup Test

- [ ] Owner login works
- [ ] Setup Wizard opens
- [ ] Load Sample Demo Data works
- [ ] Clear Demo Data works
- [ ] Restaurant settings save
- [ ] GSTIN save
- [ ] Liquor ON/OFF works
- [ ] Approval PIN save
- [ ] Printer settings save
- [ ] Backup download works
- [ ] Backup import works

---

## 4. Staff Login Test

- [ ] Staff login with Owner Email + Staff ID + PIN works
- [ ] Waiter sees correct tabs
- [ ] Chef sees correct tabs
- [ ] Cashier sees correct tabs
- [ ] Diagnostics tab visible for staff
- [ ] My Tasks screen visible

---

## 5. APK / Notification Test

- [ ] APK opens
- [ ] Staff login works in APK
- [ ] Diagnostics opens
- [ ] Enable / Register Push works
- [ ] Push Token Saved visible
- [ ] Test Local Notification gives sound/vibration
- [ ] PC marks order Ready
- [ ] Phone receives Order Ready notification
- [ ] Notification tap opens app/dashboard

If notification fails, record:

```text
Device:
Android version:
Role:
Diagnostics status:
Error message:
Supabase send-push log:
```

---

## 6. POS Flow Test

- [ ] POS tab opens
- [ ] Table/Room/Villa cards visible
- [ ] Occupied/running status visible
- [ ] Create order from POS
- [ ] Item notes can be added
- [ ] KOT sent successfully
- [ ] Running bill amount updates

---

## 7. KOT / Orders Test

- [ ] KOT appears department-wise
- [ ] Notes show under item
- [ ] Status changes: Pending → Preparing → Ready → Served
- [ ] Ready notification triggers
- [ ] No print button in actions

---

## 8. Print Test

- [ ] Print Station opens
- [ ] Printer mapping visible
- [ ] Print Test Receipt works
- [ ] Receipt prints 80mm, not A4
- [ ] KOT print works
- [ ] Bill print works
- [ ] Restaurant details show on bill
- [ ] Guest details show on bill
- [ ] Waiter name shows on bill
- [ ] Tax summary aligned properly
- [ ] Voluntary Service Charge line shows properly

If A4 prints, check:

```text
Default printer
Paper size 80mm
Chrome margin none
Headers/footers off
Kiosk shortcut
Printer driver
```

---

## 9. Billing Test

- [ ] Bill Summary from table works
- [ ] Running bills show
- [ ] Settled bills show
- [ ] Voided bills show
- [ ] Discount % works
- [ ] Complimentary amount works
- [ ] Service Charge ON/OFF works
- [ ] Cash settlement works
- [ ] UPI settlement works
- [ ] Card settlement works
- [ ] Split payment works
- [ ] Reprint works
- [ ] Item void requires reason + approval PIN

---

## 10. Day Close Test

- [ ] Date filter works
- [ ] Opening Cash entry
- [ ] Closing Cash entry
- [ ] Expected Cash calculation
- [ ] Cash Difference calculation
- [ ] Cash / UPI / Card breakup
- [ ] Tax summary
- [ ] Void count
- [ ] Save Day Close works
- [ ] Print / Save PDF works

---

## 11. Sales Summary Test

- [ ] Today filter
- [ ] Yesterday filter
- [ ] This Month filter
- [ ] Custom from/to date
- [ ] Department filter
- [ ] Category filter
- [ ] Payment filter
- [ ] CSV download works
- [ ] Totals match settled bills

---

## 12. Store / Inventory Test

- [ ] Store department add/edit
- [ ] Vendor add/edit
- [ ] Raw material add/edit
- [ ] Purchase entry increases stock
- [ ] Stock issue decreases stock
- [ ] Wastage decreases stock
- [ ] Low stock alert shows
- [ ] Expiry alert shows
- [ ] Price history shows
- [ ] Vendor payment due shows
- [ ] Purchase price comparison shows
- [ ] Stock ledger shows IN / OUT / WASTAGE

---

## 13. Recipe / Auto Deduction Test

- [ ] Recipe created for menu item
- [ ] Ingredients added
- [ ] Recipe cost calculates
- [ ] Bill settle deducts stock automatically
- [ ] Auto stock issue entry created
- [ ] Stock ledger reflects auto sale

---

## 14. Purchase Order Test

- [ ] Create PO
- [ ] Add PO items
- [ ] Vendor selected
- [ ] PO total correct
- [ ] Receive PO updates stock
- [ ] Purchase entry auto-created
- [ ] Price history updated

---

## 15. Stock Audit Test

- [ ] Create stock audit
- [ ] Add physical count
- [ ] Variance calculates
- [ ] Save audit adjusts stock
- [ ] Audit record visible

---

## 16. Rooms / Villas Test

- [ ] Room add/edit
- [ ] Villa add/edit
- [ ] Status: Available / Occupied / Reserved / Check-in / Check-out
- [ ] Assigned waiter change works
- [ ] Image gallery opens
- [ ] Video gallery opens
- [ ] Take order from room/villa works
- [ ] Room/villa bill combines correctly

---

## 17. Booking Test

- [ ] Public booking page opens
- [ ] Phone validation +91 + 10 digits
- [ ] Email mandatory
- [ ] Table booking does not ask ID proof
- [ ] Room/Villa booking asks ID proof image
- [ ] Only available table/room/villa shown
- [ ] Booking saves
- [ ] Booking code generated
- [ ] Add to Google Calendar link visible

---

## 18. Google Drive / Calendar Test

- [ ] Google Service Account JSON saved
- [ ] Drive folder shared with service account client_email
- [ ] Calendar shared with service account client_email
- [ ] Room/Villa booking with ID proof uploads to Drive
- [ ] Calendar event created
- [ ] Calendar event includes attachment/link
- [ ] Gmail confirmation attempted

If fails, copy:

```text
Supabase → Edge Functions → google-booking → Logs
```

---

## 19. Guest Self Ordering Test

- [ ] Guest enters phone number first
- [ ] System detects table/room/villa
- [ ] Menu shows category-wise
- [ ] Liquor hidden when Liquor OFF
- [ ] Guest can place order
- [ ] Guest does not see bill amount
- [ ] Pending items show
- [ ] Delivered items show
- [ ] Assigned waiter name/contact visible
- [ ] Review one-time discount works
- [ ] Duplicate review blocked

---

## 20. AI Tests

### Guest AI

Ask:

```text
Mera order kab aayega?
Kya room available hai?
Villa ka rate kya hai?
Birthday party karni hai
Mujhe complaint karni hai
```

- [ ] Answers are guest-specific
- [ ] Does not reveal other guest/internal data
- [ ] Gives reception/manager contact when needed

### Owner AI Copilot

Ask:

```text
Aaj sales summary batao
Kya purchase karna chahiye?
Vendor payment due batao
Kaunsa item mehenga ho gaya?
Kis department ne stock liya?
Recipe cost batao
Wastage kya hai?
```

- [ ] Answers use actual data
- [ ] Helpful action suggestions

---

## 21. Support Ticket Test

- [ ] Support tab opens
- [ ] New ticket can be created
- [ ] Device info auto-attached
- [ ] Ticket appears in Super Admin
- [ ] Super Admin can mark resolved
- [ ] CSV export works

---

## 22. Backup / Restore Test

- [ ] Download Full Backup works
- [ ] JSON file created
- [ ] Import Backup works
- [ ] Last Cloud Sync visible
- [ ] Last Local Backup visible

---

## 23. Final Pilot Decision

Mark final status:

```text
Print: Pass / Fail
Billing: Pass / Fail
Store: Pass / Fail
Reports: Pass / Fail
APK: Pass / Fail
AI: Pass / Fail
Google Sync: Pass / Fail
```

Notes:

```text
Restaurant Name:
Test Date:
Tested By:
Issues Found:
Next Fixes:
```
