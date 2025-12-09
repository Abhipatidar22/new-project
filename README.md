# Consultation, Design & Marketing — Full Stack App

This project includes a landing page and an admin panel to manage projects, clients, contact form submissions, and newsletter subscriptions.

## Stack
- Server: Node.js + Express + SQLite (`sqlite3`), image upload & cropping with `multer` + `sharp`
- Client: React + Vite

## Quick Start (Windows PowerShell)

```powershell
# From the project root
# Install server deps
cd "c:\Users\Abhi\Downloads\new project\server"; npm install
# Seed initial data
npm run seed
# Start API server
npm run dev

# In a new terminal, start client
cd "c:\Users\Abhi\Downloads\new project\client"; npm install
npm run dev
```

- API runs on `http://localhost:5000`
- Client runs on `http://localhost:5173`

The landing page displays:
- Our Projects (fetched from backend) with image, name, description, and a non-functional Read More button
- Happy Clients (fetched from backend) with image, description, name, designation
- Contact Form (submits to backend and visible in admin panel)
- Newsletter section (submits email to backend)

Admin Panel tabs allow adding projects and clients (with image upload + 450x350 cropping), and viewing contacts and subscriptions.

Notes:
- Uploaded images are stored under `server/uploads` and served via `/uploads/...`.
- Placeholder images appear if none uploaded.

## Frontend Deploy (Vercel)

- Root Directory: set to `client` in Vercel project settings.
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Environment Variables:
	- `VITE_API_BASE` = `https://new-project-4jlz.onrender.com/api`
	- `VITE_IMG_BASE` = `https://new-project-4jlz.onrender.com`

Steps:
- In Vercel, create/import the repo and set Root Directory to `client`.
- Add the environment variables above for Production (and Preview if needed).
- Deploy; Vercel will serve the built `dist` and the app will call the Render API.

Optional:
- For local prod build pointing at Render, run:
	- `cd client`
	- `npm run build`
	- `npm run preview`
	- Ensure `client/.env.production` has the same values as above.

## Seed Data via Admin UI (Hosted)

- Open the deployed frontend: `https://new-project-3gqq.vercel.app/`.
- Use the Admin Panel to add:
	- **Projects:** name, description, and an image (cropped to 450x350).
	- **Clients:** name, designation, description, and an image.
- Verify data on the backend:
	- Projects: `https://new-project-4jlz.onrender.com/api/projects`
	- Clients: `https://new-project-4jlz.onrender.com/api/clients`
- Verify uploaded images:
	- Images are served from `https://new-project-4jlz.onrender.com/uploads/...` and will display on the Vercel site.

Notes:
- Ensure the backend allows CORS from your Vercel domain (e.g., set `CORS_ORIGIN` to `https://new-project-3gqq.vercel.app`).
- For persistence of uploads and the SQLite DB across deploys, attach a persistent disk to the Render service for `server/data` and `server/uploads`.

## Operations

- Reseed backend data:
	- Without key: `POST https://new-project-4jlz.onrender.com/api/seed`
	- With key: set `SEED_KEY` in Render, then send header `x-seed-key: <your-seed-key>` when calling `/api/seed`.
- View data quickly:
	- Projects: `GET https://new-project-4jlz.onrender.com/api/projects`
	- Clients: `GET https://new-project-4jlz.onrender.com/api/clients`
	- Contacts: `GET https://new-project-4jlz.onrender.com/api/contacts`
	- Subscriptions: `GET https://new-project-4jlz.onrender.com/api/subscriptions`
- CORS configuration:
	- Env var `CORS_ORIGIN` on Render supports multiple entries and wildcards.
	- Examples: `https://new-project-3gqq.vercel.app`, `*.vercel.app` (for previews), or a custom prod domain.
- Persistence (recommended):
	- Attach a persistent disk to the Render service; ensure it maps to `server/data` (SQLite DB) and `server/uploads` (images).

## Admin Guide

- Overview:
	- The Admin Panel is included on the main site. It provides tabs to add Projects and Clients (with image upload + automatic 450x350 cropping), and to view Contact submissions and Newsletter subscriptions.
- Add Projects:
	- Fill name and description; upload an image. On submit, the image is cropped server-side and stored under `server/uploads`, and a record is saved in SQLite.
- Add Clients:
	- Fill name, designation, description; upload an image. On submit, the image is cropped and saved; the client appears in the Clients list on the landing page.
- View Contacts:
	- Submissions from the landing page Contact Form appear here automatically. Backend endpoint: `GET /api/contacts`.
- View Subscriptions:
	- Newsletter signups appear here automatically. Backend endpoint: `GET /api/subscriptions`.
- Image paths:
	- The frontend displays images using `VITE_IMG_BASE` + `/uploads/<filename>`. In production this points to the Render backend.

## Data Storage & Viewing

- SQLite Database:
	- File: `server/data/app.db` on the backend server. This stores tables for projects, clients, contacts, and subscriptions.
- Uploaded Images:
	- Directory: `server/uploads`. Files are served at `https://<backend-host>/uploads/<filename>`.
- Quick Data Views (hosted):
	- Projects: `GET https://new-project-4jlz.onrender.com/api/projects`
	- Clients: `GET https://new-project-4jlz.onrender.com/api/clients`
	- Contacts: `GET https://new-project-4jlz.onrender.com/api/contacts`
	- Subscriptions: `GET https://new-project-4jlz.onrender.com/api/subscriptions`
- Local Inspection (optional):
	- You can open `app.db` with any SQLite viewer (e.g., DB Browser for SQLite). Download it from the Render persistent disk, then inspect tables.


## Backup & Restore

- Backup (Render):
	- Stop the service or ensure no writes during backup.
	- Download `server/data/app.db` (SQLite database) and zip `server/uploads` (images) from the mounted disk.
	- Store backups securely (date-stamped).
- Restore:
	- Upload your saved `app.db` to `server/data` and unzip `uploads` to `server/uploads` on the mounted disk.
	- Restart the service; verify endpoints and image URLs.

## Troubleshooting

- CORS errors in browser:
	- Set `CORS_ORIGIN` on Render to your exact Vercel domain (no trailing slash) or use `*.vercel.app` for previews.
	- Redeploy the backend; confirm `Access-Control-Allow-Origin` echoes your frontend origin.
- Empty lists (projects/clients):
	- Run `POST /api/seed` to populate demo data; refresh frontend.
- Image upload issues:
	- Ensure `server/uploads` exists and your persistent disk maps correctly.
	- Cropping uses `sharp`; if it fails, the original image is served.
- Data not persisting across deploys:
	- Verify the persistent disk is attached and paths point to `server/data` and `server/uploads`.
