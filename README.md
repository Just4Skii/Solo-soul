# Solo Soul Experiences

Booking site for curated solo experiences in Durban, KwaZulu-Natal.

**Stack:** static HTML/CSS/JS · Vercel serverless API · Supabase/Postgres · PayFast

## Run locally

```bash
npm install
npm run dev        # Vercel CLI; needed for /api and /admin
```

Opening `index.html` directly works for browsing; without the API the site falls back to bundled experiences and local-only bookings. The admin panel and real payments require Vercel.

## Environment

Copy `.env.example` to `.env` (or add the variables in Vercel → Project → Environment Variables):

| Variable | Required | Purpose |
|---|---|---|
| `SUPABASE_URL` | yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | yes | Public browser key (returned by `/api/public-config`) |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server-only database access |
| `DATABASE_URL` | yes | Postgres connection string (schema setup) |
| `JWT_ADMIN_SECRET` | yes | 64-char random string for admin sessions |
| `SETUP_TOKEN` | setup only | One-time token for `/api/setup/*` |
| `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_PASSPHRASE` | payments | Real PayFast checkout/ITN |
| `PAYFAST_SANDBOX` | payments | `true` until live |
| `GEMINI_API_KEY` | optional | Ticket verification |
| `CRON_SECRET` | optional | Protects `/api/cron/verify-listings` |

Never commit `.env`; it is gitignored and blocked by `.vercelignore`.

## Provisioning

1. Deploy once, set env vars.
2. Run `database-schema.sql` in the Supabase SQL Editor (the setup endpoints are excluded from the Hobby deployment).
3. Create the first admin directly in `admin_users` with a bcrypt hash, or use `scripts/api/setup/create-admin.js` from a Pro deployment.
4. Sign in at `/admin.html`.
5. PayFast ITN lives in `scripts/api/payfast-webhook.js`; restore it under `api/` on a Pro plan if you enable PayFast.

Provisioning endpoints stay disabled unless `SETUP_TOKEN` is set, and creation is refused once an admin exists.

## Live events

The events table is sourced live from public event listings:

- Eventbrite (Durban categories: community, art, food & drink, networking, music, outdoors, wellness)
- Quicket
- Webtickets (Durban and Umhlanga searches)
- Ticketmaster (set `TICKETMASTER_API_KEY`)
- Facebook Pages (set `FACEBOOK_ACCESS_TOKEN` and `FACEBOOK_PAGE_IDS`)

`/api/events` normalises the listings, filters to Durban/KZN, removes duplicates and returns source links. There is no seeded event data; only real listings are shown. Failed sources are reported in `sources` rather than replaced with fake rows.

Filters cover category, source, area, price, date window and free-text search.

## Payments and revenue

Paystack is the default card checkout when `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` are set:

- `/api/paystack/initialize` creates a Pending booking, derives the amount from the event row and returns Paystack's authorization URL.
- `/api/paystack/webhook` verifies `x-paystack-signature` (HMAC SHA-512), then checks currency, amount and reference before marking the booking Paid.
- The browser falls back to the labelled demo checkout only if Paystack is not configured or cannot start.

Admin → **Revenue** shows gross, estimated fees, net, seats sold, occupancy, average order value, per-experience revenue and pending/refunded pipeline. Fees default to 2.9% + R1 per paid booking and can be changed with `PAYSTACK_FEE_PERCENT` / `PAYSTACK_FEE_FIXED`.

## Facebook events

Set `FACEBOOK_ACCESS_TOKEN` (a Page access token) and `FACEBOOK_PAGE_IDS` (comma-separated). Create a Meta app with the Pages API, request `pages_show_list` and `pages_read_engagement`, generate a user token in Graph API Explorer, exchange it for a long-lived token, then read `/me/accounts` and copy the Page token. Production use needs App Review for those permissions. Groups are not supported without group-admin installation and `groups_access_member_info`.

## Current limitations

- **Checkout is a clearly labelled demo** until `PAYFAST_*` credentials are configured. No card is charged. The webhook is production-ready and verifies signatures, merchant ID and amount.
- Bookings are stored in `localStorage` when the database is unavailable; they are device-local until Supabase is configured.
- Admin features require the database; there is no offline admin mode.

## Project layout

```
index.html, style.css, app.js    guest site
admin.html, admin.js, admin.css  admin dashboard
supabase.js                      public data + auth client
api/                             Vercel functions (config, admin, tickets, PayFast)
database-schema.sql              tables, triggers, policies
privacy.html, terms.html, 404.html
```

## Testing

```bash
node --check app.js
node --check supabase.js
```

Browser QA should cover: loader dismissal, stat counters, free booking, paid demo checkout, guest portal registration, mobile menu, and keyboard focus.
