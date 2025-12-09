# Consultation, Design & Marketing — Full Stack App

This project includes a landing page and an admin panel to manage projects, clients, contact form submissions, and newsletter subscriptions.

## Stack
- Server: Node.js + Express + SQLite (`better-sqlite3`), image upload & cropping with `multer` + `sharp`
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
