# 🚀 Deployment Guide

Cipher Drop has **two parts** that deploy to **two different places**:

```
┌────────────────────┐        ┌──────────────────────────┐        ┌──────────────────┐
│  Frontend (Vite)   │  API   │  Backend (Express)       │        │  Storage         │
│  → Vercel          │ ─────▶ │  → Render / Railway / Fly │ ─────▶ │  Firebase / disk │
└────────────────────┘        └──────────────────────────┘        └──────────────────┘
```

> ⚠️ **Vercel cannot host the Express backend.** Vercel runs serverless functions, not a
> long-running server, and its filesystem is ephemeral (so `STORAGE_DRIVER=local` loses
> files). Deploy the **frontend to Vercel** and the **backend to a host that runs a Node
> server with durable storage**.

---

## 1. Frontend → Vercel

1. Push this repo to GitHub (already done).
2. On [vercel.com](https://vercel.com) → **Add New → Project → Import** this repo.
3. Vercel auto-detects **Vite** (config is in `vercel.json`): build `npm run build`, output `dist`.
   `vercel.json` also adds SPA routing so `/dashboard`, `/upload`, etc. don't 404 on refresh.
4. Add the environment variables below, then **Deploy**.

### Vercel environment variables

> `VITE_*` vars are **baked in at build time** — after changing any, trigger a redeploy.

| Variable | Value | Required |
|---|---|---|
| `VITE_API_URL` | `https://<your-backend-host>/api` | **Yes** — without this it calls `localhost` and every request fails |
| `VITE_FIREBASE_API_KEY` | from Firebase web config | Recommended |
| `VITE_FIREBASE_AUTH_DOMAIN` | `<project>.firebaseapp.com` | Recommended |
| `VITE_FIREBASE_PROJECT_ID` | your project id | Recommended |
| `VITE_FIREBASE_STORAGE_BUCKET` | `<project>.firebasestorage.app` | Recommended |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | from Firebase web config | Recommended |
| `VITE_FIREBASE_APP_ID` | from Firebase web config | Recommended |
| `VITE_FIREBASE_MEASUREMENT_ID` | from Firebase web config | Optional |

(The Firebase web config is public — it's safe to expose in the frontend.)

---

## 2. Backend → Render / Railway / Fly / VPS

Deploy the `backend/` folder as a standard Node web service.

- **Root directory:** `backend`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Health check path:** `/api/health`

### Backend environment variables

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | |
| `PORT` | provided by host | Express reads `process.env.PORT` |
| `FIREBASE_PROJECT_ID` | your project id | |
| `FIREBASE_STORAGE_BUCKET` | `<project>.firebasestorage.app` | |
| `ALLOWED_ORIGINS` | `https://<your-app>.vercel.app` | **Required** — CORS allowlist (add custom domain too, comma-separated) |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | the **full JSON** of `serviceAccountKey.json`, minified to one line | How you supply credentials on a host (the file isn't in the repo) |
| `STORAGE_DRIVER` | `firebase` **or** `local` | See storage options below |
| `STORAGE_DIR` | absolute mount path, e.g. `/var/data` | Only for `local` on a persistent volume |
| `MAX_FILE_SIZE` | `104857600` | Optional (100 MB default) |

> **Credentials:** the backend reads `FIREBASE_SERVICE_ACCOUNT_KEY` (inline JSON) first, then
> `GOOGLE_APPLICATION_CREDENTIALS` (a file path), then a local `serviceAccountKey.json`. On a
> PaaS, paste the JSON into `FIREBASE_SERVICE_ACCOUNT_KEY`.

### Storage options (pick one)

- **Firebase Cloud Storage** — `STORAGE_DRIVER=firebase`. Requires a provisioned bucket
  (Firebase **Blaze** plan).
- **Persistent volume** — `STORAGE_DRIVER=local` + `STORAGE_DIR=/var/data` pointed at a
  mounted disk (Render Disk / Railway Volume / Fly Volume), running a **single instance**.

> ❌ Do **not** use `local` storage without a persistent volume on an ephemeral host — uploads
> are lost on restart/redeploy and downloads will 404.

---

## 3. Firebase

Firebase Console → **Authentication → Settings → Authorized domains** → add your Vercel
domain (e.g. `your-app.vercel.app`) and any custom domain. Google/email sign-in fails otherwise.

---

## 4. Wire them together

1. Deploy the backend → note its URL (e.g. `https://cipher-drop-api.onrender.com`).
2. Set the frontend's `VITE_API_URL` to `https://cipher-drop-api.onrender.com/api` → redeploy on Vercel.
3. Set the backend's `ALLOWED_ORIGINS` to your Vercel URL.
4. Visit the Vercel URL, sign in, and upload a file end-to-end. ✅
