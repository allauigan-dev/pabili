/**
 * Seed Script - Generate sample data for testing infinite scroll
 * Run with: npx wrangler d1 execute pabili-db --local --file=scripts/seed.sql
 */

-- Sample Stores (25 stores)
INSERT INTO stores (organization_id, store_name, store_address, store_phone, store_status, created_at) VALUES
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Lazada Philippines', 'BGC, Taguig City', '09171234567', 'active', datetime('now', '-30 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Shopee Mall', 'Makati City', '09181234567', 'active', datetime('now', '-29 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'SM Appliance Center', 'SM Mall of Asia', '09191234567', 'active', datetime('now', '-28 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Abenson', 'Quezon City', '09201234567', 'active', datetime('now', '-27 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Anson''s', 'Mandaluyong', '09211234567', 'active', datetime('now', '-26 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Western Appliances', 'Pasig City', '09221234567', 'active', datetime('now', '-25 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Robinsons Appliances', 'Robinsons Galleria', '09231234567', 'active', datetime('now', '-24 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Octagon', 'Gilmore, QC', '09241234567', 'active', datetime('now', '-23 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'PC Express', 'SM Megamall', '09251234567', 'active', datetime('now', '-22 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Datablitz', 'SM North EDSA', '09261234567', 'active', datetime('now', '-21 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Toy Kingdom', 'Trinoma', '09271234567', 'active', datetime('now', '-20 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'National Book Store', 'Gateway Mall', '09281234567', 'active', datetime('now', '-19 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Landmark Department Store', 'Makati City', '09291234567', 'active', datetime('now', '-18 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Uniqlo', 'Ayala Malls', '09301234567', 'active', datetime('now', '-17 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'H&M Philippines', 'SM Aura', '09311234567', 'active', datetime('now', '-16 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Watsons', 'Ever Gotesco', '09321234567', 'active', datetime('now', '-15 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Mercury Drug', 'Quezon Avenue', '09331234567', 'active', datetime('now', '-14 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Ace Hardware', 'SM Fairview', '09341234567', 'active', datetime('now', '-13 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Handyman', 'SM San Lazaro', '09351234567', 'active', datetime('now', '-12 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'True Value', 'Alabang Town Center', '09361234567', 'active', datetime('now', '-11 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Office Warehouse', 'SM Southmall', '09371234567', 'active', datetime('now', '-10 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Samsung Store', 'Power Plant Mall', '09381234567', 'active', datetime('now', '-9 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Apple Store', 'Greenbelt', '09391234567', 'active', datetime('now', '-8 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Xiaomi Store', 'SM Megamall', '09401234567', 'active', datetime('now', '-7 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Realme Concept Store', 'Festival Mall', '09411234567', 'active', datetime('now', '-6 days'));

-- Sample Customers (25 customers)
INSERT INTO customers (organization_id, customer_name, customer_address, customer_phone, customer_email, customer_status, created_at) VALUES
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Maria Santos', 'Quezon City', '09171111111', 'maria@example.com', 'active', datetime('now', '-30 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Juan Dela Cruz', 'Manila', '09172222222', 'juan@example.com', 'active', datetime('now', '-29 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Ana Reyes', 'Makati City', '09173333333', 'ana@example.com', 'active', datetime('now', '-28 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Pedro Garcia', 'Pasig City', '09174444444', 'pedro@example.com', 'active', datetime('now', '-27 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Rosa Lopez', 'Taguig City', '09175555555', 'rosa@example.com', 'active', datetime('now', '-26 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Carlos Martinez', 'Mandaluyong', '09176666666', 'carlos@example.com', 'active', datetime('now', '-25 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Elena Cruz', 'Caloocan', '09177777777', 'elena@example.com', 'active', datetime('now', '-24 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Miguel Tan', 'Las Pinas', '09178888888', 'miguel@example.com', 'active', datetime('now', '-23 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Sofia Lim', 'Paranaque', '09179999999', 'sofia@example.com', 'active', datetime('now', '-22 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Antonio Sy', 'Muntinlupa', '09180000000', 'antonio@example.com', 'active', datetime('now', '-21 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Lucia Fernandez', 'Marikina', '09181111111', 'lucia@example.com', 'active', datetime('now', '-20 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Roberto Aquino', 'Pasay City', '09182222222', 'roberto@example.com', 'active', datetime('now', '-19 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Carmen Ramos', 'Valenzuela', '09183333333', 'carmen@example.com', 'active', datetime('now', '-18 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Jose Villanueva', 'Malabon', '09184444444', 'jose@example.com', 'active', datetime('now', '-17 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Teresa Mendoza', 'Navotas', '09185555555', 'teresa@example.com', 'active', datetime('now', '-16 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Ricardo Gonzales', 'San Juan', '09186666666', 'ricardo@example.com', 'active', datetime('now', '-15 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Patricia Bautista', 'Pateros', '09187777777', 'patricia@example.com', 'active', datetime('now', '-14 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Fernando Torres', 'Bulacan', '09188888888', 'fernando@example.com', 'active', datetime('now', '-13 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Dolores Castro', 'Cavite', '09189999999', 'dolores@example.com', 'active', datetime('now', '-12 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Emmanuel Rivera', 'Laguna', '09190000000', 'emmanuel@example.com', 'active', datetime('now', '-11 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Rosario Salazar', 'Rizal', '09191111111', 'rosario@example.com', 'active', datetime('now', '-10 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Leonardo Perez', 'Batangas', '09192222222', 'leonardo@example.com', 'active', datetime('now', '-9 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Beatriz Morales', 'Pampanga', '09193333333', 'beatriz@example.com', 'active', datetime('now', '-8 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Alfredo Navarro', 'Zambales', '09194444444', 'alfredo@example.com', 'active', datetime('now', '-7 days')),
('UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF', 'Margarita Aguilar', 'Pangasinan', '09195555555', 'margarita@example.com', 'active', datetime('now', '-6 days'));
