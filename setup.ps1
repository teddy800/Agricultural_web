# AgriConnect Setup Script for Windows
# Run this script to set up the complete development environment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AgriConnect Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL installation
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✓ PostgreSQL is installed: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "! PostgreSQL not found in PATH" -ForegroundColor Yellow
    Write-Host "Make sure PostgreSQL is installed and accessible" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

# Install root dependencies
Write-Host "→ Installing root dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Root dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "→ Installing backend dependencies..." -ForegroundColor Cyan
npm install --prefix backend
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Write-Host "→ Installing frontend dependencies..." -ForegroundColor Cyan
npm install --prefix frontend
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setting up environment files..." -ForegroundColor Yellow

# Setup backend .env
if (!(Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✓ Created backend/.env from example" -ForegroundColor Green
    Write-Host "! Please update DATABASE_URL in backend/.env" -ForegroundColor Yellow
} else {
    Write-Host "→ backend/.env already exists" -ForegroundColor Cyan
}

# Setup frontend .env
if (!(Test-Path "frontend\.env")) {
    Copy-Item "frontend\.env.example" "frontend\.env"
    Write-Host "✓ Created frontend/.env from example" -ForegroundColor Green
} else {
    Write-Host "→ frontend/.env already exists" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure your database:" -ForegroundColor White
Write-Host "   → Create PostgreSQL database: createdb agriconnect" -ForegroundColor Cyan
Write-Host "   → Update backend/.env with your DATABASE_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Initialize the database:" -ForegroundColor White
Write-Host "   → cd backend" -ForegroundColor Cyan
Write-Host "   → npm run db:init" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Start the development servers:" -ForegroundColor White
Write-Host "   → npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your application will be available at:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:4000" -ForegroundColor Green
Write-Host "   API Docs: backend/API_ENDPOINTS.md" -ForegroundColor Green
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Cyan
