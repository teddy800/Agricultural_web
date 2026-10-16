# AgriConnect API Endpoints

Base URL: `http://localhost:4000/api`

## Authentication & Health

### Check API Health
```http
GET /api/health
```
**Response:**
```json
{
  "success": true,
  "message": "AgriConnect API is running",
  "timestamp": "2026-04-26T10:30:00.000Z",
  "database": "connected",
  "version": "2.0.0"
}
```

### Get Statistics
```http
GET /api/stats
```
**Response:**
```json
{
  "success": true,
  "data": {
    "activeListings": 6,
    "pendingInquiries": 2,
    "activeUsers": 6,
    "totalSales": 0
  }
}
```

## Users

### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Farmer",
  "email": "john@example.com",
  "phone": "+251911234567",
  "region": "Oromia",
  "accountType": "farmer",
  "password": "securepassword"
}
```

### Get User
```http
GET /api/users/:id
```

### Update User
```http
PUT /api/users/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+251922345678",
  "region": "Addis Ababa"
}
```

## Listings

### Get All Listings
```http
GET /api/listings?crop=teff&region=oromia&status=active&limit=50&offset=0
```
**Query Parameters:**
- `crop` (optional): Filter by crop name
- `region` (optional): Filter by region
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `status` (optional): active, draft, sold, expired, deleted (default: active)
- `limit` (optional): Results per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)

### Get Single Listing
```http
GET /api/listings/:id
```

### Create Listing
```http
POST /api/listings
Content-Type: application/json

{
  "sellerId": 1,
  "cropName": "Teff",
  "cropNameAm": "ጤፍ",
  "quantity": 50,
  "unit": "quintal",
  "pricePerUnit": 3800,
  "region": "Haramaya, Oromia",
  "title": "Premium Teff - Fresh Harvest",
  "description": "High quality teff from Haramaya",
  "imageUrl": "https://example.com/image.jpg",
  "harvestDate": "2026-04-15",
  "qualityGrade": "premium",
  "deliveryOptions": "[\"pickup\", \"delivery\"]"
}
```

### Update Listing
```http
PUT /api/listings/:id
Content-Type: application/json

{
  "quantity": 45,
  "pricePerUnit": 3900,
  "status": "active"
}
```

### Delete Listing
```http
DELETE /api/listings/:id
```

## Inquiries

### Get All Inquiries
```http
GET /api/inquiries?sellerId=1&buyerId=4&status=pending&limit=50&offset=0
```
**Query Parameters:**
- `sellerId` (optional): Filter by seller
- `buyerId` (optional): Filter by buyer
- `status` (optional): pending, accepted, rejected, completed, cancelled
- `limit` (optional): Results per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)

### Get Single Inquiry
```http
GET /api/inquiries/:id
```

### Create Inquiry
```http
POST /api/inquiries
Content-Type: application/json

{
  "listingId": 1,
  "buyerId": 4,
  "quantity": 10,
  "offeredPrice": 3600,
  "message": "Interested in purchasing. Can you deliver?"
}
```

### Update Inquiry Status
```http
PUT /api/inquiries/:id/status
Content-Type: application/json

{
  "status": "accepted",
  "responseMessage": "Yes, we can deliver to your location"
}
```
**Valid status values:** pending, accepted, rejected, completed, cancelled

## Market Prices

### Get Market Prices
```http
GET /api/market-prices?crop=teff&region=haramaya&startDate=2026-04-20&endDate=2026-04-26&limit=100
```
**Query Parameters:**
- `crop` (optional): Filter by crop name
- `region` (optional): Filter by market location
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `limit` (optional): Results limit (default: 100)

### Add Market Price
```http
POST /api/market-prices
Content-Type: application/json

{
  "cropName": "Teff",
  "marketLocation": "Haramaya",
  "price": 3900,
  "unit": "quintal",
  "priceDate": "2026-04-26",
  "source": "manual"
}
```

## Messages

### Get Messages
```http
GET /api/messages?userId=1&inquiryId=5&limit=50
```
**Query Parameters:**
- `userId` (optional): Get messages for user (sent or received)
- `inquiryId` (optional): Get messages for specific inquiry
- `limit` (optional): Results limit (default: 50)

### Send Message
```http
POST /api/messages
Content-Type: application/json

{
  "senderId": 1,
  "receiverId": 4,
  "inquiryId": 5,
  "message": "The produce is ready for pickup this week"
}
```

### Mark Message as Read
```http
PUT /api/messages/:id/read
```

## Weather

### Get Weather
```http
GET /api/weather?location=Haramaya
```
**Query Parameters:**
- `location` (optional): Location name (default: Haramaya)

**Response:**
```json
{
  "success": true,
  "data": {
    "location": "Haramaya",
    "temperature": 24,
    "condition": "Partly cloudy",
    "humidity": 63,
    "windSpeed": 9,
    "rainChance": 12,
    "forecast": [
      { "day": "Today", "high": 26, "low": 18, "condition": "Sunny" },
      { "day": "Tomorrow", "high": 25, "low": 17, "condition": "Partly cloudy" }
    ],
    "timestamp": "2026-04-26T10:30:00.000Z"
  }
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## Database Setup

1. Create PostgreSQL database:
```bash
createdb agriconnect
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update DATABASE_URL in .env:
```
DATABASE_URL=postgresql://username:password@localhost:5432/agriconnect
```

4. Initialize database:
```bash
npm run db:init
```

5. Start server:
```bash
npm run dev
```

## Testing with cURL

### Test Health Endpoint
```bash
curl http://localhost:4000/api/health
```

### Create a Listing
```bash
curl -X POST http://localhost:4000/api/listings \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": 1,
    "cropName": "Maize",
    "quantity": 100,
    "unit": "quintal",
    "pricePerUnit": 1850,
    "region": "Harar",
    "title": "Fresh Maize for Sale"
  }'
```

### Get All Listings
```bash
curl "http://localhost:4000/api/listings?status=active&limit=10"
```

### Create an Inquiry
```bash
curl -X POST http://localhost:4000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": 1,
    "buyerId": 4,
    "quantity": 10,
    "message": "Interested in this listing"
  }'
```
