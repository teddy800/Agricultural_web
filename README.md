# AgriConnect starter

A clean React + Vite frontend and Express API starter for the AgriConnect Ethiopia project.

## Requirements
- Node.js LTS
- PostgreSQL (optional for the first UI preview)

## Install
Open PowerShell in this folder:

```powershell
npm install
npm install --prefix frontend
npm install --prefix backend
```

## Run frontend + backend
```powershell
npm run dev
```

Frontend: http://localhost:5173  
API health: http://localhost:4000/api/health

The first milestone uses realistic demonstration data in the UI. It does not yet save listings or inquiries to PostgreSQL. Do not treat the sample market prices as verified live market prices.
