-- ===================================================================
-- COMPLETE DATABASE RESET & 2025 DATA CREATION
-- This will completely remove ALL sample data and create fresh 2025 data
-- ===================================================================

-- PHASE 1: COMPLETE CLEANUP (Remove ALL potentially old data)
DO $$
BEGIN
    -- Delete ALL order items first (foreign key constraint)
    DELETE FROM public.order_items 
    WHERE order_id IN (
        SELECT id FROM public.orders 
        WHERE order_number LIKE 'AUTO-%' 
        OR order_number LIKE '%2001%' 
        OR order_number LIKE '%2024%'
        OR created_at < '2025-01-01'
    );
    
    -- Delete ALL orders that might be sample data
    DELETE FROM public.orders 
    WHERE order_number LIKE 'AUTO-%' 
    OR order_number LIKE '%2001%' 
    OR order_number LIKE '%2024%'
    OR created_at < '2025-01-01'
    OR shipping_address LIKE '%Analytics Demo%'
    OR shipping_address LIKE '%Mumbai%';
    
    -- Also clean any test products that might have been created
    DELETE FROM public.products 
    WHERE name LIKE '%Test%' 
    OR name LIKE '%Sample%' 
    OR name LIKE '%Demo%'
    OR description LIKE '%sample%';
    
    RAISE NOTICE 'CLEANUP COMPLETE: All old sample data removed';
END $$;

-- PHASE 2: VERIFY CLEANUP
SELECT 
    'CLEANUP VERIFICATION' as status,
    (SELECT count(*) FROM public.orders) as remaining_orders,
    (SELECT count(*) FROM public.order_items) as remaining_order_items,
    (SELECT count(*) FROM public.products) as total_products,
    (SELECT count(*) FROM public.profiles) as total_users;

-- PHASE 3: CREATE FRESH 2025 SAMPLE DATA
DO $$
DECLARE
    sample_user_id UUID;
    product_ids UUID[] := ARRAY[]::UUID[];
    order_id_1 UUID := gen_random_uuid();
    order_id_2 UUID := gen_random_uuid();
    order_id_3 UUID := gen_random_uuid();
    order_id_4 UUID := gen_random_uuid();
    order_id_5 UUID := gen_random_uuid();
    current_date_base TIMESTAMP := '2025-11-17 10:00:00'::TIMESTAMP;
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
    
    RAISE NOTICE 'Creating fresh 2025 data with user: %, products: %', sample_user_id, array_length(product_ids, 1);
    
    -- Create sample orders with EXPLICIT 2025 NOVEMBER dates
    INSERT INTO public.orders (id, user_id, order_number, total, status, shipping_address, created_at) VALUES
    (order_id_1, sample_user_id, 'FRESH-2025-001', 1299.99, 'delivered', '456 Fresh Demo Lane, Delhi 110001', current_date_base - interval '12 days'),
    (order_id_2, sample_user_id, 'FRESH-2025-002', 2450.50, 'delivered', '456 Fresh Demo Lane, Delhi 110001', current_date_base - interval '9 days'),
    (order_id_3, sample_user_id, 'FRESH-2025-003', 899.99, 'delivered', '456 Fresh Demo Lane, Delhi 110001', current_date_base - interval '6 days'),
    (order_id_4, sample_user_id, 'FRESH-2025-004', 1750.00, 'processing', '456 Fresh Demo Lane, Delhi 110001', current_date_base - interval '3 days'),
    (order_id_5, sample_user_id, 'FRESH-2025-005', 3299.97, 'shipped', '456 Fresh Demo Lane, Delhi 110001', current_date_base - interval '1 day');

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
    
    RAISE NOTICE 'SUCCESS! Created 5 fresh orders for November 2025';
    
END $$;

-- PHASE 4: VERIFICATION & SUMMARY
SELECT 
    'FRESH DATA CREATED' as status,
    count(*) as total_orders,
    sum(total) as total_revenue,
    min(created_at) as earliest_order,
    max(created_at) as latest_order
FROM public.orders 
WHERE order_number LIKE 'FRESH-2025-%';

-- Show the fresh order details with EXPLICIT dates
SELECT 
    o.order_number,
    o.total,
    o.status,
    o.created_at as full_timestamp,
    o.created_at::date as order_date,
    EXTRACT(year FROM o.created_at) as year,
    EXTRACT(month FROM o.created_at) as month
FROM public.orders o
WHERE o.order_number LIKE 'FRESH-2025-%'
ORDER BY o.created_at DESC;

-- PHASE 5: CHECK FOR ANY REMAINING OLD DATA
SELECT 
    'OLD DATA CHECK' as check_type,
    count(*) as count,
    'These should be ZERO' as note
FROM public.orders 
WHERE created_at < '2025-01-01'
UNION ALL
SELECT 
    'ORDERS WITH 2001 REFERENCES' as check_type,
    count(*) as count,
    'These should be ZERO' as note
FROM public.orders 
WHERE order_number LIKE '%2001%'
UNION ALL
SELECT 
    'TOTAL ORDERS NOW' as check_type,
    count(*) as count,
    'Should only be fresh 2025 data' as note
FROM public.orders;

-- ===================================================================
-- INSTRUCTIONS:
-- 1. Copy this ENTIRE script
-- 2. Go to Supabase Dashboard > SQL Editor
-- 3. Paste and click RUN
-- 4. Wait for all phases to complete
-- 5. Check verification results - old data count should be 0
-- 6. Refresh your analytics at http://localhost:8081/analytics
-- ===================================================================