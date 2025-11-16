-- ===================================================================
-- CLEANUP OLD SAMPLE DATA & ADD NEW 2025 DATA
-- Run this in Supabase Dashboard > SQL Editor
-- ===================================================================

-- Step 1: Remove old sample data (orders with 2001 or AUTO- pattern)
DO $$
DECLARE
    deleted_orders INTEGER;
    deleted_items INTEGER;
BEGIN
    -- Delete old order items first (foreign key dependency)
    DELETE FROM public.order_items 
    WHERE order_id IN (
        SELECT id FROM public.orders 
        WHERE order_number LIKE 'AUTO-%' 
        OR order_number LIKE '%2001%'
        OR shipping_address LIKE '%2001%'
    );
    
    GET DIAGNOSTICS deleted_items = ROW_COUNT;
    
    -- Delete old orders
    DELETE FROM public.orders 
    WHERE order_number LIKE 'AUTO-%' 
    OR order_number LIKE '%2001%'
    OR shipping_address LIKE '%2001%';
    
    GET DIAGNOSTICS deleted_orders = ROW_COUNT;
    
    RAISE NOTICE 'CLEANUP COMPLETE: Deleted % orders and % order items', deleted_orders, deleted_items;
END $$;

-- Step 2: Verify cleanup
SELECT 'Remaining orders after cleanup:' as info, count(*) as count FROM public.orders;
SELECT 'Remaining order items after cleanup:' as info, count(*) as count FROM public.order_items;

-- ===================================================================
-- Step 3: ADD NEW 2025 SAMPLE DATA
-- ===================================================================

DO $$
DECLARE
    sample_user_id UUID;
    product_ids UUID[] := ARRAY[]::UUID[];
    order_id_1 UUID := gen_random_uuid();
    order_id_2 UUID := gen_random_uuid();
    order_id_3 UUID := gen_random_uuid();
    order_id_4 UUID := gen_random_uuid();
    order_id_5 UUID := gen_random_uuid();
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
    
    RAISE NOTICE 'Creating new 2025 orders using user: %, Found % products', sample_user_id, array_length(product_ids, 1);
    
    -- Create NEW 2025 sample orders with realistic dates
    INSERT INTO public.orders (id, user_id, order_number, total, status, shipping_address, created_at) VALUES
    (order_id_1, sample_user_id, 'AUTO-2025-001', 1299.99, 'delivered', '123 Analytics Demo St, Mumbai 400001', now() - interval '12 days'),
    (order_id_2, sample_user_id, 'AUTO-2025-002', 2450.50, 'delivered', '123 Analytics Demo St, Mumbai 400001', now() - interval '9 days'),
    (order_id_3, sample_user_id, 'AUTO-2025-003', 899.99, 'delivered', '123 Analytics Demo St, Mumbai 400001', now() - interval '6 days'),
    (order_id_4, sample_user_id, 'AUTO-2025-004', 1750.00, 'processing', '123 Analytics Demo St, Mumbai 400001', now() - interval '3 days'),
    (order_id_5, sample_user_id, 'AUTO-2025-005', 3299.97, 'shipped', '123 Analytics Demo St, Mumbai 400001', now() - interval '1 day');

    -- Create order items using available products
    -- Order 1: Single premium item
    IF array_length(product_ids, 1) >= 1 THEN
        INSERT INTO public.order_items (order_id, product_id, quantity, price, created_at) VALUES
        (order_id_1, product_ids[1], 1, 1299.99, now() - interval '12 days');
    END IF;
    
    -- Order 2: Multiple items
    IF array_length(product_ids, 1) >= 2 THEN
        INSERT INTO public.order_items (order_id, product_id, quantity, price, created_at) VALUES
        (order_id_2, product_ids[1], 1, 1299.99, now() - interval '9 days'),
        (order_id_2, product_ids[2], 2, 575.26, now() - interval '9 days');
    END IF;
    
    -- Order 3: Single item
    IF array_length(product_ids, 1) >= 3 THEN
        INSERT INTO public.order_items (order_id, product_id, quantity, price, created_at) VALUES
        (order_id_3, product_ids[3], 1, 899.99, now() - interval '6 days');
    END IF;
    
    -- Order 4: Bulk order
    IF array_length(product_ids, 1) >= 4 THEN
        INSERT INTO public.order_items (order_id, product_id, quantity, price, created_at) VALUES
        (order_id_4, product_ids[2], 3, 583.33, now() - interval '3 days');
    END IF;
    
    -- Order 5: Mixed high-value order
    IF array_length(product_ids, 1) >= 5 THEN
        INSERT INTO public.order_items (order_id, product_id, quantity, price, created_at) VALUES
        (order_id_5, product_ids[1], 2, 1299.99, now() - interval '1 day'),
        (order_id_5, product_ids[5], 1, 699.99, now() - interval '1 day');
    END IF;
    
    RAISE NOTICE 'SUCCESS! Created NEW 2025 orders with IDs: %, %, %, %, %', 
        order_id_1, order_id_2, order_id_3, order_id_4, order_id_5;
    
    -- Show summary
    RAISE NOTICE 'Total NEW 2025 Revenue Created: ₹%.2f', 
        (SELECT sum(total) FROM public.orders WHERE order_number LIKE 'AUTO-2025-%');
        
END $$;

-- ===================================================================
-- VERIFICATION: Check the new 2025 data
-- ===================================================================

-- Check what was created
SELECT 
    'NEW 2025 ORDERS CREATED:' as summary,
    count(*) as total_orders,
    sum(total) as total_revenue,
    min(created_at) as earliest_order,
    max(created_at) as latest_order
FROM public.orders 
WHERE order_number LIKE 'AUTO-2025-%';

-- Show order details  
SELECT 
    o.order_number,
    o.total,
    o.status,
    o.created_at::date as order_date,
    count(oi.id) as items_count
FROM public.orders o
LEFT JOIN public.order_items oi ON oi.order_id = o.id
WHERE o.order_number LIKE 'AUTO-2025-%'
GROUP BY o.id, o.order_number, o.total, o.status, o.created_at
ORDER BY o.created_at DESC;

-- Show products sold
SELECT 
    p.name as product_name,
    p.category,
    sum(oi.quantity) as total_sold,
    sum(oi.quantity * oi.price) as total_revenue
FROM public.order_items oi
JOIN public.products p ON p.id = oi.product_id
JOIN public.orders o ON o.id = oi.order_id
WHERE o.order_number LIKE 'AUTO-2025-%'
GROUP BY p.id, p.name, p.category
ORDER BY total_revenue DESC;

-- Final summary for your dashboard
SELECT 
    'ANALYTICS READY WITH 2025 DATA! 🚀' as status,
    (SELECT count(*) FROM public.profiles) as total_customers,
    (SELECT count(*) FROM public.products) as total_products,
    (SELECT count(*) FROM public.orders) as total_orders,
    (SELECT COALESCE(sum(total), 0) FROM public.orders) as total_revenue,
    (SELECT count(*) FROM public.orders WHERE order_number LIKE 'AUTO-2025-%') as sample_2025_orders;

-- Check for any remaining old data
SELECT 'Checking for leftover old data...' as info;
SELECT 
    CASE 
        WHEN count(*) = 0 THEN 'SUCCESS: No old sample data found ✓'
        ELSE 'WARNING: Found ' || count(*) || ' old orders still remaining!'
    END as cleanup_status
FROM public.orders 
WHERE (order_number LIKE 'AUTO-%' AND order_number NOT LIKE 'AUTO-2025-%')
   OR order_number LIKE '%2001%'
   OR shipping_address LIKE '%2001%';

-- ===================================================================
-- WHAT TO DO NEXT:
-- 1. Copy this entire script
-- 2. Go to Supabase Dashboard > SQL Editor  
-- 3. Paste and click "RUN"
-- 4. This will:
--    - Remove old 2001/AUTO- data
--    - Add fresh 2025 sample data
--    - Verify everything worked
-- 5. Refresh your analytics page at http://localhost:8081/analytics
-- 6. See clean 2025 data! 🎉
-- ===================================================================