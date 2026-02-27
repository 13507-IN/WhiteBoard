# Todo App with Google Auth

Simple full-stack todo app:
- Frontend: Next.js
- Backend: Node.js + Express
- Auth: Google OAuth (Passport.js)
- Database: MongoDB (Mongoose)

## Project Structure

`frontend/` Next.js UI  
`backend/` Express API and auth

## 1. Google OAuth Setup

1. Go to Google Cloud Console and create OAuth 2.0 credentials.
2. Add authorized redirect URI:
   - `http://localhost:5000/auth/google/callback`
3. Copy client ID and client secret.

## 2. Configure Environment Variables

Backend:
1. Copy `backend/.env.example` to `backend/.env`
2. Fill in:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `SESSION_SECRET`
   - `MONGODB_URI`

Frontend:
1. Copy `frontend/.env.example` to `frontend/.env.local`
2. Adjust `NEXT_PUBLIC_API_URL` if needed.

## 3. Install Dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

## 4. Run the App

Start backend:
```bash
cd backend
npm run dev
```

Start frontend in a second terminal:
```bash
cd frontend
npm run dev
```

Open:
- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:5000/health`

## API Overview

- `GET /auth/google` start Google login
- `GET /auth/google/callback` Google callback
- `POST /auth/logout` logout
- `GET /api/me` current session user
- `GET /api/todos` list todos (auth required)
- `POST /api/todos` create todo
- `PATCH /api/todos/:id` update text/completed
- `DELETE /api/todos/:id` delete todo
