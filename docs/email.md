# Email (Resend)

Every email the system sends goes through **Resend** with one premium, mobile-friendly template (plus a plain-text twin),
a queue, a delivery log and safety rules. Nothing blocks a web request: a slow mail provider cannot slow the site.

## Setup

```
MAIL_MAILER=resend
RESEND_API_KEY=re_...                       # never commit this; .env is git-ignored
MAIL_FROM_ADDRESS="no-reply@heartfeltonline.org"   # heartfeltonline.org is verified in Resend
MAIL_FROM_NAME="Heartfelt International Ministries"
APP_URL=https://your-domain                 # links inside emails are built from this: it must be the real site address
PORTAL_URL=https://your-portal-domain       # where "Open my portal" buttons go (blank = APP_URL)
MAIL_TIMEZONE=Africa/Harare                 # times shown in emails (server runs in UTC)
```

Run the queue worker (it actually sends): `php artisan queue:work --tries=3`. `start-dev.bat` starts it, the scheduler,
the web server and Vite together.

### Domain and delivery tracking

1. **Sending domain:** `heartfeltonline.org` is verified in Resend, so email goes out as `no-reply@heartfeltonline.org` to anyone.
   Replies go to `support@heartfeltonline.org` (`MAIL_SUPPORT_ADDRESS`). Any other domain must be verified in Resend (Domains → Add) first;
   until then only `onboarding@resend.dev` works, and only to your own Resend account email.
2. **Delivery tracking (optional but recommended):** Webhooks → add `https://YOUR-DOMAIN/api/webhooks/resend`, subscribe to
   `email.delivered`, `email.bounced`, `email.complained`, `email.failed`, then put the signing secret in `RESEND_WEBHOOK_SECRET`.
   Hard bounces and spam complaints then stop us emailing that address automatically (protecting your sender reputation).

### Logo

Every email starts with the ministry logo (`public/images/logo.jpeg`) on a white header with a navy and gold rule. It is **embedded in each message**
as an inline image, so it shows in the inbox with no hosting and no "load images" prompt. To use a hosted image instead set
`MAIL_LOGO_URL=https://...`; to change the logo replace the file (or edit `config/mailing.php` -> `logo`). If the file is missing the
header falls back to the ministry name, never a broken image. The receipt page and the password/preference pages carry the same logo.

## What gets emailed

| When | Email | Optional? |
|---|---|---|
| Account created (member sign-up, or created by head office) | Welcome, specific to the role (member / partner / pastor / HOD / staff) | no |
| Password changed | Security alert (time, IP, device) | no |
| Email address changed | Alert to the **old** address + confirmation to the **new** | no |
| Name, account type, zone, department, active/inactive changed | "Your account was updated" with before → after (deactivation worded accordingly) | no |
| Payment completed (counter or online) | Receipt with a signed link that works without signing in | no |
| Receipt voided / online payment failed | Plain explanation (internal void reasons are never shown) | no |
| Event registration received / confirmed / cancelled / attended | Event details + calendar invite (.ics) | no |
| Any in-app notification | A copy of it | **yes** (one-click unsubscribe) |
| Online payment that needs a human | Alert to Finance and Master (once) | no |
| Forgot password (members and staff) | Secure reset link | no |

Routine profile edits (phone, address, photo, tour) send nothing.

## Safety rules

* **Seeders and demo data never email.** Seeders run silenced, and reserved domains (`.test`, `.invalid`, `.example`, `example.com`, and `heartfelt.church`, the placeholder domain on the seeded demo accounts) are never emailed.
* **Notification copies are rate-limited:** the same title to the same person is sent once per 12 hours and at most 20 a day, so an
  hourly reminder job can never flood an inbox. Prayer-centre notifications are sent **without their text** (the content stays in the portal).
  Categories that already have their own email (event registrations, "Thank you for your gift") are not duplicated.
* **Opt-outs:** every notification copy carries `List-Unsubscribe` (one-click) and a footer link. Receipts, security alerts and resets are never optional.
* **Passwords are never emailed.** Pastor codes are never emailed. Reset links are single-use, expire (60 min) and sign the person out of every device.
* **No account enumeration:** "Forgot password" gives the same answer whether or not the email exists.
* **Retries are safe:** each email has a stable Idempotency-Key, so a retry can never send a duplicate. Permanent rejections (bad address, unverified domain) are
  recorded as failed and not retried; temporary errors (rate limit, outage) retry with back-off.
* Signed links (receipts, unsubscribe) are tamper-proof and expire after 30 days.

## Operating it

* **Master → Reports → Email log** shows every email: to whom, status (queued, sent, delivered, bounced, failed, skipped), Resend id and error.
  **Send test email** proves the connection works. Use `delivered@resend.dev` to test without a verified domain.
* `php artisan mail:preview all` renders every email from **real database records** into `storage/app/mail-previews/*.html` to look at.
  Add `--send --to=delivered@resend.dev` to send them for real to Resend's safe test inbox.
* Switch everything off with `MAILING_ENABLED=false`; switch only notification copies off with `MAIL_MIRROR_NOTIFICATIONS=false`.
