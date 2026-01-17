-- ============================================
-- Kalenjin Vibes Payment System Schema
-- ============================================

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS/CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    customer_uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email)
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone_number);

-- ============================================
-- 2. TALENTS TABLE (for talent bookings)
-- ============================================
CREATE TABLE talents (
    talent_id SERIAL PRIMARY KEY,
    talent_uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    talent_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    rate DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. EVENTS TABLE
-- ============================================
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    event_uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE,
    location VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. PRODUCTS TABLE (for cart purchases)
-- ============================================
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    is_available BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. PAYMENT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE payment_transactions (
    transaction_id SERIAL PRIMARY KEY,
    transaction_uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    
    -- Ticket number format: KV-YYYYMMDD-XXXXX (random incrementing)
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Customer info
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE SET NULL,
    
    -- Payment details
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('mpesa', 'paybill')),
    transaction_code VARCHAR(50) NOT NULL, -- M-Pesa transaction code
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KSH',
    
    -- Booking type
    booking_type VARCHAR(50) NOT NULL CHECK (booking_type IN ('talent_booking', 'cart_checkout', 'event_ticket')),
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'failed')),
    
    -- Timestamps
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for transactions
CREATE INDEX idx_transactions_ticket ON payment_transactions(ticket_number);
CREATE INDEX idx_transactions_customer ON payment_transactions(customer_id);
CREATE INDEX idx_transactions_status ON payment_transactions(status);
CREATE INDEX idx_transactions_date ON payment_transactions(payment_date);
CREATE INDEX idx_transactions_code ON payment_transactions(transaction_code);

-- ============================================
-- 6. TALENT BOOKINGS TABLE
-- ============================================
CREATE TABLE talent_bookings (
    booking_id SERIAL PRIMARY KEY,
    booking_uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    
    -- Foreign keys
    transaction_id INTEGER REFERENCES payment_transactions(transaction_id) ON DELETE CASCADE,
    talent_id INTEGER REFERENCES talents(talent_id) ON DELETE SET NULL,
    event_id INTEGER REFERENCES events(event_id) ON DELETE SET NULL,
    
    -- Booking details
    talent_name VARCHAR(255) NOT NULL,
    event_name VARCHAR(255),
    event_date DATE,
    location VARCHAR(255),
    booking_notes TEXT,
    
    -- Timing
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    booking_status VARCHAR(20) DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'completed', 'cancelled', 'no_show')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. CART ORDERS TABLE
-- ============================================
CREATE TABLE cart_orders (
    order_id SERIAL PRIMARY KEY,
    order_uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    
    -- Foreign keys
    transaction_id INTEGER REFERENCES payment_transactions(transaction_id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE SET NULL,
    
    -- Order details
    subtotal DECIMAL(10,2) NOT NULL,
    shipping DECIMAL(10,2) DEFAULT 9.99,
    tax DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Shipping info
    shipping_address TEXT,
    
    -- Status
    order_status VARCHAR(20) DEFAULT 'processing' CHECK (order_status IN ('processing', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    
    -- Timestamps
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipped_date TIMESTAMP,
    delivered_date TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. ORDER ITEMS TABLE (for cart purchases)
-- ============================================
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_item_uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    
    -- Foreign keys
    order_id INTEGER REFERENCES cart_orders(order_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id) ON DELETE SET NULL,
    
    -- Item details
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for order items
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================
-- 9. TICKET NUMBER SEQUENCE TABLE
-- ============================================
CREATE TABLE ticket_sequence (
    sequence_id SERIAL PRIMARY KEY,
    prefix VARCHAR(10) NOT NULL DEFAULT 'KV',
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
    last_number INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(prefix, year, month, day)
);

-- ============================================
-- 10. PAYMENT LOGS TABLE (for auditing)
-- ============================================
CREATE TABLE payment_logs (
    log_id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES payment_transactions(transaction_id) ON DELETE CASCADE,
    
    -- Action details
    action VARCHAR(50) NOT NULL, -- 'payment_initiated', 'mpesa_response', 'confirmation_sent', etc.
    log_message TEXT,
    log_data JSONB,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for logs
CREATE INDEX idx_payment_logs_transaction ON payment_logs(transaction_id);
CREATE INDEX idx_payment_logs_created ON payment_logs(created_at);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to generate unique ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    ticket_prefix VARCHAR(10) := 'KV';
    current_date DATE := CURRENT_DATE;
    year_part INTEGER := EXTRACT(YEAR FROM current_date);
    month_part INTEGER := EXTRACT(MONTH FROM current_date);
    day_part INTEGER := EXTRACT(DAY FROM current_date);
    next_number INTEGER;
    ticket_num VARCHAR(50);
BEGIN
    -- Get or create sequence for today
    INSERT INTO ticket_sequence (prefix, year, month, day, last_number)
    VALUES (ticket_prefix, year_part, month_part, day_part, 0)
    ON CONFLICT (prefix, year, month, day) 
    DO UPDATE SET last_number = ticket_sequence.last_number + 1
    RETURNING last_number INTO next_number;
    
    -- Format: KV-YYYYMMDD-XXXXX (5-digit random incrementing number)
    ticket_num := FORMAT('%s-%s%s%s-%s',
        ticket_prefix,
        LPAD(year_part::TEXT, 4, '0'),
        LPAD(month_part::TEXT, 2, '0'),
        LPAD(day_part::TEXT, 2, '0'),
        LPAD(next_number::TEXT, 5, '0')
    );
    
    NEW.ticket_number := ticket_num;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate ticket number before insert
CREATE TRIGGER tr_generate_ticket_number
    BEFORE INSERT ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION generate_ticket_number();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to relevant tables
CREATE TRIGGER tr_update_customers_timestamp
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_update_transactions_timestamp
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_update_bookings_timestamp
    BEFORE UPDATE ON talent_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_update_orders_timestamp
    BEFORE UPDATE ON cart_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View for daily payment summary
CREATE VIEW daily_payments_summary AS
SELECT 
    DATE(payment_date) as payment_day,
    payment_method,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount
FROM payment_transactions
WHERE status IN ('confirmed', 'completed')
GROUP BY DATE(payment_date), payment_method
ORDER BY payment_day DESC;

-- View for customer purchase history
CREATE VIEW customer_purchase_history AS
SELECT 
    c.customer_id,
    c.full_name,
    c.email,
    c.phone_number,
    COUNT(pt.transaction_id) as total_transactions,
    SUM(pt.amount) as total_spent,
    MAX(pt.payment_date) as last_purchase_date
FROM customers c
LEFT JOIN payment_transactions pt ON c.customer_id = pt.customer_id
    AND pt.status IN ('confirmed', 'completed')
GROUP BY c.customer_id, c.full_name, c.email, c.phone_number;

-- View for sales by product
CREATE VIEW product_sales AS
SELECT 
    p.product_id,
    p.product_name,
    p.category,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.total_price) as total_revenue,
    COUNT(DISTINCT co.order_id) as order_count
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
JOIN cart_orders co ON oi.order_id = co.order_id
    AND co.order_status IN ('confirmed', 'shipped', 'delivered')
GROUP BY p.product_id, p.product_name, p.category
ORDER BY total_revenue DESC;

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Insert sample talents
INSERT INTO talents (talent_name, category, rate, is_active) VALUES
('DJ Kalenjin', 'DJ', 50000.00, true),
('Cheptoo Band', 'Band', 150000.00, true),
('Kipkorir Comedian', 'Comedian', 30000.00, true),
('Cherono Dancer', 'Dancer', 25000.00, true);

-- Insert sample products
INSERT INTO products (product_name, description, price, category, stock_quantity) VALUES
('Kalenjin Vibes T-Shirt', 'Official merchandise t-shirt', 1500.00, 'merchandise', 100),
('Event VIP Pass', 'VIP access to Kalenjin Vibes Night', 5000.00, 'tickets', 50),
('Music Album', 'Best of Kalenjin Vibes songs', 800.00, 'media', 200),
('Baseball Cap', 'Stylish cap with logo', 1200.00, 'merchandise', 75);

-- Insert sample events
INSERT INTO events (event_name, event_date, location, description) VALUES
('Kalenjin Vibes Night', '2024-12-25', 'Nairobi Stadium', 'Annual mega concert'),
('Cultural Festival', '2024-11-15', 'Eldoret Town Hall', 'Traditional music and dance'),
('Talent Showcase', '2024-10-30', 'Online Event', 'Virtual talent competition');

-- ============================================
-- GRANT PERMISSIONS (adjust based on your setup)
-- ============================================

-- Example: Create a payment processor user
-- CREATE USER payment_processor WITH PASSWORD 'secure_password';
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO payment_processor;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO payment_processor;

-- ============================================
-- SECURITY NOTES
-- ============================================

/*
SECURITY RECOMMENDATIONS:
1. Never store sensitive data like M-PESA PINs
2. Use parameterized queries to prevent SQL injection
3. Encrypt sensitive customer data at rest
4. Regularly backup the database
5. Implement row-level security if needed
6. Use SSL for database connections
7. Regularly audit the payment_logs table
*/

COMMENT ON TABLE payment_transactions IS 'Stores all payment transactions with unique ticket numbers';
COMMENT ON COLUMN payment_transactions.ticket_number IS 'Format: KV-YYYYMMDD-XXXXX (e.g., KV-20241225-00001)';
COMMENT ON COLUMN payment_transactions.transaction_code IS 'M-Pesa transaction code from customer';