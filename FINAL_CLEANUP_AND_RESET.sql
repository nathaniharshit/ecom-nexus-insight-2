-- ===================================================================
-- FINAL COMPLETE DATABASE RESET & 2025 DATA CREATION
-- This will remove ALL existing sample data including FRESH-2025 orders
-- ===================================================================

-- PHASE 1: NUCLEAR CLEANUP - Remove EVERYTHING that looks like sample data
DO $$
BEGIN
    -- Delete ALL order items first (foreign key constraint)
    DELETE FROM public.order_items 
    WHERE order_id IN (
        SELECT id FROM public.orders 
        WHERE order_number LIKE 'AUTO-%' 
        OR order_number LIKE 'FRESH-%'
        OR order_number LIKE '%2001%' 
        OR order_number LIKE '%2024%'
        OR order_number LIKE '%2025%'
        OR created_at < '2025-01-01'
        OR shipping_address LIKE '%Demo%'
        OR shipping_address LIKE '%Analytics%'
        OR shipping_address LIKE '%Mumbai%'
        OR shipping_address LIKE '%Delhi%'
    );
    
    -- Delete ALL orders that might be sample data
    DELETE FROM public.orders 
    WHERE order_number LIKE 'AUTO-%' 
    OR order_number LIKE 'FRESH-%'
    OR order_number LIKE '%2001%' 
    OR order_number LIKE '%2024%'
    OR order_number LIKE '%2025%'
    OR created_at < '2025-01-01'
    OR shipping_address LIKE '%Demo%'
    OR shipping_address LIKE '%Analytics%'
    OR shipping_address LIKE '%Mumbai%'
    OR shipping_address LIKE '%Delhi%';
    
    -- Clean any test products that might have been created
    DELETE FROM public.products 
    WHERE name LIKE '%Test%' 
    OR name LIKE '%Sample%' 
    OR name LIKE '%Demo%'
    OR description LIKE '%sample%';
    
    RAISE NOTICE 'NUCLEAR CLEANUP COMPLETE: All sample data removed including FRESH-2025 orders';
END $$;

-- PHASE 2: VERIFY COMPLETE CLEANUP
SELECT 
    'COMPLETE CLEANUP VERIFICATION' as status,
    (SELECT count(*) FROM public.orders) as remaining_orders,
    (SELECT count(*) FROM public.order_items) as remaining_order_items,
    (SELECT count(*) FROM public.products) as total_products,
    (SELECT count(*) FROM public.profiles) as total_users;

-- PHASE 3: CREATE BRAND NEW 2025 SAMPLE DATA WITH UNIQUE NAMES
DO $$
DECLARE
    sample_user_id UUID;
    product_ids UUID[] := ARRAY[]::UUID[];
    order_id_1 UUID := gen_random_uuid();
    order_id_2 UUID := gen_random_uuid();
    order_id_3 UUID := gen_random_uuid();
    order_id_4 UUID := gen_random_uuid();
    order_id_5 UUID := gen_random_uuid();
    current_date_base TIMESTAMP := '2025-11-17 14:30:00'::TIMESTAMP;
    random_suffix TEXT := LPAD((FLOOR(RANDOM() * 10000))::TEXT, 4, '0');
BEGIN
    -- Get the first available user
    SELECT user_id INTO sample_user_id 
    FROM public.profiles 
    ORDER BY created_at 
    LIMIT 1;
    
    -- Get available product IDs
    SELECT ARRAY(SELECT id FROM public.products ORDER BY created_at LIMIT 6) 
    INTO product_ids;
    
    -- Check if we have data to work with
    IF sample_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found in profiles table. Please create a user first.';
    END IF;
    
    IF array_length(product_ids, 1) = 0 THEN
        RAISE EXCEPTION 'No products found in products table. Please create products first.';
    END IF;
    
    RAISE NOTICE 'Creating brand new 2025 data with user: %, products: %, suffix: %', sample_user_id, array_length(product_ids, 1), random_suffix;
    
    -- Create sample orders with UNIQUE order numbers using random suffix
    INSERT INTO public.orders (id, user_id, order_number, total, status, shipping_address, created_at) VALUES
    (order_id_1, sample_user_id, 'NEW-2025-' || random_suffix || '-A', 1299.99, 'delivered', '789 Analytics Street, Bangalore 560001', current_date_base - interval '12 days'),
    (order_id_2, sample_user_id, 'NEW-2025-' || random_suffix || '-B', 2450.50, 'delivered', '789 Analytics Street, Bangalore 560001', current_date_base - interval '9 days'),
    (order_id_3, sample_user_id, 'NEW-2025-' || random_suffix || '-C', 899.99, 'delivered', '789 Analytics Street, Bangalore 560001', current_date_base - interval '6 days'),
    (order_id_4, sample_user_id, 'NEW-2025-' || random_suffix || '-D', 1750.00, 'processing', '789 Analytics Street, Bangalore 560001', current_date_base - interval '3 days'),
    (order_id_5, sample_user_id, 'NEW-2025-' || random_suffix || '-E', 3299.97, 'shipped', '789 Analytics Street, Bangalore 560001', current_date_base - interval '1 day');

    -- Create order items using available products
    IF array_length(product_ids, 1) >= 1 THEN
        INSERT INTO public.order_items (order_id, product_id, quantity, price, created_at) VALUES
        (order_id_1, product_ids[1], 1, 1299.99, current_date_base - interval '12 days');
    END IF;
    
    IF array_length(product_ids, 1) >= 2 THEN
        INSERT INTO public.order_items (order_id, product_id, quantity, price, created_at) VALUES
        (order_id_2, product_ids[1], 1, 1299.99, current_date_base - interval '9 days'),
        (order_id_2, product_ids[2], 2, 575.26, current_date_base - interval '9 days');
    END IF;
    
    IF array_length(product_ids, 1) >= 3 THEN
        INSERT INTO public.order_items (order_id, product_id, quantity, price, created_at) VALUES
        (order_id_3, product_ids[3], 1, 899.99, current_date_base - interval '6 days');
    END IF;
    
    IF array_length(product_ids, 1) >= 4 THEN
        INSERT INTO public.order_items (order_id, product_id, quantity, price, created_at) VALUES
        (order_id_4, product_ids[2], 3, 583.33, current_date_base - interval '3 days');
    END IF;
    
    IF array_length(product_ids, 1) >= 5 THEN
        INSERT INTO public.order_items (order_id, product_id, quantity, price, created_at) VALUES
        (order_id_5, product_ids[1], 2, 1299.99, current_date_base - interval '1 day'),
        (order_id_5, product_ids[5], 1, 699.99, current_date_base - interval '1 day');
    END IF;
    
    RAISE NOTICE 'SUCCESS! Created 5 NEW orders for November 2025 with suffix: %', random_suffix;
    
END $$;

-- PHASE 4: VERIFICATION & SUMMARY OF NEW DATA
SELECT 
    'NEW 2025 DATA CREATED' as status,
    count(*) as total_orders,
    sum(total) as total_revenue,
    min(created_at) as earliest_order,
    max(created_at) as latest_order
FROM public.orders 
WHERE order_number LIKE 'NEW-2025-%';

-- Show the NEW order details with EXPLICIT dates
SELECT 
    o.order_number,
    o.total,
    o.status,
    o.created_at as full_timestamp,
    o.created_at::date as order_date,
    EXTRACT(year FROM o.created_at) as year,
    EXTRACT(month FROM o.created_at) as month,
    EXTRACT(day FROM o.created_at) as day
FROM public.orders o
WHERE o.order_number LIKE 'NEW-2025-%'
ORDER BY o.created_at DESC;

-- PHASE 5: FINAL VERIFICATION - CHECK FOR ANY OLD DATA
SELECT 
    'OLD DATA FINAL CHECK' as check_type,
    count(*) as count,
    'These should ALL be ZERO' as note
FROM public.orders 
WHERE created_at < '2025-01-01'
UNION ALL
SELECT 
    'AUTO ORDERS' as check_type,
    count(*) as count,
    'These should ALL be ZERO' as note
FROM public.orders 
WHERE order_number LIKE 'AUTO-%'
UNION ALL
SELECT 
    'FRESH ORDERS' as check_type,
    count(*) as count,
    'These should ALL be ZERO' as note
FROM public.orders 
WHERE order_number LIKE 'FRESH-%'
UNION ALL
SELECT 
    'NEW 2025 ORDERS' as check_type,
    count(*) as count,
    'Should be exactly 5' as note
FROM public.orders 
WHERE order_number LIKE 'NEW-2025-%'
UNION ALL
SELECT 
    'TOTAL ORDERS' as check_type,
    count(*) as count,
    'Total orders in database' as note
FROM public.orders;

-- PHASE 6: SHOW EXACT DATES FOR DEBUGGING
SELECT 
    'DATE DEBUGGING' as info,
    o.order_number,
    o.created_at,
    to_char(o.created_at, 'YYYY-MM-DD HH24:MI:SS') as formatted_date,
    AGE(NOW(), o.created_at) as age_from_now
FROM public.orders o
WHERE o.order_number LIKE 'NEW-2025-%'
ORDER BY o.created_at DESC;

-- ===================================================================
-- INSTRUCTIONS:
-- 1. Copy this ENTIRE script
-- 2. Go to Supabase Dashboard > SQL Editor  
-- 3. Paste and click RUN
-- 4. Wait for ALL phases to complete
-- 5. Check that NEW-2025 orders count is 5 and all old orders are 0
-- 6. Refresh analytics at http://localhost:8081/analytics
-- 7. You should now see November 2025 data!
-- ===================================================================