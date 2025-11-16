-- ===================================================================
-- STEP 1: GET YOUR ACTUAL DATABASE IDs
-- Copy and run each query separately in Supabase SQL Editor
-- ===================================================================

-- Query 1: Get available user IDs
SELECT 
    'Copy one of these user_id values:' as instruction,
    user_id,
    created_at
FROM public.profiles 
ORDER BY created_at 
LIMIT 5;

-- Query 2: Get available product IDs  
SELECT 
    'Copy these product IDs:' as instruction,
    id,
    name,
    price,
    category,
    stock
FROM public.products 
ORDER BY created_at 
LIMIT 10;

-- ===================================================================
-- STEP 2: QUICK SAMPLE DATA CREATION
-- Replace the placeholders below with actual IDs from above queries
-- ===================================================================

-- Replace these with actual IDs from your queries above:
-- USER_ID_HERE = copy from query 1
-- PRODUCT_ID_1, PRODUCT_ID_2, etc = copy from query 2

INSERT INTO public.orders (user_id, order_number, total, status, shipping_address, created_at) VALUES
('USER_ID_HERE', 'DEMO-001', 1299.99, 'delivered', '123 Demo Street, Mumbai', now() - interval '10 days'),
('USER_ID_HERE', 'DEMO-002', 2150.50, 'delivered', '123 Demo Street, Mumbai', now() - interval '7 days'),
('USER_ID_HERE', 'DEMO-003', 899.99, 'delivered', '123 Demo Street, Mumbai', now() - interval '4 days'),
('USER_ID_HERE', 'DEMO-004', 1750.00, 'processing', '123 Demo Street, Mumbai', now() - interval '2 days'),
('USER_ID_HERE', 'DEMO-005', 3299.99, 'shipped', '123 Demo Street, Mumbai', now() - interval '1 day');

-- Get the order IDs that were just created (run this after the above)
SELECT id, order_number, total FROM public.orders WHERE order_number LIKE 'DEMO-%' ORDER BY created_at;

-- Now add order items (replace ORDER_ID_X and PRODUCT_ID_X with actual values)
INSERT INTO public.order_items (order_id, product_id, quantity, price) VALUES
-- Order DEMO-001 items
('ORDER_ID_1', 'PRODUCT_ID_1', 1, 1299.99),

-- Order DEMO-002 items  
('ORDER_ID_2', 'PRODUCT_ID_1', 1, 1299.99),
('ORDER_ID_2', 'PRODUCT_ID_2', 1, 850.51),

-- Order DEMO-003 items
('ORDER_ID_3', 'PRODUCT_ID_3', 1, 899.99),

-- Order DEMO-004 items
('ORDER_ID_4', 'PRODUCT_ID_2', 2, 875.00),

-- Order DEMO-005 items
('ORDER_ID_5', 'PRODUCT_ID_1', 2, 1299.99),
('ORDER_ID_5', 'PRODUCT_ID_4', 1, 699.99);

-- ===================================================================
-- STEP 3: VERIFY YOUR DATA
-- ===================================================================

-- Check total orders and revenue
SELECT 
    count(*) as total_orders,
    sum(total) as total_revenue,
    avg(total) as avg_order_value
FROM public.orders;

-- Check order details with products
SELECT 
    o.order_number,
    o.total as order_total,
    o.status,
    p.name as product_name,
    oi.quantity,
    oi.price
FROM public.orders o
JOIN public.order_items oi ON oi.order_id = o.id
JOIN public.products p ON p.id = oi.product_id
ORDER BY o.created_at DESC;

-- Your analytics should now show real data! 🚀