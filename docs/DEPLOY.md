# Deployment Guide (Free)

Deploy Aegis Vaults frontend to **Vercel** or **GitHub Pages** at no cost.

---

## Option A: Vercel (recommended)

**Free tier:** 100 GB bandwidth/month, unlimited static sites. No credit card required.

### 1. Push your repo to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aegis-vaults.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New** → **Project**.
3. Import your `aegis-vaults` repo.
4. Configure:
   - **Root Directory:** `packages/frontend` (click Edit, set to `packages/frontend`)
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3. Add environment variables

In Project Settings → Environment Variables, add:

| Name | Value |
|------|-------|
| `VITE_VAULT_ADDRESS` | Your vault contract address (or leave empty for demo) |
| `VITE_VAULT_TYPE` | `demo` or `full` |
| `VITE_RPC_URL` | `https://services.polkadothub-rpc.com/testnet` |
| `VITE_CHAIN_ID` | `420420417` |
| `VITE_WS_ENDPOINT` | `wss://paseo-asset-hub-rpc.polkadot.io` |

### 4. Deploy

Click **Deploy**. Vercel builds and deploys. Future pushes to `main` auto-deploy.

---

## Option B: GitHub Pages

**Free:** Hosted on GitHub Pages.

### 1. Add a GitHub Actions workflow

Create `.github/workflows/deploy.yml` (or copy from the repo). The workflow builds `packages/frontend` and deploys to GitHub Pages.

### 2. Customize base path (if repo name differs)

If your repo is not `aegis-vaults`, change `VITE_BASE_PATH` to `/your-repo-name/`.

### 3. Enable GitHub Pages

1. In your repo: **Settings** → **Pages**.
2. Under **Build and deployment**, choose **GitHub Actions**.

### 4. Deploy

Push to `main`. The workflow runs and deploys the site. After a minute or two, it’s live at `https://YOUR_USERNAME.github.io/aegis-vaults/`.

---

## Cost summary

| Service | Cost |
|---------|------|
| **Vercel** | Free (Hobby plan; no credit card) |
| **GitHub Pages** | Free |
| **GitHub** | Free (public repos) |

---

## Troubleshooting

**Build fails on Vercel**

- Ensure `Root Directory` is `packages/frontend`.
- Check that `npm run build` succeeds locally with `cd packages/frontend && npm run build`.

**GitHub Pages shows 404**

- Confirm `VITE_BASE_PATH` is `/aegis-vaults/` (or `/your-repo-name/`).
- Ensure the workflow runs and the artifact upload succeeds.

**RPC or API errors in production**

- Check that `VITE_RPC_URL` and `VITE_WS_ENDPOINT` are correct and reachable from the browser.
