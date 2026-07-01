# iVouch

**Find people your neighbours vouch for.**

iVouch is a South African community recommendation platform. It gives local WhatsApp groups a clean, trusted place to recommend, discover, and vouch for local service providers. A vouch is stronger than a star review — it comes from a real, identified neighbour.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database & Auth:** Supabase (PostgreSQL + Supabase Auth)
- **Deployment:** Vercel
- **Icons:** Lucide React

---

## Getting Started

```bash
git clone <repo> && cd ivouch
npm install
cp .env.local.example .env.local
# fill in .env.local with your Supabase credentials
npm run dev
```

Visit `http://localhost:3000`.

---

## Supabase Setup

1. Create a project at supabase.com
2. Copy Project URL and anon key into `.env.local`
3. Run in the Supabase SQL editor, in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/seed/seed.sql`

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side, CSV import) |
| `NEXT_PUBLIC_SITE_URL` | Full URL e.g. `https://ivouch.co.za` |

---

## Admin Panel

Visit `/admin` while signed in as a user with `role = 'admin'` in the profiles table.

To promote your account:
```sql
update profiles set role = 'admin' where email = 'your@email.co.za';
```

---

## CSV Import

```bash
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/import-csv.ts data/businesses.csv
```

CSV columns: `business_name, category, phone, whatsapp, area, notes, recommended_by, source`

---

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel dashboard
3. Add env vars in Settings > Environment Variables
4. Deploy — auto-deploys on push to main

---

## Brand Colors

| Name | Hex |
|---|---|
| Neighbourhood Navy | `#102A43` |
| Vouch Green | `#20B26B` |
| Warm Sunshine | `#FFC857` |
| Soft Cream | `#FFF8EC` |
| Charcoal | `#1F2933` |
| Cloud Grey | `#E8EEF2` |
| Coral Alert | `#F25F5C` |

---

## Future

- Paystack subscription tiers
- PostHog analytics
- Wildcard subdomain routing (`[suburb].ivouch.co.za`)
- WhatsApp bot for vouching via message
- Brevo email integration (stub in `lib/email/index.ts`)
