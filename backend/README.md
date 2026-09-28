# EduNexus Backend

This is the Express + Node.js + TypeScript backend for EduNexus.

## Prerequisites
- Node.js (v18+)
- npm
- Supabase account and project

## Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
AI_API_KEY=your_ai_api_key
JWT_SECRET=your_jwt_secret
```

## Database Setup
1. Open your Supabase project dashboard.
2. Go to the SQL Editor.
3. Copy the contents of `backend/supabase/schema.sql`.
4. Run the query to create all tables and relationships.

## How to Start Backend
- **Development Mode (Auto-restart):**
  ```bash
  npm run dev
  ```
- **Production Build:**
  ```bash
  npm run build
  npm start
  ```

## API Endpoints Implemented
- `POST /api/auth/login` - Authenticate and get JWT

## Frontend Integration
Update the frontend `VITE_API_BASE_URL` to point to `http://localhost:5000/api`.
Note: The frontend `src` folder is currently missing from the repository, so integration steps will be finalized once the frontend code is available.

## Remaining TODOs
- Implement full CRUD routes for students, teachers, parents, and classes.
- Implement attendance submission and correction workflow endpoints.
- Integrate AI abstraction using the `AI_API_KEY`.
- Write automated tests for all API endpoints.
