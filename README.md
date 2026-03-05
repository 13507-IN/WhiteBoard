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

## Whiteboard Feature

The app now includes a collaborative whiteboard where authenticated users can:

### Whiteboard Capabilities
- **Draw & Sketch** - Use the canvas with customizable brush colors and sizes
- **Add Text** - Toggle text mode to add text annotations to your whiteboard
- **Manage Whiteboards** - Create, save, and organize multiple whiteboards
- **Undo & Clear** - Undo the last action or clear the entire whiteboard

### Accessing Whiteboards

1. **Sign in** with your Google account
2. Click **"✏️ Open Whiteboard"** to create and edit a new whiteboard
3. Click **"📋 My Whiteboards"** to see all your saved whiteboards

### Whiteboard Tools

- **Color Picker** - Select any color for your brush
- **Brush Size** - Adjust brush size from 1-20 pixels
- **Text Mode** - Toggle between drawing and text input modes
- **Undo** - Undo the last stroke
- **Clear** - Clear the entire whiteboard
- **Save** - Save your whiteboard with a custom title

### Whiteboard API Endpoints

- `GET /api/whiteboards` - List all whiteboards (auth required)
- `POST /api/whiteboards` - Create a new whiteboard
- `GET /api/whiteboards/:id` - Get a specific whiteboard
- `PATCH /api/whiteboards/:id` - Update whiteboard (title, drawing data)
- `DELETE /api/whiteboards/:id` - Delete a whiteboard

### Data Model

Whiteboards are stored in MongoDB with the following structure:
```javascript
{
  user: ObjectId,           // Reference to User
  title: String,            // Whiteboard title
  drawingData: Array,       // Array of drawing elements
  createdAt: Date,          // Creation timestamp
  updatedAt: Date           // Last modification timestamp
}
```
