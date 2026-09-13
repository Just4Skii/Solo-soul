# Solo Soul Experiences

A responsive experience-booking web application with a Supabase-backed reservation model and a payment workflow designed around avoiding overbooking.

## Project focus

Solo Soul explores the engineering behind an experience marketplace: event discovery, availability, reservations, customer interaction and payment flow. The project evolved from browser-only state to a database-backed architecture to address cross-device persistence and booking concurrency.

## Engineering highlights

- Responsive, mobile-first interface
- Supabase client/service integration
- Relational database schema for users, experiences and reservations
- Reservation holds designed to prevent two users from taking the same final spot
- Database-level protection against overbooking
- Gallery lightbox and testimonial carousel
- Theme switching and mobile navigation
- Payment simulator with a clear path toward PayFast ITN integration

The repository audit documents the migration from localStorage to Supabase and the booking-flow concurrency problem that motivated the reservation design. fileciteturn31file0L2-L2

## Booking architecture

```text
Customer
   │
   ▼
Experience UI
   │
   ▼
Reservation service
   │
   ├── create temporary hold
   ├── validate availability
   ├── payment step
   └── confirm reservation
          │
          ▼
      Supabase
          ├── relational data
          └── database constraints/triggers
```

The key engineering concern is concurrency. Availability cannot safely be managed only in browser state. The project therefore introduces a server-backed reservation flow with a temporary hold and database protection against overbooking.

## Repository structure

```text
.
├── app.js
├── supabase.js
├── database-schema.sql
├── AUDIT.md
├── app-enhanced.js
├── admin.html
├── admin.css
└── styles/
```

## Run / configuration

The project is a browser application and requires the Supabase project configuration used by the application. Do not commit private credentials; use the public client configuration intended for browser use and enforce access through database policies.

The database schema is provided in `database-schema.sql`.

## Payment status

The payment layer currently contains a simulator. The project audit explicitly identifies real PayFast integration and an ITN/webhook endpoint as remaining work rather than presenting simulated payment as production payment processing. fileciteturn31file0L2-L2

## What this demonstrates to an employer

This project demonstrates practical frontend engineering, data modelling, state management, database-backed workflows and awareness of race conditions in transactional systems. The most valuable engineering story is the transition from localStorage-only booking logic to a persistent reservation architecture.

## Status

Portfolio project. Payment processing remains simulated until a secure server-side PayFast integration is configured.
