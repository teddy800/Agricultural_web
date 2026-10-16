-- AgriConnect Database Schema
-- PostgreSQL Database Schema for Agricultural Marketplace Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  region VARCHAR(100),
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('farmer', 'buyer', 'trader', 'admin')),
  active BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  profile_image_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster user lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_account_type ON users(account_type);

-- ==================== LISTINGS TABLE ====================
CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop_name VARCHAR(100) NOT NULL,
  crop_name_am VARCHAR(100),  -- Amharic name
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL CHECK (unit IN ('quintal', 'kg', 'ton', 'piece', 'bag')),
  price_per_unit DECIMAL(10, 2) NOT NULL,
  region VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  harvest_date DATE,
  quality_grade VARCHAR(20) CHECK (quality_grade IN ('premium', 'grade-a', 'grade-b', 'standard')),
  delivery_options TEXT,  -- JSON string: ["pickup", "delivery", "both"]
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'expired', 'deleted')),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_crop_name ON listings(crop_name);
CREATE INDEX idx_listings_region ON listings(region);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_price ON listings(price_per_unit);

-- ==================== INQUIRIES TABLE ====================
CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL,
  offered_price DECIMAL(10, 2),
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  response_message TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for inquiries
CREATE INDEX idx_inquiries_listing_id ON inquiries(listing_id);
CREATE INDEX idx_inquiries_buyer_id ON inquiries(buyer_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- ==================== MESSAGES TABLE ====================
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  inquiry_id INTEGER REFERENCES inquiries(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for messages
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_inquiry_id ON messages(inquiry_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ==================== MARKET PRICES TABLE ====================
CREATE TABLE IF NOT EXISTS market_prices (
  id SERIAL PRIMARY KEY,
  crop_name VARCHAR(100) NOT NULL,
  market_location VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  price_date DATE NOT NULL,
  source VARCHAR(50),  -- 'manual', 'api', 'import'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for market prices
CREATE INDEX idx_market_prices_crop_name ON market_prices(crop_name);
CREATE INDEX idx_market_prices_location ON market_prices(market_location);
CREATE INDEX idx_market_prices_date ON market_prices(price_date DESC);

-- ==================== REVIEWS TABLE ====================
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  inquiry_id INTEGER REFERENCES inquiries(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for reviews
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_inquiry_id ON reviews(inquiry_id);

-- ==================== FAVORITES TABLE ====================
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, listing_id)
);

-- Indexes for favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);

-- ==================== NOTIFICATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,  -- 'inquiry', 'message', 'price_alert', 'listing_update'
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link VARCHAR(255),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ==================== FUNCTIONS & TRIGGERS ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== SAMPLE DATA ====================

-- Insert sample users
INSERT INTO users (name, email, phone, password_hash, region, account_type, verified, active) VALUES
('Tewodros Fikadu', 'tewodros@agriconnect.et', '+251911234567', 'hashed_password_1', 'Oromia', 'farmer', true, true),
('Selam Tesfaye', 'selam@agriconnect.et', '+251922345678', 'hashed_password_2', 'Sidama', 'farmer', true, true),
('Mohammed Ali', 'mohammed@agriconnect.et', '+251933456789', 'hashed_password_3', 'Dire Dawa', 'farmer', true, true),
('Kebede Tadesse', 'kebede@agriconnect.et', '+251944567890', 'hashed_password_4', 'Addis Ababa', 'buyer', true, true),
('Hana Bekele', 'hana@agriconnect.et', '+251955678901', 'hashed_password_5', 'Oromia', 'farmer', true, true),
('Abebe Girma', 'abebe@agriconnect.et', '+251966789012', 'hashed_password_6', 'Amhara', 'trader', true, true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample listings
INSERT INTO listings (seller_id, crop_name, crop_name_am, quantity, unit, price_per_unit, region, title, description, image_url, harvest_date, quality_grade, delivery_options, status) VALUES
(1, 'Teff', 'ጤፍ', 50, 'quintal', 3800, 'Haramaya, Oromia', 'Premium Teff - 2026 Harvest', 'High-quality teff from Haramaya region. Fresh harvest with excellent grain quality. Available for immediate delivery.', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=900&q=85', '2026-04-15', 'premium', '["pickup", "delivery"]', 'active'),
(2, 'Coffee', 'ቡና', 20, 'quintal', 12500, 'Yirgacheffe, Sidama', 'Organic Yirgacheffe Coffee Beans', 'Premium organic coffee from Yirgacheffe. Grade 1 quality, washed process. Perfect for specialty coffee markets.', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=85', '2026-03-20', 'premium', '["pickup"]', 'active'),
(3, 'Maize', 'በቆሎ', 100, 'quintal', 1850, 'Dire Dawa', 'Yellow Maize - Grade A', 'Fresh yellow maize suitable for both human consumption and animal feed. Properly dried and stored.', 'https://images.unsplash.com/photo-1601593768792-3f4f0d8c3c74?auto=format&fit=crop&w=900&q=85', '2026-04-10', 'grade-a', '["pickup", "delivery"]', 'active'),
(1, 'Wheat', 'ስንዴ', 30, 'quintal', 2200, 'Addis Ababa', 'Bread Wheat - New Harvest', 'High-protein bread wheat suitable for commercial baking. Clean and properly stored.', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=900&q=85', '2026-04-18', 'grade-a', '["pickup"]', 'active'),
(5, 'Tomatoes', 'ቲማቲም', 18, 'quintal', 1450, 'Bishoftu, Oromia', 'Fresh Roma Tomatoes', 'Fresh tomatoes harvested this week. Perfect for markets and restaurants. Quick delivery available.', 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=85', '2026-04-24', 'premium', '["pickup", "delivery"]', 'active'),
(6, 'Haricot Beans', 'ባቄላ', 40, 'quintal', 4200, 'Arba Minch', 'White Haricot Beans - Export Quality', 'Premium white haricot beans suitable for export. Clean, uniform size, properly dried.', 'https://images.unsplash.com/photo-1515543904379-3d7579598965?auto=format&fit=crop&w=900&q=85', '2026-04-05', 'premium', '["pickup"]', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample inquiries
INSERT INTO inquiries (listing_id, buyer_id, quantity, offered_price, message, status) VALUES
(1, 4, 10, 3600, 'Hello, I am interested in purchasing 10 quintals of teff. Can you deliver to Addis Ababa?', 'pending'),
(2, 4, 5, 12000, 'I would like to buy 5 quintals of your coffee. Is the price negotiable?', 'accepted'),
(3, 6, 20, 1700, 'Need 20 quintals of maize for animal feed. When can you deliver?', 'pending'),
(1, 6, 15, 2100, 'Interested in wheat. Do you offer bulk discount?', 'rejected')
ON CONFLICT DO NOTHING;

-- Insert sample market prices
INSERT INTO market_prices (crop_name, market_location, price, unit, price_date, source) VALUES
('Teff', 'Haramaya', 3900, 'quintal', '2026-04-26', 'manual'),
('Teff', 'Harar', 3550, 'quintal', '2026-04-26', 'manual'),
('Teff', 'Dire Dawa', 3250, 'quintal', '2026-04-26', 'manual'),
('Teff', 'Merkato', 3000, 'quintal', '2026-04-26', 'manual'),
('Coffee', 'Yirgacheffe', 13000, 'quintal', '2026-04-26', 'manual'),
('Coffee', 'Sidama', 12800, 'quintal', '2026-04-26', 'manual'),
('Maize', 'Dire Dawa', 1900, 'quintal', '2026-04-26', 'manual'),
('Maize', 'Harar', 1850, 'quintal', '2026-04-26', 'manual'),
('Wheat', 'Addis Ababa', 2300, 'quintal', '2026-04-26', 'manual'),
('Wheat', 'Nazret', 2200, 'quintal', '2026-04-26', 'manual')
ON CONFLICT DO NOTHING;

-- Insert historical price data for trending
INSERT INTO market_prices (crop_name, market_location, price, unit, price_date, source) VALUES
('Teff', 'Haramaya', 3400, 'quintal', '2026-04-20', 'manual'),
('Teff', 'Haramaya', 3300, 'quintal', '2026-04-21', 'manual'),
('Teff', 'Haramaya', 3500, 'quintal', '2026-04-22', 'manual'),
('Teff', 'Haramaya', 3550, 'quintal', '2026-04-23', 'manual'),
('Teff', 'Haramaya', 3800, 'quintal', '2026-04-24', 'manual'),
('Teff', 'Haramaya', 3850, 'quintal', '2026-04-25', 'manual')
ON CONFLICT DO NOTHING;

-- ==================== VIEWS ====================

-- View for listing details with seller information
CREATE OR REPLACE VIEW v_listings_with_seller AS
SELECT 
  l.*,
  u.name as seller_name,
  u.email as seller_email,
  u.phone as seller_phone,
  u.region as seller_region,
  u.verified as seller_verified,
  (SELECT COUNT(*) FROM inquiries WHERE listing_id = l.id) as inquiry_count,
  (SELECT COUNT(*) FROM favorites WHERE listing_id = l.id) as favorites_count
FROM listings l
JOIN users u ON l.seller_id = u.id;

-- View for inquiry statistics
CREATE OR REPLACE VIEW v_inquiry_stats AS
SELECT 
  u.id as seller_id,
  u.name as seller_name,
  COUNT(DISTINCT i.id) as total_inquiries,
  COUNT(DISTINCT CASE WHEN i.status = 'pending' THEN i.id END) as pending_inquiries,
  COUNT(DISTINCT CASE WHEN i.status = 'accepted' THEN i.id END) as accepted_inquiries,
  COUNT(DISTINCT CASE WHEN i.status = 'completed' THEN i.id END) as completed_inquiries
FROM users u
LEFT JOIN listings l ON u.id = l.seller_id
LEFT JOIN inquiries i ON l.id = i.listing_id
GROUP BY u.id, u.name;

-- ==================== PERMISSIONS ====================

-- Grant permissions (adjust username as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO agri;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO agri;

-- End of schema
