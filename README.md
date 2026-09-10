# Ranima Jewellers

Premium catalogue + admin portal starter for Ranima Jewellers, Guwahati, Assam.

## V1 scope

- Premium customer catalogue
- 22K gold dynamic pricing architecture
- 925 silver catalogue with manual enquiry
- Product search/filter foundation
- Product detail pages
- WhatsApp enquiry
- HUID → official BIS route
- Custom jewellery enquiry foundation
- Mobile-first admin UI
- Inventory states: Available / Reserved / Sold / Made to Order / Archived
- Rate history architecture
- Configurable making/GST settings
- Supabase database schema
- Vercel-ready Next.js application

Wishlist is intentionally excluded from V1.

## 1. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

The project runs in demo mode without Supabase credentials.

## 2. Create Supabase

Create a Supabase project and run:

`supabase/schema.sql`

in the Supabase SQL Editor.

Then configure `.env.local` from `.env.example`.

## 3. Authentication

The UI is intentionally reviewable before Supabase setup. Before production launch:

- create two Supabase Auth users
- use phone + password
- insert corresponding rows into `admin_users`
- protect `/admin/*` through Supabase session middleware
- tighten RLS policies to only approved admin users

Do NOT use the demo admin screens in production without completing authentication.

## 4. Gold-rate provider

`lib/rates.ts` currently contains a safe demo fallback.

Before production:
- select the approved public market-rate provider
- map its response in `getCurrentGoldRate()`
- keep provider keys server-side
- add twice-daily scheduled execution
- validate/anomaly-check rates
- store accepted rates in `metal_rates`

Do not scrape a market/exchange website where its terms prohibit automated access or redistribution.

## 5. Pricing rules

Current rules:

- 22K gold only
- Gold value = 22K rate × gold weight
- >= 1.5g: making = 10% of gold value
- < 1.5g: making = ₹1,400 fixed
- GST on gold = 3%
- GST on making = 3%
- Additional charges are added separately
- Final = gold value + making + gold GST + making GST + additions

All values should become database-driven through `pricing_settings`.

## 6. Production checklist

- [ ] Register/configure `rmjewelers.com`
- [ ] Configure `manage.rmjewelers.com`
- [ ] Create private GitHub repo
- [ ] Create Vercel project
- [ ] Create Supabase project
- [ ] Run schema
- [ ] Configure environment variables
- [ ] Create admin users
- [ ] Complete Supabase middleware/RLS
- [ ] Select and test gold-rate provider
- [ ] Add twice-daily scheduled rate job
- [ ] Add rate anomaly protection
- [ ] Configure WhatsApp business number
- [ ] Replace placeholder store/contact information
- [ ] Replace demo images with Ranima product photography
- [ ] Add real categories/products
- [ ] Add multilingual translations
- [ ] Add Google Maps/store details
- [ ] Run accessibility/performance/SEO checks
- [ ] Test inventory and sold-state behaviour
- [ ] Test price calculations against real store examples
- [ ] Production security review

## 7. Future

V2 can add:
- automated WhatsApp responses
- association WhatsApp rate ingestion
- automatic silver pricing
- diamond catalogue
- CRM
- appointments
- customer accounts
- analytics

Ecommerce remains a later phase.
