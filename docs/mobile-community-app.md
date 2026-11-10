# Heartfelt Community: the mobile app

Members and partners sign in once (same login, same database as every other portal) and land in the mobile app. It also runs as an
installable web app (PWA) and is packaged as a native Android/iOS app with Capacitor. Pastors, HODs and head office keep their own portals.

## What members get

| Tab | What it does |
|---|---|
| **Home** | Stories, posts (text, photos, YouTube/Vimeo videos, polls), For you / Following / My zone feeds, likes, comments, reposts, bookmarks, share, `#hashtags` and `@mentions` |
| **Watch** | The Apostle's **teachings library**, **live sessions** with reminders and countdowns, and vertical **Shorts** |
| **Channels** | Members create channels (public or private). Each has live **chat**, a **discussion board**, shared **goals** with progress, **meetings** with RSVP and calendar export, **live** sessions and member management |
| **Market** | Partners-only shops: list products/services, take **orders** or answer **quote requests**. Every member can buy or ask for a quote |
| **Me** | Profile, saved posts, notifications, orders, events, giving, ID card, dark mode, and **My church**: zone, home group, department, prayer requests to your pastor, personal details and profile photo |

Rules that are enforced on the server (not just in the app): only **active partners** can sell; only **moderators** schedule a channel's live
sessions; private channels are invisible to outsiders; blocked people never see each other; muted or suspended people can read but not post;
media links must be YouTube/Vimeo or https images (nothing else can be embedded); photos are checked by content, not file name.

## Head office (Master console, "Community" group)

Reports queue (act or dismiss), Posts (hide / restore / pin / remove / mute author), People & access (verify, mute, suspend, restore),
Channels (suspend / official badge / delete), **Teachings** (paste a YouTube link to add a message to everyone's Watch tab),
**Live sessions** (official services), Marketplace listings (suspend / reinstate) and Orders (read-only), plus a Community widget on the dashboard.
Several independent reports auto-hide a post until a moderator reviews it. Every moderation action is audited and the person affected is told.

## Running it

- Web: `npm run dev` (members and partners get the app at `/login`; the old members portal no longer exists).
- Install on a phone: open the site in Chrome/Safari and choose "Add to Home screen". Needs HTTPS (any real deployment).
- Reminders for live sessions and meetings: `php artisan community:maintain` runs every 5 minutes through the scheduler.
- Existing users get a community profile with `php artisan community:maintain --profiles` (new users get one automatically).

## Photos

Uploads go to **Vercel Blob** in production (set `BLOB_READ_WRITE_TOKEN`) and to `storage/app/public/community` locally.
Videos are never uploaded: they are YouTube/Vimeo links, which is why the Apostle's messages should be uploaded to YouTube first.

## Native apps (Capacitor)

```
npm run build:app          # builds the web bundle for the app and syncs it into android/
npm run android:open       # opens Android Studio to run on a device / emulator
cd android && gradlew assembleDebug     # debug APK: android/app/build/outputs/apk/debug/app-debug.apk
```

The native build calls the live server: `npm run build:app` uses `.env.app` (`VITE_API_BASE`, `VITE_ASSET_ORIGIN`). Sign-in is bearer-token only (Sanctum has no stateful origins), which is what lets the installed app at `https://localhost` log in.
For the Play Store you need a signing key and `assembleRelease` (or "Generate Signed Bundle" in Android Studio). iOS needs a Mac: `npx cap add ios`.

## Tests (kept in the repo's scratch scripts, run before each release)

`community_verify` (57 checks: feed, polls, stories, follows/blocks, reports, channels, live, marketplace, security),
`community_admin_verify` (17: every console action), `pastor_scope_verify` (9: a pastor sees only their zone).

## Profile photo

Every role must have a profile photo: a prompt blocks the app/portal until one is uploaded. Photos are content-checked and stored in Vercel Blob.

## Partnership

Members see their partnership the moment they land (a strip above the tabs), and get a first-time tour that says whether they are a partner.

- Status comes from `PartnershipService`: **none, pending, active, expiring** (last 7 days), **expired**. The renewal date lives in `partners.renewal_date`.
- A completed *partnership* payment (ClicknPay) renews the partner for another month / quarter / year automatically.
- `php artisan partners:lifecycle` (daily, also called by the cron route) expires lapsed partners, sends renewal reminders and, once a month, invites members who are not partners and asks expired partners to renew.
- **Expired partners lose partner benefits:** the whole marketplace (`/api/market/*` returns 403 `partnership_expired`) and teachings marked *Partners only* in the Master console. Members who never partnered are not affected.

## Sign-in, sign-out and leaving

An animated welcome plays after every sign-in (all roles). Signing out asks first, then shows a goodbye. Back at the first screen asks "Leave Heartfelt?" (Yes / No); on Android this uses `@capacitor/app`. Web portals for pastors and HODs sign out after 30 minutes of inactivity.

## Data

Nothing is hard-coded in the front end: events, partnership packages, department members, zone details and achievements all come from the database. The church calendar lives in `database/seeders/ChurchCalendar2026Seeder.php`.

After deploying a version with new migrations run on the production database:
`php artisan migrate --force` then `php artisan db:seed --class=ChurchCalendar2026Seeder --force`.
