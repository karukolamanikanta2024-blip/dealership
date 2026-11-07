# Deployment and run guide

## Links
- Live app: https://dealership.vercel.app
- GitHub: https://github.com/karukolamanikanta2024-blip/dealership

## Demo logins
All accounts use the password `Demo@12345`. They are sample accounts with fake data.

| Role | Email | What they see |
|---|---|---|
| Admin | admin@dealership.example | All leads, plus Prices and stock at `/admin` |
| Consultant | aman@dealership.example | Leads for Gomti Nagar, Models H and C |
| Consultant | neha@dealership.example | Leads for Gomti Nagar, Model S |
| Consultant | rahul@dealership.example | Leads for Kanpur Road showroom |
| Consultant | sana@dealership.example | Leads for Civil Lines (Kanpur) |

Buyers need no login. Browsing, enquiries and test-drive booking are public.
Staff log in at `/login`.

## Suggested 5-minute walkthrough
1. Home page, then open **Model H**. Switch variant and city and watch the on-road price breakup change. Try the EMI calculator.
2. Click **Book a test drive**, choose a slot, submit. Open the same car again: the slot is now unavailable.
3. Send an enquiry from the model page.
4. Log in as `aman@dealership.example`. Find the new leads, press **Draft reply**, edit the draft, mark the lead contacted.
5. Log in as the admin, open **Prices and stock**, change a road tax value, and check the public model page.
6. Open `/used` and try the filters. Registration numbers are masked.

## Run it locally
You need Node.js 20 or newer, Git, and a PostgreSQL database (a free Neon project works).

1. Clone and install:
   ```
   git clone https://github.com/karukolamanikanta2024-blip/dealership.git
   cd dealership
   npm install
   ```
2. Create your environment file from the example and fill in the values (see the table below):
   ```
   cp .env.example .env        # on Windows: copy .env.example .env
   ```
   Create a value for `AUTH_SECRET` with:
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Generate the database client, create the tables and load the sample data:
   ```
   npx prisma generate
   npx prisma migrate deploy
   npm run seed
   ```
4. Start the app and open http://localhost:3000:
   ```
   npm run dev
   ```
5. Run the tests and a production build:
   ```
   npm test
   npm run build
   ```

Note: some Wi-Fi networks block the database port (5432). If Prisma says it cannot reach the
database server, switch to another network, such as a phone hotspot.

## Environment variables (names only)
| Name | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Direct PostgreSQL connection, used by Prisma commands (migrate, seed) |
| `DATABASE_URL_POOLED` | Yes | Pooled connection, used by the running app |
| `AUTH_SECRET` | Yes | At least 32 random characters, signs the login cookie |
| `ANTHROPIC_API_KEY` | No | Turns on AI reply drafts. Without it, drafts use a built-in template |
| `ANTHROPIC_MODEL` | No | Overrides the default AI model |
| `SITE_URL` | No | Public address used in `sitemap.xml` and `robots.txt` |

## How it is deployed
- **Hosting:** Vercel, connected to the GitHub repository. Every push to `master` deploys automatically.
- **Build command:** `prisma generate && next build` (set in `package.json`).
- **Region:** Singapore (`sin1`, set in `vercel.json`), next to the database.
- **Database:** Neon PostgreSQL in Singapore.
- **Environment variables:** set in Vercel under Settings, Environment Variables, marked as Secret.
- **Database changes:** applied manually from a developer machine with `npx prisma migrate deploy`. They are not run during the Vercel build.

## Known limits
- All cars, prices, tax rates, showrooms and people are invented sample data.
- WhatsApp and SMS messages are not sent. The consultant copies the drafted reply.
- Car pictures are placeholder illustrations.
- Hindi is not implemented yet. The interface is in English only.