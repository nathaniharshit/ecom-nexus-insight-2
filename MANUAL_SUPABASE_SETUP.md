# Manual Supabase Setup - Orders Tables

Since the CLI is running into permissions issues, here's the manual approach to create the required tables.

## Step 1: Open Supabase Dashboard SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project: `sdhresijqxdgxgifkqgn`
3. Navigate to: **SQL Editor** (in the left sidebar)

## Step 2: Create the timestamp trigger function (if it doesn't exist)

First, run this to create the trigger function (if it's missing):

```sql
-- Create timestamp update function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';
```

## Step 3: Create orders and order_items tables

Copy and paste this complete SQL into the SQL Editor and run it:

```sql
-- Create orders table for tracking user purchases
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  order_number TEXT NOT NULL UNIQUE,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address TEXT NOT NULL,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table for individual items in an order
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for order items
CREATE POLICY "Users can view their own order items" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
BEFORE UPDATE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

## Step 4: Verify tables were created

After running the SQL:

1. Go to **Table Editor** in the dashboard
2. You should see `orders` and `order_items` tables
3. Click on each table to verify the columns are correct

## Step 5: Test your app

1. Reload your Analytics page
2. The "relation 'public.orders' does not exist" error should be gone
3. You should see zero metrics (expected since no orders exist yet)

## Step 6: Create test data (optional)

To see real analytics, insert some test orders:

```sql
-- Insert a test order (replace <user-id> with a real user_id from profiles table)
INSERT INTO public.orders (user_id, order_number, total, status, shipping_address)
VALUES ('<user-id>', 'ORD-1001', 199.99, 'processing', '123 Test Street');

-- Insert order items (replace <order-id> and <product-id> with real IDs)
INSERT INTO public.order_items (order_id, product_id, quantity, price)
VALUES ('<order-id>', '<product-id>', 2, 99.99);
```

## Success indicators

✅ Tables created without errors  
✅ Analytics page loads without "relation does not exist"  
✅ KPIs show zeros (expected with no orders)  
✅ After adding test orders: KPIs show real data  

## Next steps

After the tables are working:
- I can regenerate Supabase types to remove the `(supabase as any)` casts
- Add charts and visualizations to the Analytics page
- Implement trend comparisons (previous period data)