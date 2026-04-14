# Full-Stack Monorepo (React + Vercel Serverless API + MongoDB Atlas)

This repository contains a production-ready, scalable monorepo with:

- `frontend/`: Vite + React + Tailwind CSS
- `backend/`: Vercel serverless auth API + MongoDB Atlas

## Complete Project Structure

```text
.
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.js
│   │   │   ├── signup.js
│   │   │   ├── forgot-password.js
│   │   │   ├── reset-password.js
│   │   │   └── me.js
│   │   └── lib/
│   ├── src/
│   └── vercel.json
├── frontend/
│   ├── .env.example
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── components/
│       │   ├── Button/
│       │   ├── Input/
│       │   ├── Card/
│       │   └── Layout/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       ├── context/
│       ├── utils/
│       └── assets/
├── package.json
└── README.md
```

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB (local instance or MongoDB Atlas)

## Setup (Local)

1. Install dependencies at the repository root:

   ```bash
   npm install
   ```

2. Configure backend environment variables:

   - Windows PowerShell: `Copy-Item backend/.env.example backend/.env`
   - Mac/Linux: `cp backend/.env.example backend/.env`

   Update `backend/.env` values as needed (`MONGODB_URI`, `JWT_SECRET`).

3. Configure frontend environment variables:

   - Windows PowerShell: `Copy-Item frontend/.env.example frontend/.env`
   - Mac/Linux: `cp frontend/.env.example frontend/.env`

4. Run both frontend and backend in development:

   ```bash
   npm run dev
   ```

5. Access the apps:
   - Frontend: `http://localhost:5173`
   - Backend health: `http://localhost:5000/api/health`
   - Backend items API: `http://localhost:5000/api/items`

## Scripts

- `npm run dev`: run frontend + backend together
- `npm run dev:frontend`: run only frontend
- `npm run dev:backend`: run only backend
- `npm run build`: build frontend
- `npm run start`: start backend in production mode

## Architecture Notes

- Backend follows MVC + service-layer pattern.
- Frontend follows component-based architecture with dedicated folders.
- API communication is centralized in frontend services.
- Error handling is centralized in backend middleware and frontend hook state.

## Authentication API Endpoints (Vercel Functions)

- `POST /api/auth/signup` - create a user account
- `POST /api/auth/login` - login with `name` and `password`
- `GET /api/auth/me` - fetch current authenticated user
- `POST /api/auth/forgot-password` - request reset token
- `POST /api/auth/reset-password` - reset password with `token`, `password`, and `newPassword`

## Vercel Deployment (Backend)

1. Deploy the `backend` folder as a Vercel project.
2. In Vercel Project Settings > Environment Variables, add:
   - `MONGODB_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` (optional, default `1d`)
   - `RESET_TOKEN_EXPIRES_MINUTES` (optional, default `15`)
3. Redeploy and verify:
   - `POST https://<your-backend-domain>/api/auth/signup`
   - `POST https://<your-backend-domain>/api/auth/login`
4. In frontend `.env`, set:
   - `VITE_API_BASE_URL=https://<your-backend-domain>/api`

## Production Readiness Notes

- Vercel-friendly serverless API handlers are isolated per endpoint.
- MongoDB connection is cached to mitigate cold start overhead.
- Passwords are hashed with bcrypt and JWT tokens are used for auth.
- Frontend forms use React Hook Form + Yup with real-time feedback.
- Standardized response format is used across auth endpoints.
