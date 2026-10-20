# Staff portals (Master, Finance, Events)

Three separate Filament panels, one login table. Access is decided by `User::canAccessPanel()`.

| Portal | URL | Roles | Purpose |
|---|---|---|---|
| Master console | `/admin` | `master` | Everything: pastors, members, zones, regions, finance, events, statistics, exports |
| Finance portal | `/finance` | `master`, `finance` | Receipting, payment verification, giving lists, zone remittances |
| Events portal | `/events` | `master`, `event` | Events, registrations, check-in, partner directory, statistics |

Master gets a "switch portal" link in the user menu of each panel. Finance and Events staff cannot enter any
other panel (verified by `canAccessPanel` and by each resource's `canAccess`).

## Money rules

* A **receipt number** (`REC-2026-000042`) is issued exactly once, when a payment becomes `completed`. Numbers are
  sequential per year and generated under a database row lock (`receipt_counters`), so concurrent cashiers never collide.
* Payments are **never deleted or edited once completed**. Corrections are made by **voiding** with a mandatory reason.
  Policy: `update` only while pending, `delete`/`forceDelete` always denied.
* Members/partners cannot mark their own payment as received. `POST /api/partners/me/payment` always creates a
  `pending` payment; Finance confirms it. `POST /api/payments` is Finance/Master only.
* Every payment is attributed to a zone (`payments.zone_id`, from the payer) which rolls up to its region.
* Statistics count only `completed` payments (voided/pending are excluded). Amounts are summed in one currency (USD).
* Confirm, void, record, transfer and export actions are written to `audit_logs` (`App\Services\AuditTrail`).

## Exports

`GET /exports/{report}` streams a CSV (UTF-8 BOM, opens in Excel). Each report lists the roles allowed to download it
in `ExportController::REPORTS`; the check is server-side. Cells beginning with `= + - @` are prefixed to defeat
spreadsheet formula injection. Throttled to 20/min; each download is audited.

## Statistics

All dashboards and exports use `App\Services\StatsService`, so the numbers always agree.
Charts: membership growth, income by type (monthly, stacked), income by region, members/pastors by region,
attendance, event registrations. Widgets lazy-load as they scroll into view.

## Pastor transfers

Master only: Pastors → **Transfer**. `PastorTransferService` runs in one transaction: closes the old zone history,
opens the new one, updates the pastor, their login's zone and region, audits, notifies the pastor and clears the
zone dashboard caches. A zone has one lead pastor; moving into an occupied zone makes the pastor a supporting pastor.

## Demo data (development only)

```
php artisan db:seed --class=DemoPortalDataSeeder                                   # add sample activity
php artisan tinker --execute="Database\Seeders\DemoPortalDataSeeder::purge();"     # remove exactly that data
```

Refuses to run in production. Everything it creates is tagged `[DEMO]` / `@demo.heartfelt.test`.
