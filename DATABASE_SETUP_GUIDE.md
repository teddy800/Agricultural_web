# 🗄️ PostgreSQL Database Setup Guide

Complete guide to set up the AgriConnect database step by step.

---

## 🚀 Quick Setup (Recommended)

### **Method 1: Automated Script (Easiest)**

1. **Open PowerShell as Administrator**
   - Press `Windows Key`
   - Type "PowerShell"
   - Right-click "Windows PowerShell"
   - Select "Run as Administrator"

2. **Navigate to Project Directory**
   ```powershell
   cd C:\Users\HP\Downloads\AgriConnect-Starter
   ```

3. **Run Setup Script**
   ```powershell
   .\setup-database.ps1
   ```

4. **Follow Prompts**
   - Enter PostgreSQL username (default: postgres)
   - Enter PostgreSQL password
   - Script will:
     - ✅ Create database
     - ✅ Run schema
     - ✅ Insert sample data
     - ✅ Update .env file
     - ✅ Verify setup

5. **Done!** Database is ready 🎉

---

## 📋 Manual Setup (Step-by-Step)

### **Step 1: Find PostgreSQL Credentials**

You have PostgreSQL installed. Common credentials:

**Default Credentials:**
- Username: `postgres`
- Password: (the one you set during installation)
- Port: `5432`

**For Odoo PostgreSQL:**
- Username: `odoo` or `postgres`
- Password: Check Odoo configuration
- Port: `5432`

---

### **Step 2: Create Database**

**Option A: Using Command Line**

```powershell
# Set password (replace with your password)
$env:PGPASSWORD="your_password"

# Create database
psql -U postgres -c "CREATE DATABASE agriconnect;"

# Verify
psql -U postgres -l
```

**Option B: Using pgAdmin**

1. Open pgAdmin (search in Start menu)
2. Connect to PostgreSQL server
3. Right-click "Databases"
4. Select "Create" → "Database"
5. Name: `agriconnect`
6. Click "Save"

---

### **Step 3: Initialize Schema**

```powershell
# Navigate to project
cd C:\Users\HP\Downloads\AgriConnect-Starter

# Set password
$env:PGPASSWORD="your_password"

# Run schema file
psql -U postgres -d agriconnect -f backend\src\database\schema.sql
```

**Expected Output:**
```
CREATE EXTENSION
CREATE TABLE
CREATE TABLE
...
INSERT 0 6
INSERT 0 6
INSERT 0 4
...
✓ Schema initialized
✓ Sample data inserted
```

---

### **Step 4: Update Backend Configuration**

1. **Open file:** `backend\.env`

2. **Update DATABASE_URL:**
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/agriconnect
   ```

3. **Replace:**
   - `postgres` - with your username
   - `YOUR_PASSWORD` - with your actual password
   - `localhost` - if database is on same machine
   - `5432` - default PostgreSQL port
   - `agriconnect` - database name

4. **Save file**

---

### **Step 5: Verify Setup**

```powershell
# Check tables exist
psql -U postgres -d agriconnect -c "\dt"

# Check sample data
psql -U postgres -d agriconnect -c "SELECT COUNT(*) FROM users;"
psql -U postgres -d agriconnect -c "SELECT COUNT(*) FROM listings;"
psql -U postgres -d agriconnect -c "SELECT COUNT(*) FROM inquiries;"
```

**Expected Results:**
- Users: 6
- Listings: 6
- Inquiries: 4

---

## 🧪 Test Database Connection

### **Test 1: Direct Database Query**

```powershell
psql -U postgres -d agriconnect -c "SELECT * FROM users LIMIT 3;"
```

Should show 3 users from database.

### **Test 2: Backend API**

1. **Start Backend:**
   ```powershell
   cd backend
   npm run dev
   ```

2. **Test Health Endpoint:**
   ```powershell
   curl http://localhost:4000/api/health
   ```

3. **Expected Response:**
   ```json
   {
     "success": true,
     "database": "connected",  // ✓ Should be "connected"
     "version": "2.0.0"
   }
   ```

### **Test 3: API Endpoints**

```powershell
# Get all listings
curl http://localhost:4000/api/listings

# Get statistics
curl http://localhost:4000/api/stats

# Get inquiries
curl http://localhost:4000/api/inquiries
```

---

## 🔍 Troubleshooting

### **Issue 1: "role postgres does not exist"**

**Solution A: Find correct username**
```powershell
# List all PostgreSQL users
psql -U odoo -d postgres -c "\du"

# Try with 'odoo' user
psql -U odoo -c "CREATE DATABASE agriconnect;"
```

**Solution B: Create postgres user**
```powershell
psql -U odoo -d postgres -c "CREATE ROLE postgres WITH LOGIN PASSWORD 'your_password';"
psql -U odoo -d postgres -c "ALTER ROLE postgres CREATEDB;"
```

---

### **Issue 2: "password authentication failed"**

**Solution A: Reset password**
```powershell
# Using existing user
psql -U odoo -d postgres -c "ALTER USER postgres PASSWORD 'new_password';"
```

**Solution B: Find pg_hba.conf**
```powershell
# Find PostgreSQL data directory
psql -U odoo -d postgres -c "SHOW data_directory;"

# Edit pg_hba.conf
# Change "md5" to "trust" temporarily
# Restart PostgreSQL service
```

---

### **Issue 3: "permission denied"**

**Solution: Grant permissions**
```powershell
psql -U postgres -d agriconnect -c "GRANT ALL PRIVILEGES ON DATABASE agriconnect TO postgres;"
psql -U postgres -d agriconnect -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;"
psql -U postgres -d agriconnect -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;"
```

---

### **Issue 4: Backend shows "database: disconnected"**

**Checklist:**
1. ✅ PostgreSQL service is running
2. ✅ Database 'agriconnect' exists
3. ✅ Schema is initialized
4. ✅ .env file has correct DATABASE_URL
5. ✅ Backend server restarted after .env update

**Fix:**
```powershell
# 1. Check service
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# 2. Check database
psql -U postgres -l | Select-String "agriconnect"

# 3. Restart backend
# Stop current server (Ctrl+C)
cd backend
npm run dev
```

---

### **Issue 5: "schema does not exist"**

**Solution: Run schema again**
```powershell
cd C:\Users\HP\Downloads\AgriConnect-Starter
psql -U postgres -d agriconnect -f backend\src\database\schema.sql
```

---

## 🎯 Common PostgreSQL Commands

```powershell
# List all databases
psql -U postgres -l

# Connect to agriconnect database
psql -U postgres -d agriconnect

# Once connected, useful commands:
\dt              # List all tables
\d users         # Describe users table
\du              # List all users
\q               # Quit

# Query examples
SELECT * FROM users;
SELECT * FROM listings WHERE status = 'active';
SELECT * FROM inquiries WHERE status = 'pending';
```

---

## 📊 Sample Data Included

### **Users (6 total)**
- Tewodros Fikadu (Farmer - Oromia)
- Selam Tesfaye (Farmer - Sidama)
- Mohammed Ali (Farmer - Dire Dawa)
- Kebede Tadesse (Buyer - Addis Ababa)
- Hana Bekele (Farmer - Oromia)
- Abebe Girma (Trader - Amhara)

### **Listings (6 total)**
- Teff - 50 quintals @ ETB 3,800
- Coffee - 20 quintals @ ETB 12,500
- Maize - 100 quintals @ ETB 1,850
- Wheat - 30 quintals @ ETB 2,200
- Tomatoes - 18 quintals @ ETB 1,450
- Haricot Beans - 40 quintals @ ETB 4,200

### **Inquiries (4 total)**
- Teff inquiry - Pending
- Coffee inquiry - Accepted
- Maize inquiry - Pending
- Wheat inquiry - Rejected

### **Market Prices**
- Historical price data for Teff across 4 markets
- Data points for trend visualization

---

## 🔐 Security Best Practices

### **For Development:**
```env
DATABASE_URL=postgresql://postgres:your_dev_password@localhost:5432/agriconnect
```

### **For Production:**
1. **Use environment variables** (not .env file)
2. **Use strong passwords**
3. **Restrict database access** (not localhost)
4. **Enable SSL** for database connections
5. **Regular backups**

```env
DATABASE_URL=postgresql://agri_prod:STRONG_PASSWORD@db.example.com:5432/agriconnect?sslmode=require
```

---

## 🚀 Next Steps After Setup

1. **Restart Backend**
   ```powershell
   # Stop current server (Ctrl+C)
   cd backend
   npm run dev
   ```

2. **Verify Connection**
   ```powershell
   curl http://localhost:4000/api/health
   # Should show: "database": "connected"
   ```

3. **Start Frontend**
   ```powershell
   cd frontend
   npm run dev
   ```

4. **Open Browser**
   - Navigate to: http://localhost:5173
   - Sidebar should show: "Connected to API" ✅

5. **Test Features**
   - Dashboard should show real data
   - Create listing should save to database
   - Inquiries should persist

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Create database | `psql -U postgres -c "CREATE DATABASE agriconnect;"` |
| Run schema | `psql -U postgres -d agriconnect -f backend/src/database/schema.sql` |
| List databases | `psql -U postgres -l` |
| Connect to DB | `psql -U postgres -d agriconnect` |
| Test API | `curl http://localhost:4000/api/health` |
| Start backend | `cd backend && npm run dev` |
| Start frontend | `cd frontend && npm run dev` |
| Start both | `npm run dev` |

---

## ✅ Success Indicators

**Database Setup Complete:**
- ✅ Database 'agriconnect' exists
- ✅ 10+ tables created
- ✅ Sample data inserted (6 users, 6 listings, 4 inquiries)
- ✅ Indexes created
- ✅ Views created

**Backend Connected:**
- ✅ Server starts without errors
- ✅ Health endpoint shows "database": "connected"
- ✅ API endpoints return real data

**Frontend Integrated:**
- ✅ Sidebar shows "Connected to API"
- ✅ Green status dot in sidebar
- ✅ Dashboard shows real numbers
- ✅ Marketplace shows database listings
- ✅ Create listing saves successfully
- ✅ Inquiry updates persist

---

**Your database is ready! 🎉 Proceed to test the full application.**
