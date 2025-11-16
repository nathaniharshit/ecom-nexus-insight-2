# Sample Test Data for Analytics

To see your analytics dashboard with real data, you can add sample orders through the Supabase Dashboard:

## Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**

## Step 2: Add Sample Orders

Run this SQL to create sample orders and order items:

```sql
-- First, get a user_id from your profiles table
-- Replace 'your-user-id' with an actual user_id from the profiles table

-- Insert sample orders
INSERT INTO public.orders (user_id, order_number, total, status, shipping_address, created_at) VALUES
('your-user-id', 'ORD-001', 1299.99, 'delivered', '123 Main St, Mumbai', '2025-11-10 10:00:00+00'),
('your-user-id', 'ORD-002', 899.50, 'delivered', '123 Main St, Mumbai', '2025-11-12 14:30:00+00'),
('your-user-id', 'ORD-003', 2499.99, 'processing', '123 Main St, Mumbai', '2025-11-15 09:15:00+00');

-- Get the order IDs (run this to see the created orders)
SELECT id, order_number, total FROM public.orders WHERE order_number LIKE 'ORD-%';

-- Insert sample order items (replace order-id-1, order-id-2, etc. with actual order IDs from above)
-- Also replace product-id-1, product-id-2, etc. with actual product IDs from your products table

INSERT INTO public.order_items (order_id, product_id, quantity, price, created_at) VALUES
-- For Order 1
('order-id-1', 'product-id-1', 1, 1299.99, '2025-11-10 10:00:00+00'),

-- For Order 2  
('order-id-2', 'product-id-2', 2, 449.75, '2025-11-12 14:30:00+00'),

-- For Order 3
('order-id-3', 'product-id-1', 1, 1299.99, '2025-11-15 09:15:00+00'),
('order-id-3', 'product-id-3', 3, 399.00, '2025-11-15 09:15:00+00');
```

## Step 3: Get Actual IDs

To get the actual IDs for your database:

```sql
-- Get user IDs
SELECT user_id, created_at FROM public.profiles LIMIT 5;

-- Get product IDs  
SELECT id, name, price FROM public.products LIMIT 10;

-- After inserting orders, get order IDs
SELECT id, order_number FROM public.orders ORDER BY created_at DESC LIMIT 5;
```

## Step 4: Verify Data

```sql
-- Check orders
SELECT * FROM public.orders;

-- Check order items with product names
SELECT 
  oi.*,
  p.name as product_name,
  o.order_number
FROM public.order_items oi
JOIN public.products p ON p.id = oi.product_id  
JOIN public.orders o ON o.id = oi.order_id
ORDER BY oi.created_at DESC;
```

## Step 5: Refresh Analytics

After adding the data:
1. Refresh your analytics page at http://localhost:8080/analytics
2. You should see:
   - Real revenue numbers in the Sales tab
   - Customer data in the Customers tab  
   - Product performance in the Products tab
   - Interactive charts with actual data

## Quick Test Data Template

Here's a quick template with placeholder values:

```sql
-- Step 1: Get actual IDs first
SELECT user_id FROM public.profiles LIMIT 1; -- Copy this user_id
SELECT id, name FROM public.products LIMIT 3; -- Copy these product IDs

-- Step 2: Replace placeholders and run
INSERT INTO public.orders (user_id, order_number, total, status, shipping_address, created_at) VALUES
('[PASTE-USER-ID-HERE]', 'TEST-001', 1500.00, 'delivered', '123 Test Street', now() - interval '5 days'),
('[PASTE-USER-ID-HERE]', 'TEST-002', 750.00, 'delivered', '123 Test Street', now() - interval '3 days'),
('[PASTE-USER-ID-HERE]', 'TEST-003', 2200.00, 'processing', '123 Test Street', now() - interval '1 day');

-- Step 3: Get the created order IDs
SELECT id, order_number FROM public.orders WHERE order_number LIKE 'TEST-%';

-- Step 4: Add order items (replace order and product IDs)
INSERT INTO public.order_items (order_id, product_id, quantity, price) VALUES
('[ORDER-ID-1]', '[PRODUCT-ID-1]', 1, 1500.00),
('[ORDER-ID-2]', '[PRODUCT-ID-2]', 1, 750.00),
('[ORDER-ID-3]', '[PRODUCT-ID-1]', 1, 1500.00),
('[ORDER-ID-3]', '[PRODUCT-ID-3]', 2, 350.00);
```

This will give you instant analytics data to see your beautiful dashboards in action! 🚀