# Truck Inventory Yard

Marketplace SaaS for connecting advertisers with transport companies selling truck and trailer advertising space.

## Local setup

1. Copy `.env.example` to `.env`.
2. Set a real PostgreSQL `DATABASE_URL`.
3. Generate Prisma client and push schema:

```powershell
npm.cmd run db:generate
npm.cmd run db:push
npm.cmd run db:seed
```

4. Start the app:

```powershell
npm.cmd run dev
```

## Deploy to Vercel

This project is designed to be deployed directly from a Git repository connected to Vercel.

### Required environment variables

Set these in `Project Settings -> Environment Variables`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require
APP_URL=https://your-project.vercel.app
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
APP_NAME=Truck Inventory Yard
SESSION_SECRET=replace-with-a-random-secret-at-least-32-characters-long
EMAIL_FROM=hello@example.com
UPLOAD_MAX_FILE_SIZE_MB=5
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp,application/pdf
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=60
CAPTCHA_PROVIDER=disabled
CAPTCHA_SITE_KEY=
CAPTCHA_SECRET_KEY=
```

### Database

Use an external PostgreSQL database for production, for example:

- Neon
- Supabase
- Railway
- Vercel Postgres

After setting `DATABASE_URL`, run schema push and seed against that database:

```powershell
npm.cmd run db:generate
npm.cmd run db:push
npm.cmd run db:seed
```

### Notes

- `APP_URL` is used for metadata and runtime URLs.
- If `APP_URL` is not set, the app falls back to `NEXT_PUBLIC_APP_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, or `VERCEL_URL`.
- `SESSION_SECRET` is required for secure cookie-based auth.
- Never commit `.env` to Git.
