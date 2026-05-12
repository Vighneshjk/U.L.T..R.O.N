# U.L.T.R.O.N Deployment Guide

## 1. Backend (Railway)
- Root Directory: `backend` (or use the provided `Procfile` in the project root)
- Environment Variables:
  - `GROQ_API_KEY`: Your Groq API key.
  - `GROQ_MODEL`: `llama-3.3-70b-versatile` (optional).
  - `PORT`: Usually handled by Railway.

## 2. Frontend (Vercel)
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- **CRITICAL Environment Variable**:
  - `VITE_API_URL`: Set this to your Railway backend URL (e.g., `https://your-backend.up.railway.app`).
  - **IMPORTANT**: Do NOT include a trailing slash in the URL.
## 3. Backend (Render)
- **Service Type**: Web Service
- **Runtime**: Python 3
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- **Root Directory**: `.` (Keep as root)
- **Environment Variables**:
  - `GROQ_API_KEY`: Your Groq API key.
  - `PYTHONPATH`: `.`

## Common Issues
- **White Screen**: Check the browser console (F12). If you see "VITE_API_URL is undefined", ensure the environment variable is set in the Vercel dashboard and a redeploy is triggered.
- **Connection Lost**: Ensure the backend is running and the URL in `VITE_API_URL` is correct.
- **Python Imports**: If you see `ModuleNotFoundError: No module named 'backend'`, ensure the `PYTHONPATH` is set to `.` on Render/Railway.
- **Audio Not Working**: Browser security requires a user interaction (like clicking "Send") before audio can play. This is handled by the UI.
