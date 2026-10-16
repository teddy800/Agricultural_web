# AgriConnect - Ethiopian Agricultural Marketplace

A modern, full-stack agricultural marketplace platform connecting Ethiopian farmers with buyers across the country.

## 🌟 Features

### For Farmers
- **Create Listings** - Post produce with photos, prices, and delivery options
- **Manage Inventory** - Track available quantity and update listings in real-time
- **Receive Inquiries** - Get buyer requests and negotiate directly
- **Market Intelligence** - View current market prices across regions
- **Weather Information** - Access weather forecasts for farm planning

### For Buyers
- **Browse Marketplace** - Search and filter agricultural produce by crop, region, and price
- **Direct Communication** - Send inquiries and negotiate with farmers
- **Price Comparison** - Compare prices across different regions
- **Secure Transactions** - Build trust with verified farmer profiles

### Platform Features
- **Real-time Messaging** - Chat between farmers and buyers
- **Market Price Tracking** - Historical price data and trends
- **Multi-language Support** - Interface in English with Amharic crop names
- **Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile
- **Advanced Search** - Filter by crop type, region, price range, quality grade

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Recharts** - Data visualization for market trends
- **Lucide React** - Beautiful icon library
- **CSS3** - Custom styling with CSS variables

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Robust relational database
- **RESTful API** - Clean API architecture

## 📋 Requirements

- **Node.js** 18+ LTS
- **PostgreSQL** 14+
- **npm** 8+ or **yarn** 1.22+

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/teddy800/Agricultural_web.git
cd Agricultural_web
```

### 2. Install Dependencies
```powershell
npm install
npm install --prefix frontend
npm install --prefix backend
```

### 3. Database Setup

#### Create PostgreSQL Database
```bash
# Using psql
createdb agriconnect

# Or using PostgreSQL GUI tools like pgAdmin
```

#### Configure Environment Variables
```powershell
# Backend configuration
cd backend
cp .env.example .env
# Edit .env with your database credentials
```

Example `.env`:
```env
PORT=4000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/agriconnect
NODE_ENV=development
```

#### Initialize Database Schema
```powershell
cd backend
npm run db:init
```

This will:
- Create all necessary tables
- Set up indexes for performance
- Insert sample data for testing
- Create database views and functions

### 4. Frontend Configuration (Optional)
```powershell
cd frontend
cp .env.example .env
# Configure API URL if different from default
```

## 🏃 Running the Application

### Development Mode (Recommended)
Run both frontend and backend simultaneously:
```powershell
# From project root
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **API Health**: http://localhost:4000/api/health

### Run Separately

#### Backend Only
```powershell
npm run dev:backend
# or
cd backend
npm run dev
```

#### Frontend Only
```powershell
npm run dev:frontend
# or
cd frontend
npm run dev
```

## 📡 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Key Endpoints

#### Health Check
```http
GET /api/health
```

#### Listings
```http
GET    /api/listings              # Get all listings (with filters)
GET    /api/listings/:id          # Get single listing
POST   /api/listings              # Create new listing
PUT    /api/listings/:id          # Update listing
DELETE /api/listings/:id          # Delete listing
```

#### Inquiries
```http
GET    /api/inquiries             # Get all inquiries
POST   /api/inquiries             # Create inquiry
PUT    /api/inquiries/:id/status  # Update inquiry status
```

#### Market Prices
```http
GET    /api/market-prices         # Get market price data
POST   /api/market-prices         # Add price record
```

#### Users
```http
POST   /api/users/register        # Register new user
GET    /api/users/:id             # Get user profile
PUT    /api/users/:id             # Update user profile
```

#### Messages
```http
GET    /api/messages              # Get messages
POST   /api/messages              # Send message
PUT    /api/messages/:id/read     # Mark as read
```

Full API documentation: `backend/API_ENDPOINTS.md`

## 🧪 Sample Data

The database initialization includes sample data:

### Sample Users
- **Farmers**: Tewodros Fikadu, Selam Tesfaye, Mohammed Ali
- **Buyers**: Kebede Tadesse
- **Traders**: Abebe Girma

### Sample Listings
- Teff (ጤፍ) - 50 quintals @ ETB 3,800
- Coffee (ቡና) - 20 quintals @ ETB 12,500
- Maize (በቆሎ) - 100 quintals @ ETB 1,850
- Wheat (ስንዴ) - 30 quintals @ ETB 2,200
- And more...

## 📁 Project Structure

```
AgriConnect/
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── main.jsx          # React entry point
│   │   ├── api.js            # API service layer
│   │   └── styles.css        # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── server.js         # Express server & routes
│   │   ├── database/
│   │   │   ├── schema.sql    # Database schema
│   │   │   └── init.js       # DB initialization script
│   │   ├── middleware/
│   │   │   ├── validation.js # Request validation
│   │   │   └── rateLimit.js  # Rate limiting
│   │   └── utils/
│   │       └── logger.js     # Logging utility
│   ├── .env.example
│   └── package.json
├── package.json              # Root package.json
└── README.md
```

## 🔐 Security Features

- **Input Validation** - All user inputs are validated
- **SQL Injection Protection** - Parameterized queries
- **Rate Limiting** - API request throttling
- **CORS Configuration** - Restricted cross-origin access
- **Environment Variables** - Sensitive data protection

## 🌍 Supported Regions

- Oromia
- Sidama
- Dire Dawa
- Addis Ababa
- Amhara
- Harari
- South Ethiopia

## 📊 Database Schema

### Main Tables
- `users` - User accounts (farmers, buyers, traders)
- `listings` - Product listings
- `inquiries` - Buyer inquiries and offers
- `messages` - Direct messaging between users
- `market_prices` - Historical market price data
- `favorites` - User saved listings
- `reviews` - User ratings and feedback
- `notifications` - System notifications

## 🛠️ Available Scripts

### Root Directory
```powershell
npm run dev          # Run both frontend & backend
npm run dev:frontend # Run frontend only
npm run dev:backend  # Run backend only
```

### Backend
```powershell
npm run dev          # Development with auto-reload
npm start            # Production mode
npm run db:init      # Initialize/reset database
```

### Frontend
```powershell
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

## 🚢 Deployment

### Backend Deployment (Node.js)
1. Set environment variables on your host
2. Run database migrations
3. Start with `npm start`

### Frontend Deployment (Static)
1. Build: `npm run build`
2. Deploy `dist` folder to:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - GitHub Pages

### Database (PostgreSQL)
- AWS RDS
- Heroku Postgres
- DigitalOcean Managed Database
- Azure Database for PostgreSQL

## 🐛 Troubleshooting

### Database Connection Issues
```powershell
# Check PostgreSQL is running
psql -U postgres -l

# Test connection
psql postgresql://user:pass@localhost:5432/agriconnect
```

### Port Already in Use
```powershell
# Change ports in .env files
# Backend: PORT=4001
# Frontend: Update vite.config.js server.port
```

### Module Not Found
```powershell
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm install --prefix frontend
npm install --prefix backend
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is for educational and development purposes.

## 👥 Team

- **Developer**: Tewodros Fikadu
- **Project**: AgriConnect Ethiopia

## 📞 Support

For issues and questions:
- GitHub Issues: Create an issue in the repository
- Email: support@agriconnect.et (example)

## 🔮 Future Enhancements

- [ ] JWT Authentication & Authorization
- [ ] File upload for product images
- [ ] Real-time notifications (WebSocket)
- [ ] Payment integration
- [ ] SMS notifications
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Export data to Excel/PDF
- [ ] Multi-language support (Full Amharic UI)
- [ ] Weather API integration
- [ ] Geolocation for nearby listings

---

**Built with ❤️ for Ethiopian farmers and agricultural traders**
