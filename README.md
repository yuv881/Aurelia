# Aurelia E-Commerce
A full-stack e-commerce application with a React + Vite frontend and an Express + PostgreSQL backend.
## 📁 Project Structure
```
Aurelia Ecomm/
├── package.json          ← Root orchestrator (run commands from here)
├── .gitignore
│
├── backend/              ← Express API (Node.js)
│   ├── package.json
│   ├── .env              ← DB, JWT, Google OAuth secrets (never commit!)
│   ├── server.js         ← Entry point
│   ├── controllers/
│   ├── routes/
│   ├── queries/
│   ├── migrations/
│   └── postgre.js
│
└── frontend/             ← React + Vite App
    ├── package.json
    ├── .env              ← VITE_* browser-safe vars only
    ├── index.html
    ├── vite.config.js
    └── src/
```
## 🚀 Getting Started
### 1. Install dependencies
```bash
npm run install:all
```
This installs `node_modules` in **both** `backend/` and `frontend/`.
### 2. Configure environment variables
**`backend/.env`**
```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
PORT=5000
```
**`frontend/.env`**
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:5000
```
### 3. Run the database migrations
```bash
node backend/migrate.js
```
### 4. Start both servers concurrently
```bash
npm run start
```
- **Backend** runs on `http://localhost:5000`
- **Frontend** runs on `http://localhost:5173`
---
## 📜 Available Scripts (run from root)
| Command | Description |
|---|---|
| `npm run install:all` | Install deps in both backend & frontend |
| `npm run start` | Run backend + frontend concurrently |
| `npm run dev:backend` | Backend only (nodemon) |
| `npm run dev:frontend` | Frontend only (Vite) |
| `npm run build` | Production build of frontend |
## 🛠 Tech Stack
### Frontend
- React 19, React Router v7
- Vite 7, Tailwind CSS v4
- Lucide React icons
### Backend
- Express 5, Node.js (ESM)
- PostgreSQL (via `postgres` library)
- JWT authentication
- Google OAuth
## 🔒 Security Notes
- Never commit `.env` files — they are in `.gitignore`
- Card payment details are masked before saving (last 4 digits only, no CVV or full number stored)
- All API endpoints that modify data require JWT authentication
#
