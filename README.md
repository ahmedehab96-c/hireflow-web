# HireFlow Web

React single-page app for **HireFlow**, an AI-powered career management platform. It talks to the Laravel API in `hireflow-api`; see that repository's README for the full project overview, architecture and API docs.

**Stack:** React 19 · Vite 8 · Tailwind CSS 4 · React Router 7 · Axios · Lucide icons. There are no other runtime dependencies; charts are plain CSS.

## Run locally

```bash
# 1. Start the API (in ../hireflow-api)
php artisan serve                 # http://127.0.0.1:8000

# 2. Frontend
cp .env.example .env              # then set VITE_API_URL=http://127.0.0.1:8000/api
npm install
npm run dev                       # http://localhost:5173
```

In development, the login page offers one-click sign-in with the seeded demo accounts (a candidate and an admin).

## Environment

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API base URL including `/api`. Empty means same-origin `/api` (e.g. behind a reverse proxy) |
| `VITE_DEMO_MODE` | `true` shows the demo sign-in panel in a production build. Use only for a public demo seeded with demo data |

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | oxlint |

## Pages

| Area | Routes |
|---|---|
| Public | `/`, `/jobs`, `/jobs/:id`, `/login`, `/register` |
| Candidate | `/app` (dashboard and activity), `/app/applications`, `/app/applications/:id`, `/app/profile`, `/dashboard/cv`, `/dashboard/interviews`, `/dashboard/interviews/new`, `/dashboard/interviews/:id` |
| Admin | `/admin` (analytics), `/admin/companies`, `/admin/jobs`, `/admin/skills`, `/admin/users`, `/admin/profile` |

Routes are protected by role. A candidate opening an admin URL (or the reverse) is redirected to their own dashboard.

## Structure

```
src/
  components/   ui/ (buttons, fields, modal, table, feedback states), jobs/, applications/,
                ai/ (score ring, CV analysis, match), interview/, notifications/, activity/, admin/
  context/      AuthProvider (token + current user), ToastProvider
  hooks/        useAsync, useForm, useAdminList, useApplicationStats, useDebounce, …
  layouts/      PublicLayout, DashboardLayout (sidebar + notifications), AuthLayout
  pages/        public/, candidate/, admin/, shared/
  routes/       router (lazy-loaded pages) + ProtectedRoute / GuestRoute guards
  services/     api.js (single axios client) + one service per resource
  utils/        constants (statuses, score bands), formatting, validation
```

## Notes

- **Auth token:** the API issues Sanctum bearer tokens. The token is kept in `localStorage`, and only `services/api.js` reads or writes it. Any 401 clears it and signs the user out.
- **No raw HTML:** the app never renders HTML from user or AI content, which keeps the XSS surface small.
- **Long AI calls:** AI requests use a longer timeout and show skeletons while they run. AI errors are shown inline with a retry button.
