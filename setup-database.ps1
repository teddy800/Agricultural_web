# AgriConnect PostgreSQL Database Setup Script
# Run this script as Administrator in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AgriConnect Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check PostgreSQL Installation
Write-Host "Step 1: Checking PostgreSQL Installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✓ PostgreSQL is installed: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ PostgreSQL is not installed!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Database Configuration" -ForegroundColor Yellow
Write-Host "We need to create the 'agriconnect' database." -ForegroundColor White
Write-Host ""

# Prompt for PostgreSQL credentials
Write-Host "Please enter your PostgreSQL credentials:" -ForegroundColor Cyan
$pgUser = Read-Host "PostgreSQL Username (press Enter for 'postgres')"
if ([string]::IsNullOrWhiteSpace($pgUser)) {
    $pgUser = "postgres"
}

$pgPassword = Read-Host "PostgreSQL Password" -AsSecureString
$pgPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword))

Write-Host ""
Write-Host "Step 3: Testing Database Connection..." -ForegroundColor Yellow

# Set environment variable for password
$env:PGPASSWORD = $pgPasswordPlain

# Test connection
try {
    $testResult = psql -U $pgUser -d postgres -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Successfully connected to PostgreSQL!" -ForegroundColor Green
    } else {
        Write-Host "✗ Connection failed. Please check your credentials." -ForegroundColor Red
        Write-Host $testResult -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Connection error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 4: Checking if 'agriconnect' database exists..." -ForegroundColor Yellow

# Check if database exists
$dbExists = psql -U $pgUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='agriconnect';"

if ($dbExists -eq "1") {
    Write-Host "Database 'agriconnect' already exists." -ForegroundColor Yellow
    $recreate = Read-Host "Do you want to recreate it? (yes/no)"
    if ($recreate -eq "yes") {
        Write-Host "Dropping existing database..." -ForegroundColor Yellow
        psql -U $pgUser -d postgres -c "DROP DATABASE IF EXISTS agriconnect;"
        Write-Host "✓ Database dropped" -ForegroundColor Green
        
        Write-Host "Creating new database..." -ForegroundColor Yellow
        psql -U $pgUser -d postgres -c "CREATE DATABASE agriconnect;"
        Write-Host "✓ Database created" -ForegroundColor Green
    }
} else {
    Write-Host "Creating 'agriconnect' database..." -ForegroundColor Yellow
    psql -U $pgUser -d postgres -c "CREATE DATABASE agriconnect;"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database 'agriconnect' created successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create database" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Step 5: Initializing Database Schema..." -ForegroundColor Yellow
Write-Host "Running schema.sql..." -ForegroundColor Cyan

# Run schema initialization
$schemaPath = Join-Path $PSScriptRoot "backend\src\database\schema.sql"
if (Test-Path $schemaPath) {
    psql -U $pgUser -d agriconnect -f $schemaPath
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database schema initialized successfully!" -ForegroundColor Green
        Write-Host "  - Created all tables" -ForegroundColor Gray
        Write-Host "  - Created indexes" -ForegroundColor Gray
        Write-Host "  - Inserted sample data" -ForegroundColor Gray
    } else {
        Write-Host "✗ Schema initialization failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✗ Schema file not found: $schemaPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 6: Verifying Database Setup..." -ForegroundColor Yellow

# Count tables
$tableCount = psql -U $pgUser -d agriconnect -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"
Write-Host "✓ Tables created: $tableCount" -ForegroundColor Green

# Count sample users
$userCount = psql -U $pgUser -d agriconnect -tAc "SELECT COUNT(*) FROM users;"
Write-Host "✓ Sample users: $userCount" -ForegroundColor Green

# Count sample listings
$listingCount = psql -U $pgUser -d agriconnect -tAc "SELECT COUNT(*) FROM listings;"
Write-Host "✓ Sample listings: $listingCount" -ForegroundColor Green

# Count sample inquiries
$inquiryCount = psql -U $pgUser -d agriconnect -tAc "SELECT COUNT(*) FROM inquiries;"
Write-Host "✓ Sample inquiries: $inquiryCount" -ForegroundColor Green

Write-Host ""
Write-Host "Step 7: Updating Backend Configuration..." -ForegroundColor Yellow

# Update .env file
$envPath = Join-Path $PSScriptRoot "backend\.env"
$databaseUrl = "postgresql://${pgUser}:${pgPasswordPlain}@localhost:5432/agriconnect"

if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    $newEnvContent = $envContent -replace "DATABASE_URL=.*", "DATABASE_URL=$databaseUrl"
    Set-Content -Path $envPath -Value $newEnvContent
    Write-Host "✓ Updated backend/.env file" -ForegroundColor Green
} else {
    Write-Host "Creating backend/.env file..." -ForegroundColor Yellow
    Copy-Item (Join-Path $PSScriptRoot "backend\.env.example") $envPath
    $envContent = Get-Content $envPath
    $newEnvContent = $envContent -replace "DATABASE_URL=.*", "DATABASE_URL=$databaseUrl"
    Set-Content -Path $envPath -Value $newEnvContent
    Write-Host "✓ Created backend/.env file" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Setup Complete! ✓" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Database Details:" -ForegroundColor Yellow
Write-Host "  Database Name: agriconnect" -ForegroundColor White
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: 5432" -ForegroundColor White
Write-Host "  Username: $pgUser" -ForegroundColor White
Write-Host ""

Write-Host "Sample Data Loaded:" -ForegroundColor Yellow
Write-Host "  ✓ $userCount farmers, buyers, and traders" -ForegroundColor Green
Write-Host "  ✓ $listingCount product listings (Teff, Coffee, Maize, etc.)" -ForegroundColor Green
Write-Host "  ✓ $inquiryCount buyer inquiries" -ForegroundColor Green
Write-Host "  ✓ Market price data" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Start the backend server:" -ForegroundColor White
Write-Host "     cd backend" -ForegroundColor Cyan
Write-Host "     npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Start the frontend server:" -ForegroundColor White
Write-Host "     cd frontend" -ForegroundColor Cyan
Write-Host "     npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Or start both together:" -ForegroundColor White
Write-Host "     npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  4. Open your browser to:" -ForegroundColor White
Write-Host "     http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

Write-Host "Test API Connection:" -ForegroundColor Yellow
Write-Host "  curl http://localhost:4000/api/health" -ForegroundColor Cyan
Write-Host "  (Should show: database: 'connected')" -ForegroundColor Gray
Write-Host ""

Write-Host "Your AgriConnect platform is now fully integrated! 🚀" -ForegroundColor Green
Write-Host ""

# Clear password from environment
$env:PGPASSWORD = ""
