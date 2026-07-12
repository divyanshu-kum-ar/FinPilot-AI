# 🚀 Render Deployment Guide — FinPilot AI Expense Tracker

## Architecture

This project deploys as **two separate Render services**:

| Service | Type | Root Directory |
|---|---|---|
| **Backend** | Web Service (Node.js) | `backend` |
| **Frontend** | Static Site (Vite) | `frontend` |

---

## ⚙️ Backend — Render Web Service

### Service Settings

| Setting | Value |
|---|---|
| **Name** | `finpilot-backend` (or any name) |
| **Region** | Singapore (closest to India) |
| **Branch** | `main` |
| **Root Directory** | `Expense-Tracker-with-Ai-Insights-main/backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free (or Starter for always-on) |

### Backend Environment Variables

Add these in Render Dashboard → Your Backend Service → **Environment**:

| Variable | Value | Where to get it |
|---|---|---|
| `PORT` | `10000` | Render uses 10000 by default |
| `NODE_ENV` | `production` | Hardcoded |
| `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas → Connect → Drivers |
| `FIREBASE_SERVICE_ACCOUNT` | `{"type":"service_account",...}` | Firebase Console → Service Accounts → Generate Key (paste full JSON as one line) |
| `GEMINI_API_KEY` | `AIza...` | https://aistudio.google.com/app/apikey |
| `FRONTEND_URL` | `https://finpilot-frontend.onrender.com` | Your frontend Render URL (set after creating frontend service) |

> **⚠️ Important:** For `FIREBASE_SERVICE_ACCOUNT`, copy the entire JSON file content and paste it as a single-line string value in the Render environment variable field.

---

## 🌐 Frontend — Render Static Site

### Service Settings

| Setting | Value |
|---|---|
| **Name** | `finpilot-frontend` (or any name) |
| **Branch** | `main` |
| **Root Directory** | `Expense-Tracker-with-Ai-Insights-main/frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `Expense-Tracker-with-Ai-Insights-main/frontend/dist` |

### Frontend Environment Variables

Add these in Render Dashboard → Your Frontend Static Site → **Environment**:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://finpilot-backend.onrender.com` (your backend Render URL) |
| `VITE_FIREBASE_API_KEY` | Your Firebase web app API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project-id.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project-id.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID |
| `VITE_FIREBASE_APP_ID` | Your app ID |

> **ℹ️ Note:** Vite bakes env vars into the bundle at build time. If you change `VITE_API_URL`, you must redeploy (trigger a new build) for it to take effect.

### React Router — SPA Routing

React Router requires all routes to serve `index.html`. This is handled automatically by the `frontend/public/_redirects` file included in this repository:

```
/*  /index.html  200
```

This file is copied to `dist/` during the Vite build and tells Render to serve `index.html` for all routes (e.g. `/transactions`, `/ai-insights`, `/profile`).

**No manual Render configuration needed for routing.**

---

## 🔥 Firebase Setup

### 1. Add Render Domain to Authorized Domains

Without this, Google Sign-In will fail with `auth/unauthorized-domain`.

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain** and enter your Render frontend URL:
   ```
   finpilot-frontend.onrender.com
   ```

### 2. Frontend Firebase Config

The frontend reads Firebase config from `VITE_*` environment variables set in Render. No credentials are hardcoded in the source.

### 3. Backend Firebase Admin

The backend verifies Firebase ID tokens using `FIREBASE_SERVICE_ACCOUNT` environment variable. The JSON key is never committed to the repository.

---

## 🗄️ MongoDB Atlas Setup

### 1. Allow All IPs (Easiest for Render)

Render's IP addresses change dynamically on the free tier. The simplest approach:

1. Open [MongoDB Atlas](https://cloud.mongodb.com)
2. Go to your cluster → **Network Access**
3. Click **+ Add IP Address**
4. Click **Allow Access from Anywhere** → enter `0.0.0.0/0`
5. Click **Confirm**

> For production-grade security, whitelist [Render's static IP ranges](https://render.com/docs/static-outbound-ip-addresses) (requires paid Render plan).

### 2. Connection String

Your `MONGO_URI` must use the Atlas connection string format:
```
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

The `db.js` config includes a 10-second connection timeout suitable for production.

---

## 📋 Deployment Checklist

### Before First Deploy

- [ ] Push all code to GitHub (`main` branch)
- [ ] Confirm `.env` files are NOT in the repository (`git ls-files | grep .env` should return nothing)
- [ ] Confirm `node_modules/` is NOT in the repository (`git ls-files | grep node_modules` should return nothing)

### MongoDB Atlas

- [ ] Create a database cluster
- [ ] Create a database user with read/write access
- [ ] Add `0.0.0.0/0` to Network Access IP allowlist
- [ ] Copy the connection string

### Firebase

- [ ] Create a Firebase project (or use existing)
- [ ] Enable Google Sign-In under Authentication → Sign-in method
- [ ] Download Service Account JSON key (Project Settings → Service Accounts)
- [ ] Get the web app config (Project Settings → Your apps)

### Render — Backend (Deploy First)

- [ ] Create new **Web Service**
- [ ] Connect GitHub repo
- [ ] Set Root Directory: `Expense-Tracker-with-Ai-Insights-main/backend`
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `node server.js`
- [ ] Add all 6 environment variables (PORT, NODE_ENV, MONGO_URI, FIREBASE_SERVICE_ACCOUNT, GEMINI_API_KEY, FRONTEND_URL)
- [ ] Deploy and verify: visit `https://your-backend.onrender.com/api/auth/profile` — should return 401 (not 502)

### Render — Frontend (Deploy Second)

- [ ] Create new **Static Site**
- [ ] Connect same GitHub repo
- [ ] Set Root Directory: `Expense-Tracker-with-Ai-Insights-main/frontend`
- [ ] Set Build Command: `npm install && npm run build`
- [ ] Set Publish Directory: `Expense-Tracker-with-Ai-Insights-main/frontend/dist`
- [ ] Add all 7 VITE environment variables
- [ ] Deploy and verify the site loads

### After Both Services Are Live

- [ ] Add the frontend Render URL to Firebase Authorized Domains
- [ ] Update `FRONTEND_URL` in backend Render env vars (if not done already)
- [ ] Test Google Sign-In
- [ ] Test adding/editing/deleting a transaction
- [ ] Test AI Insights
- [ ] Test Export (Excel + PDF)
- [ ] Test dark mode toggle

---

## 🏗️ Local Development

```bash
# Backend
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev            # starts on http://localhost:5000

# Frontend (in a separate terminal)
cd frontend
cp .env.example .env   # set VITE_API_URL=http://localhost:5000
npm install
npm run dev            # starts on http://localhost:5173
```

---

## ⚡ Free Tier Limitations

| Issue | Cause | Solution |
|---|---|---|
| Backend takes ~30s to respond after inactivity | Render free web services spin down | Upgrade to Starter ($7/mo) for always-on |
| First login after sleep is slow | Same reason | Same fix |
| AI Insights rate limited | Gemini free tier quota | Wait for daily reset or upgrade API plan |

---

## 📁 Repository Structure

```
/
├── .gitignore               ← Root gitignore (node_modules, .env, dist)
├── DEPLOY_RENDER.md         ← This file
├── backend/
│   ├── .env.example         ← Template for backend env vars (safe to commit)
│   ├── .gitignore           ← Backend-specific ignores
│   ├── package.json         ← start: "node server.js"
│   ├── server.js            ← Express entry point, PORT + CORS configured
│   └── src/
│       ├── config/          ← db.js, firebase.js
│       ├── controllers/     ← aiController, authController, reportController, transactionController
│       ├── middleware/      ← authMiddleware, errorHandler
│       ├── models/          ← Transaction, User
│       ├── routes/          ← aiRoutes, authRoutes, reportRoutes, transactionRoutes
│       ├── templates/       ← aiReportTemplate.js
│       └── fonts/           ← NotoSans-Regular.ttf (used by PDF export)
└── frontend/
    ├── .env.example         ← Template for frontend env vars (safe to commit)
    ├── .gitignore           ← Frontend-specific ignores
    ├── package.json         ← build: "vite build"
    ├── vite.config.js
    ├── tailwind.config.js   ← includes @tailwindcss/typography plugin
    ├── public/
    │   ├── favicon.png
    │   └── _redirects       ← SPA routing for Render (/* /index.html 200)
    └── src/
        ├── api/             ← transactions.js (uses VITE_API_URL)
        ├── components/      ← AIInsights, ExportButtons, charts, Navbar, Sidebar...
        ├── context/         ← AuthContext, ThemeContext, TransactionContext
        ├── hooks/           ← useAIInsights
        ├── pages/           ← Dashboard, Transactions, Reports, AIInsightsPage, Profile, Login
        └── firebase.js      ← reads VITE_FIREBASE_* env vars (no hardcoded keys)
```
