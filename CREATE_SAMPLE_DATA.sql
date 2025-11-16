-- ===================================================================
-- COMPREHENSIVE SAMPLE DATA FOR ANALYTICS DASHBOARD
-- Run this in Supabase Dashboard > SQL Editor
-- ===================================================================

-- Step 1: Check existing data
SELECT 'EXISTING PROFILES' as info, count(*) as count FROM public.profiles;
SELECT 'EXISTING PRODUCTS' as info, count(*) as count FROM public.products;
SELECT 'EXISTING ORDERS' as info, count(*) as count FROM public.orders;

-- Step 2: Get some actual IDs to work with
SELECT 'Available User IDs:' as info;
SELECT user_id, created_at FROM public.profiles ORDER BY created_at LIMIT 3;

SELECT 'Available Product IDs:' as info;
SELECT id, name, price, stock FROM public.products ORDER BY created_at LIMIT 10;

-- ===================================================================
-- STEP 3: ADD SAMPLE ORDERS (MODIFY USER_ID AND PRODUCT_IDS BELOW)
-- ===================================================================

-- INSTRUCTIONS:
-- 1. Copy a user_id from the profiles query above
-- 2. Copy 5-6 product IDs from the products query above  
-- 3. Replace the placeholder values below with real IDs
-- 4. Run this section

-- Replace 'PASTE_USER_ID_HERE' with actual user_id from your profiles table
DO $$
DECLARE
    sample_user_id UUID := 'PASTE_USER_ID_HERE'; -- ← CHANGE THIS
    order_1_id UUID := gen_random_uuid();
    order_2_id UUID := gen_random_uuid();
    order_3_id UUID := gen_random_uuid();
    order_4_id UUID := gen_random_uuid();
    order_5_id UUID := gen_random_uuid();
BEGIN
    -- Insert sample orders spanning the last 2 weeks
    INSERT INTO public.orders (id, user_id, order_number, total, status, shipping_address, created_at) VALUES
    (order_1_id, sample_user_id, 'ORD-2025-001', 1299.99, 'delivered', '123 Tech Street, Mumbai 400001', now() - interval '14 days'),
    (order_2_id, sample_user_id, 'ORD-2025-002', 2450.50, 'delivered', '123 Tech Street, Mumbai 400001', now() - interval '12 days'),
    (order_3_id, sample_user_id, 'ORD-2025-003', 899.99, 'delivered', '123 Tech Street, Mumbai 400001', now() - interval '8 days'),
    (order_4_id, sample_user_id, 'ORD-2025-004', 3299.99, 'processing', '123 Tech Street, Mumbai 400001', now() - interval '5 days'),
    (order_5_id, sample_user_id, 'ORD-2025-005', 1750.00, 'shipped', '123 Tech Street, Mumbai 400001', now() - interval '2 days');

    -- Insert order items (Replace PRODUCT_ID_X with actual product IDs from your products table)
    INSERT INTO public.order_items (order_id, product_id, quantity, price, created_at) VALUES
    -- Order 1: Electronics
    (order_1_id, 'PRODUCT_ID_1', 1, 1299.99, now() - interval '14 days'), -- Replace with iPhone/smartphone ID
    
    -- Order 2: Mixed electronics
    (order_2_id, 'PRODUCT_ID_2', 1, 1899.50, now() - interval '12 days'), -- Replace with laptop/tablet ID  
    (order_2_id, 'PRODUCT_ID_3', 2, 275.50, now() - interval '12 days'),  -- Replace with accessories ID
    
    -- Order 3: Fashion
    (order_3_id, 'PRODUCT_ID_4', 1, 899.99, now() - interval '8 days'),   -- Replace with shoes/clothing ID
    
    -- Order 4: Premium electronics
    (order_4_id, 'PRODUCT_ID_1', 2, 1299.99, now() - interval '5 days'),  -- 2x smartphones
    (order_4_id, 'PRODUCT_ID_5', 1, 699.99, now() - interval '5 days'),   -- Replace with watch/audio ID
    
    -- Order 5: Home & accessories  
    (order_5_id, 'PRODUCT_ID_6', 3, 350.00, now() - interval '2 days'),   -- Replace with home products ID
    (order_5_id, 'PRODUCT_ID_3', 4, 275.50, now() - interval '2 days');   -- More accessories
    
    RAISE NOTICE 'Sample orders created successfully! Order IDs: %, %, %, %, %', 
        order_1_id, order_2_id, order_3_id, order_4_id, order_5_id;
END $$;

-- ===================================================================
-- STEP 4: VERIFY THE DATA WAS CREATED
-- ===================================================================

SELECT 'VERIFICATION: Orders Created' as info;
SELECT 
    o.order_number,
    o.total,
    o.status,
    o.created_at,
    count(oi.id) as items
FROM public.orders o
LEFT JOIN public.order_items oi ON oi.order_id = o.id
WHERE o.order_number LIKE 'ORD-2025-%'
GROUP BY o.id, o.order_number, o.total, o.status, o.created_at
ORDER BY o.created_at DESC;

SELECT 'VERIFICATION: Order Items with Products' as info;
SELECT 
    o.order_number,
    p.name as product_name,
    oi.quantity,
    oi.price,
    (oi.quantity * oi.price) as total_item_value
FROM public.order_items oi
JOIN public.orders o ON o.id = oi.order_id  
JOIN public.products p ON p.id = oi.product_id
WHERE o.order_number LIKE 'ORD-2025-%'
ORDER BY o.created_at DESC, p.name;

-- ===================================================================
-- BONUS: CREATE ADDITIONAL CUSTOMER DIVERSITY (OPTIONAL)
-- ===================================================================

-- If you want more customer diversity, you can create additional profiles
-- This is optional and only run if you want more customer analytics data

-- Uncomment and run this section if you want multiple customers:
/*
INSERT INTO public.profiles (user_id, created_at) VALUES
(gen_random_uuid(), now() - interval '30 days'),
(gen_random_uuid(), now() - interval '25 days'),
(gen_random_uuid(), now() - interval '20 days'),
(gen_random_uuid(), now() - interval '15 days'),
(gen_random_uuid(), now() - interval '10 days');
*/

-- ===================================================================
-- SUMMARY
-- ===================================================================

SELECT 
    'FINAL SUMMARY' as summary,
    (SELECT count(*) FROM public.profiles) as total_customers,
    (SELECT count(*) FROM public.products) as total_products,
    (SELECT count(*) FROM public.orders) as total_orders,
    (SELECT sum(total) FROM public.orders) as total_revenue;