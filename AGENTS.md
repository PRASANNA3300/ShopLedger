# ShopLedger

## Stack
- Node.js application using Express 4 and body-parser.
- `server.js` serves `public/`, mounts JSON API routers at `/api`, and serves printable HTML invoices.
- Persistent application data is stored in `data/db.json` by `lib/store.js`.

## Module map
- `routes/products.js` — lists products and active coupons.
- `routes/orders.js` — lists, fetches, places, and cancels orders.
- `routes/customers.js` — lists customers and settlements; records Khata settlements.
- `routes/reports.js` — dashboard and GST reports, pricing preview, and admin export.
- `lib/coupons.js` — normalizes, validates, calculates, and lists coupons.
- `lib/dates.js` — current date, date keys, and fiscal year helpers.
- `lib/inventory.js` — product lookup, sellable stock checks, reservations, and summaries.
- `lib/invoice.js` — computes invoice figures and renders printable invoice HTML.
- `lib/ledger.js` — customer lookup, Khata charges/reversals, and settlements.
- `lib/orders.js` — adds, gets, cancels, and filters orders.
- `lib/pricing.js` — computes subtotals, discounts, line tax, and order totals.
- `lib/reports.js` — dashboard summary and GST reconciliation calculations.
- `lib/store.js` — reads and writes `data/db.json` and appends audit entries.
- `lib/tax.js` — resolves item GST rates and splits GST into CGST and SGST.

## Commands
- Start the app: `npm start` (runs `node server.js`).
- Run tests: `node --test` (Node.js built-in test runner).

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
- Invoice total and GST breakdown do not match what the customer was billed.
- Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
