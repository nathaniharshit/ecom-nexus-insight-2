-- Add key_features column to products table
ALTER TABLE public.products 
ADD COLUMN key_features TEXT[];