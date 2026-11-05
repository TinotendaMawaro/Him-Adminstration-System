# People, ID cards and day-to-day operations

## Who can do what

| Action | Master | Pastor | Others |
|---|---|---|---|
| Add / edit / remove members, pastors, staff accounts | Master console (Members, Pastors, Users) | - | - |
| Move a **member** to another zone | any member | members of **their own zone** (Pastors portal, Members tab, "Move zone") | - |
| Transfer a **pastor** to another zone / region | Pastors, "Transfer" | - | - |
| Message pastors (all, a region, chosen zones, individuals) | Message pastors | - | - |
| Monthly ministry report + CSV | Reports, Monthly report | - | - |

A member keeps their member number for life when they change zone. Every move records who, why and when (audit log) and notifies the
member and the pastors involved. A member who leads a home group cannot be moved until a new leader is appointed.

New members and pastors get a welcome email and a secure link to choose their own password. Nobody is ever emailed a password.
Removing a person switches their login off immediately and ends their sessions; their history, giving and receipts are kept.

## ID cards

Every role has a card (full name, zone, date of birth, member number / pastor code / staff ID, QR code):

- Members, partners, HODs, pastors: **profile** area of their portal (`GET /api/id-card`).
- Master, Finance, Events: **My ID card** in each staff portal.
- Download as PNG or SVG, or print at credit-card size (85.6 x 54 mm).
- The QR code opens `APP_URL/verify/<signed token>`: it shows only name, number, zone and active/inactive. It cannot be forged
  or guessed, and shows nothing private (no date of birth, phone or email). **Set `APP_URL` to the real https address before printing cards.**
- The card renderer is `resources/js/lib/idCard.core.js`; rebuild the shipped bundle with `node scripts/build-idcard.mjs`.

## Keeping the data consistent

```
php artisan him:check-data          # report: zone / department / home group / date-of-birth / payment-zone mismatches, missing records
php artisan him:check-data --fix    # repair the ones with one obviously right answer (audited)
```

Zone, home group, department and date of birth are mirrored automatically between a person's login account and their member record.

## Before going live

```
php artisan him:security-check          # APP_DEBUG, APP_URL/https, cookies, database user, demo passwords, demo emails
php artisan him:lock-demo-passwords     # replace the shared demo password with random ones (owners use "Forgot password")
```

Also: set `AUTH_PASTOR_PASSWORD_REQUIRED=true` once pastors have passwords (pastor codes follow a guessable pattern), clear `MAIL_REDIRECT_TO`,
and set `APP_ENV=production`, `APP_DEBUG=false`.

## Test mode for email

`MAIL_REDIRECT_TO=you@example.com` delivers every email to that one inbox, with the intended recipient in the subject (`[for someone@x.org] ...`).
Demo and test addresses can then be exercised for real. Leave blank in production.

## Speed on a development machine

- `start-dev.bat` runs `scripts/dev-server.mjs`: four PHP workers behind one port (PHP's built-in server handles one request at a time on Windows).
- XAMPP's `php.ini` needs `zend_extension=opcache`, `opcache.enable_cli=1` and `extension=fileinfo`.
- Keep the project and `CACHE_FILE_PATH` **outside OneDrive** (or exclude them from sync and antivirus scanning); sync clients lock files and slow PHP badly.
