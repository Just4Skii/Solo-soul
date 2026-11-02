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
2. Call `POST /api/setup/init-db` with header `x-setup-token: $SETUP_TOKEN`.
3. Call `POST /api/setup/create-admin` once with the same header and an admin password of 12+ characters.
4. Sign in at `/admin.html`.
5. Point the PayFast ITN URL at `/api/payfast-webhook` (signature, merchant and amount are verified).

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
