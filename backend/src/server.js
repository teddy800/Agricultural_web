import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

// Database connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({ 
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"],
  credentials: true 
}));
app.use(express.json({ limit: "5mb" }));

// Error handler middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ==================== HEALTH & INFO ENDPOINTS ====================

app.get("/api/health", asyncHandler(async (_req, res) => {
  let dbStatus = "disconnected";
  try {
    await pool.query("SELECT 1");
    dbStatus = "connected";
  } catch (err) {
    console.error("Database connection check failed:", err.message);
  }
  
  res.json({
    success: true,
    message: "AgriConnect API is running",
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: "2.0.0"
  });
}));

app.get("/api/stats", asyncHandler(async (_req, res) => {
  const listingsCount = await pool.query("SELECT COUNT(*) as count FROM listings WHERE status = 'active'");
  const inquiriesCount = await pool.query("SELECT COUNT(*) as count FROM inquiries WHERE status = 'pending'");
  const usersCount = await pool.query("SELECT COUNT(*) as count FROM users WHERE active = true");
  
  res.json({
    success: true,
    data: {
      activeListings: parseInt(listingsCount.rows[0].count),
      pendingInquiries: parseInt(inquiriesCount.rows[0].count),
      activeUsers: parseInt(usersCount.rows[0].count),
      totalSales: 0 // Placeholder for future implementation
    }
  });
}));

// ==================== USER ENDPOINTS ====================

app.post("/api/users/register", asyncHandler(async (req, res) => {
  const { name, email, phone, region, accountType, password } = req.body;
  
  if (!name || !email || !phone || !accountType) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields: name, email, phone, accountType" 
    });
  }

  // Check if user already exists
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1 OR phone = $2",
    [email, phone]
  );

  if (existingUser.rows.length > 0) {
    return res.status(409).json({ 
      success: false, 
      message: "User with this email or phone already exists" 
    });
  }

  const result = await pool.query(
    `INSERT INTO users (name, email, phone, region, account_type, password_hash, active, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW()) 
     RETURNING id, name, email, phone, region, account_type, created_at`,
    [name, email, phone, region, accountType, password || "changeme"]
  );

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result.rows[0]
  });
}));

app.get("/api/users/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await pool.query(
    `SELECT id, name, email, phone, region, account_type, active, created_at, updated_at 
     FROM users WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: "User not found" 
    });
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}));

app.put("/api/users/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, phone, region } = req.body;
  
  const result = await pool.query(
    `UPDATE users 
     SET name = COALESCE($1, name), 
         phone = COALESCE($2, phone), 
         region = COALESCE($3, region),
         updated_at = NOW()
     WHERE id = $4 
     RETURNING id, name, email, phone, region, account_type, updated_at`,
    [name, phone, region, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: "User not found" 
    });
  }

  res.json({
    success: true,
    message: "User updated successfully",
    data: result.rows[0]
  });
}));

// ==================== LISTINGS ENDPOINTS ====================

app.get("/api/listings", asyncHandler(async (req, res) => {
  const { crop, region, minPrice, maxPrice, status = 'active', limit = 50, offset = 0 } = req.query;
  
  let query = `
    SELECT l.*, u.name as seller_name, u.phone as seller_phone, u.region as seller_region
    FROM listings l
    JOIN users u ON l.seller_id = u.id
    WHERE l.status = $1
  `;
  const params = [status];
  let paramCount = 1;

  if (crop) {
    paramCount++;
    query += ` AND LOWER(l.crop_name) LIKE LOWER($${paramCount})`;
    params.push(`%${crop}%`);
  }

  if (region) {
    paramCount++;
    query += ` AND LOWER(l.region) LIKE LOWER($${paramCount})`;
    params.push(`%${region}%`);
  }

  if (minPrice) {
    paramCount++;
    query += ` AND l.price_per_unit >= $${paramCount}`;
    params.push(minPrice);
  }

  if (maxPrice) {
    paramCount++;
    query += ` AND l.price_per_unit <= $${paramCount}`;
    params.push(maxPrice);
  }

  query += ` ORDER BY l.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  res.json({
    success: true,
    data: result.rows,
    count: result.rows.length,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset)
    }
  });
}));

app.get("/api/listings/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await pool.query(
    `SELECT l.*, u.name as seller_name, u.email as seller_email, 
            u.phone as seller_phone, u.region as seller_region
     FROM listings l
     JOIN users u ON l.seller_id = u.id
     WHERE l.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: "Listing not found" 
    });
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}));

app.post("/api/listings", asyncHandler(async (req, res) => {
  const { 
    sellerId, cropName, cropNameAm, quantity, unit, pricePerUnit, 
    region, title, description, imageUrl, harvestDate, qualityGrade, deliveryOptions 
  } = req.body;
  
  if (!sellerId || !cropName || !quantity || !unit || !pricePerUnit || !region || !title) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields" 
    });
  }

  const result = await pool.query(
    `INSERT INTO listings (
      seller_id, crop_name, crop_name_am, quantity, unit, price_per_unit, 
      region, title, description, image_url, harvest_date, quality_grade, 
      delivery_options, status, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'active', NOW(), NOW())
    RETURNING *`,
    [sellerId, cropName, cropNameAm, quantity, unit, pricePerUnit, region, 
     title, description, imageUrl, harvestDate, qualityGrade, deliveryOptions]
  );

  res.status(201).json({
    success: true,
    message: "Listing created successfully",
    data: result.rows[0]
  });
}));

app.put("/api/listings/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    quantity, pricePerUnit, title, description, imageUrl, 
    qualityGrade, deliveryOptions, status 
  } = req.body;
  
  const result = await pool.query(
    `UPDATE listings 
     SET quantity = COALESCE($1, quantity),
         price_per_unit = COALESCE($2, price_per_unit),
         title = COALESCE($3, title),
         description = COALESCE($4, description),
         image_url = COALESCE($5, image_url),
         quality_grade = COALESCE($6, quality_grade),
         delivery_options = COALESCE($7, delivery_options),
         status = COALESCE($8, status),
         updated_at = NOW()
     WHERE id = $9
     RETURNING *`,
    [quantity, pricePerUnit, title, description, imageUrl, qualityGrade, deliveryOptions, status, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: "Listing not found" 
    });
  }

  res.json({
    success: true,
    message: "Listing updated successfully",
    data: result.rows[0]
  });
}));

app.delete("/api/listings/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await pool.query(
    "UPDATE listings SET status = 'deleted', updated_at = NOW() WHERE id = $1 RETURNING id",
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: "Listing not found" 
    });
  }

  res.json({
    success: true,
    message: "Listing deleted successfully"
  });
}));

// ==================== INQUIRIES ENDPOINTS ====================

app.get("/api/inquiries", asyncHandler(async (req, res) => {
  const { sellerId, buyerId, status, limit = 50, offset = 0 } = req.query;
  
  let query = `
    SELECT i.*, 
           l.crop_name, l.title as listing_title,
           buyer.name as buyer_name, buyer.phone as buyer_phone, buyer.region as buyer_region,
           seller.name as seller_name
    FROM inquiries i
    JOIN listings l ON i.listing_id = l.id
    JOIN users buyer ON i.buyer_id = buyer.id
    JOIN users seller ON l.seller_id = seller.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  if (sellerId) {
    paramCount++;
    query += ` AND l.seller_id = $${paramCount}`;
    params.push(sellerId);
  }

  if (buyerId) {
    paramCount++;
    query += ` AND i.buyer_id = $${paramCount}`;
    params.push(buyerId);
  }

  if (status) {
    paramCount++;
    query += ` AND i.status = $${paramCount}`;
    params.push(status);
  }

  query += ` ORDER BY i.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  res.json({
    success: true,
    data: result.rows,
    count: result.rows.length
  });
}));

app.get("/api/inquiries/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await pool.query(
    `SELECT i.*, 
            l.crop_name, l.quantity as available_quantity, l.price_per_unit, l.title as listing_title,
            buyer.name as buyer_name, buyer.email as buyer_email, buyer.phone as buyer_phone, buyer.region as buyer_region,
            seller.name as seller_name, seller.email as seller_email, seller.phone as seller_phone
     FROM inquiries i
     JOIN listings l ON i.listing_id = l.id
     JOIN users buyer ON i.buyer_id = buyer.id
     JOIN users seller ON l.seller_id = seller.id
     WHERE i.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: "Inquiry not found" 
    });
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}));

app.post("/api/inquiries", asyncHandler(async (req, res) => {
  const { listingId, buyerId, quantity, offeredPrice, message } = req.body;
  
  if (!listingId || !buyerId || !quantity) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields: listingId, buyerId, quantity" 
    });
  }

  // Verify listing exists and is active
  const listing = await pool.query(
    "SELECT id, seller_id, quantity FROM listings WHERE id = $1 AND status = 'active'",
    [listingId]
  );

  if (listing.rows.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: "Listing not found or not active" 
    });
  }

  if (quantity > listing.rows[0].quantity) {
    return res.status(400).json({ 
      success: false, 
      message: "Requested quantity exceeds available quantity" 
    });
  }

  const result = await pool.query(
    `INSERT INTO inquiries (
      listing_id, buyer_id, quantity, offered_price, message, status, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, 'pending', NOW(), NOW())
    RETURNING *`,
    [listingId, buyerId, quantity, offeredPrice, message]
  );

  res.status(201).json({
    success: true,
    message: "Inquiry submitted successfully",
    data: result.rows[0]
  });
}));

app.put("/api/inquiries/:id/status", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, responseMessage } = req.body;
  
  if (!['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid status. Must be: pending, accepted, rejected, or completed" 
    });
  }

  const result = await pool.query(
    `UPDATE inquiries 
     SET status = $1, 
         response_message = COALESCE($2, response_message),
         responded_at = NOW(),
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [status, responseMessage, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: "Inquiry not found" 
    });
  }

  res.json({
    success: true,
    message: `Inquiry ${status} successfully`,
    data: result.rows[0]
  });
}));

// ==================== MARKET PRICES ENDPOINTS ====================

app.get("/api/market-prices", asyncHandler(async (req, res) => {
  const { crop, region, startDate, endDate, limit = 100 } = req.query;
  
  let query = `
    SELECT * FROM market_prices WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  if (crop) {
    paramCount++;
    query += ` AND LOWER(crop_name) LIKE LOWER($${paramCount})`;
    params.push(`%${crop}%`);
  }

  if (region) {
    paramCount++;
    query += ` AND LOWER(market_location) LIKE LOWER($${paramCount})`;
    params.push(`%${region}%`);
  }

  if (startDate) {
    paramCount++;
    query += ` AND price_date >= $${paramCount}`;
    params.push(startDate);
  }

  if (endDate) {
    paramCount++;
    query += ` AND price_date <= $${paramCount}`;
    params.push(endDate);
  }

  query += ` ORDER BY price_date DESC, market_location LIMIT $${paramCount + 1}`;
  params.push(limit);

  const result = await pool.query(query, params);

  res.json({
    success: true,
    data: result.rows,
    count: result.rows.length
  });
}));

app.post("/api/market-prices", asyncHandler(async (req, res) => {
  const { cropName, marketLocation, price, unit, priceDate, source } = req.body;
  
  if (!cropName || !marketLocation || !price || !unit) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields" 
    });
  }

  const result = await pool.query(
    `INSERT INTO market_prices (
      crop_name, market_location, price, unit, price_date, source, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *`,
    [cropName, marketLocation, price, unit, priceDate || new Date(), source || 'manual']
  );

  res.status(201).json({
    success: true,
    message: "Market price recorded successfully",
    data: result.rows[0]
  });
}));

// ==================== MESSAGES ENDPOINTS ====================

app.get("/api/messages", asyncHandler(async (req, res) => {
  const { userId, inquiryId, limit = 50 } = req.query;
  
  let query = `
    SELECT m.*,
           sender.name as sender_name,
           receiver.name as receiver_name
    FROM messages m
    JOIN users sender ON m.sender_id = sender.id
    JOIN users receiver ON m.receiver_id = receiver.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  if (userId) {
    paramCount++;
    query += ` AND (m.sender_id = $${paramCount} OR m.receiver_id = $${paramCount})`;
    params.push(userId);
  }

  if (inquiryId) {
    paramCount++;
    query += ` AND m.inquiry_id = $${paramCount}`;
    params.push(inquiryId);
  }

  query += ` ORDER BY m.created_at DESC LIMIT $${paramCount + 1}`;
  params.push(limit);

  const result = await pool.query(query, params);

  res.json({
    success: true,
    data: result.rows,
    count: result.rows.length
  });
}));

app.post("/api/messages", asyncHandler(async (req, res) => {
  const { senderId, receiverId, inquiryId, message } = req.body;
  
  if (!senderId || !receiverId || !message) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields: senderId, receiverId, message" 
    });
  }

  const result = await pool.query(
    `INSERT INTO messages (sender_id, receiver_id, inquiry_id, message, read, created_at)
     VALUES ($1, $2, $3, $4, false, NOW())
     RETURNING *`,
    [senderId, receiverId, inquiryId, message]
  );

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: result.rows[0]
  });
}));

app.put("/api/messages/:id/read", asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await pool.query(
    "UPDATE messages SET read = true WHERE id = $1 RETURNING *",
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: "Message not found" 
    });
  }

  res.json({
    success: true,
    message: "Message marked as read",
    data: result.rows[0]
  });
}));

// ==================== WEATHER ENDPOINT (Stub for future integration) ====================

app.get("/api/weather", asyncHandler(async (req, res) => {
  const { location = "Haramaya" } = req.query;
  
  // This is a stub - integrate with actual weather API in production
  res.json({
    success: true,
    data: {
      location,
      temperature: 24,
      condition: "Partly cloudy",
      humidity: 63,
      windSpeed: 9,
      rainChance: 12,
      forecast: [
        { day: "Today", high: 26, low: 18, condition: "Sunny" },
        { day: "Tomorrow", high: 25, low: 17, condition: "Partly cloudy" },
        { day: "Saturday", high: 24, low: 16, condition: "Cloudy" }
      ],
      timestamp: new Date().toISOString()
    }
  });
}));

// ==================== ERROR HANDLERS ====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// ==================== SERVER START ====================

app.listen(port, () => {
  console.log(`✓ AgriConnect API running at http://localhost:${port}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Database: ${process.env.DATABASE_URL ? 'configured' : 'not configured'}`);
});
