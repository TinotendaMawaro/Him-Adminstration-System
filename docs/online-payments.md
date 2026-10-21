# Online payments (ClicknPay PayMe)

Tithes, offerings, seeds and partnership gifts can be paid online from **every portal** (member, partner, pastor, HOD)
through the floating **Give** button. Finance and Master see the results in the Finance portal.

## Configuration (`.env`)

```
PAYME_GIVING_ID=<public unique id for tithes / offerings / seeds>
PAYME_PARTNER_ID=<public unique id for partnership>
PAYME_EVENTS_ID=<public unique id for events & conferences>
PAYME_BASE_URL=https://backendservices.clicknpay.africa:2081   # default
PAYME_CUSTOMER_CHARGED=true      # true = customer pays the gateway fee on top; false = the church absorbs it
PAYME_MIN_AMOUNT=1  PAYME_MAX_AMOUNT=20000
PAYME_PORTAL_URL=                # where "Back to my portal" points (blank = site root)
```

Settings live in `config/payme.php`. The mapping *contribution type → ClicknPay account* is enforced on the server;
the browser can only say *what* it is giving and *how much*. If an account ID is blank, its types are simply not offered.
Event and conference fees use their own account (`PAYME_EVENTS_ID`), see below.

## Events & conferences

A member with an unpaid registration sees **Events & conferences** in the Give dialog (or **Pay online** on the registration card). They pick
the registration and pay its **balance**; the browser never sends an amount, so it cannot be altered. When ClicknPay confirms:

* the payment is completed with a receipt, the registration's paid amount is updated and a pending registration becomes **confirmed**
  (which also sends the "You're confirmed" email);
* clicking Pay twice reuses the same payment link, so no second order is created;
* a registration paid in part (e.g. at the counter) only pays the remainder;
* a **paid registration cannot be cancelled by the member** (the money would stay with the church): the events team cancels and refunds it.

A registration is payable while it is pending/confirmed, has a balance, and its event is published and has not ended.

## The flow

1. **Give** → the giver **must choose** tithe / offering / seed (partners also see Partnership). Nothing is preselected.
2. `POST /api/online-payments` creates a **pending** payment (method `online`, our unguessable `client_reference`) and a
   ClicknPay order (`POST /payme/orders`); the response's `paymeURL` (host-allow-listed) is returned and the browser is sent there.
3. The customer pays on PayMe and is returned to `GET /pay/return/{reference}` (server-rendered, public, unguessable key).
4. That page — not the customer's browser — asks the gateway for the order (`GET /payme/orders/{correlator}`) and shows the result.
5. A background job (`payments:reconcile-online`, every 5 minutes) settles customers who never came back.

## Safety rules (all covered by tests)

* A payment is `completed` **only** when the gateway itself reports `SUCCESS` for the order we created. Query-string
  "success" flags are ignored. `INITIATED`/`PENDING`/unknown statuses stay pending; they never guess success.
* The order's `clientReference` and `publicUniqueId` must match ours; currency must match; the gateway must not report
  less than the expected amount. Anything else is held as `SUCCESS_MISMATCH` for a human (Finance), never auto-credited.
  The credited amount is always the intended gift, not the fee-inclusive total the customer paid.
* Completion is idempotent and runs under a row lock: the return page, the status API and the reconciler can race
  without ever issuing two receipts or two notifications.
* Receipts, audit trail and notifications reuse the normal payment pipeline. The payer is notified in-app.
* Finance **cannot** manually confirm an online payment (only the gateway can); a flagged mismatch is the one exception.
  Online attempts do not clutter the "awaiting verification" queue; Finance can press **Re-check** to query the gateway.
* Unpaid attempts are closed as `ABANDONED` after 7 days; a late success is still recovered if the customer pays later.
* Rate limits: 10 starts/minute, and at most 10 unfinished attempts per person per hour.

## Running it

The scheduler must be running for background reconciliation: `php artisan schedule:work` locally, or a cron entry
`* * * * * php artisan schedule:run` in production.

Sandbox: ClicknPay publishes a test public id (`HQGVaTYJihldpvzsw`). Put it in both `PAYME_*_ID` values to test without
touching the live accounts. No real money can move in a sandbox order, so the SUCCESS path is exercised in tests with a
simulated gateway response.
