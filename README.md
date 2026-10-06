# EduPulse Analytics Platform

This project serves the dashboard from `index.html`, with a Supabase-backed persistence layer exposed through the Vercel `/api/students` function.

## Architecture

- Front-end: static HTML dashboard served as `index.html`
- API: Vercel serverless function in [api/students.js](./api/students.js)
- Database: Supabase table defined in [supabase/schema.sql](./supabase/schema.sql)
- Deployment target: Vercel

## 1) Create the backend database

1. Create or open your Supabase project.
2. Open the SQL Editor.
3. Run the contents of [supabase/schema.sql](./supabase/schema.sql).

The table is protected by row-level security. Only the backend service-role key can manage dataset rows; do not add a public read policy or put the service-role key in the frontend.

## 2) Add environment variables to Vercel

In your Vercel project, add these environment variables:

- `SUPABASE_URL` — the project URL from Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — the service role key from Supabase

Optional:

- `SUPABASE_TABLE` — defaults to `student_datasets`

## 3) Deploy

1. Push this folder to GitHub and import the repository into Vercel, or link the folder with the Vercel CLI.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the Vercel project's environment variables for the environments you will deploy. Keep the service-role key private.
3. Deploy the project.
4. Open the site and use the dashboard import modal to save or load the dataset from Supabase.

## 4) Local validation

```bash
npm install
npm run check
```

The static front-end can also be previewed locally with:

```bash
npm run dev
```

## Notes

- The dashboard keeps its local behavior when no cloud backend is configured.
- The cloud save/load actions use the Vercel `/api/students` endpoint to store the current CSV data in Supabase.
- If the API is not configured, the dashboard will show a clear message instead of silently failing.
