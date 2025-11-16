-- Add support for multiple images in products table
ALTER TABLE public.products 
ADD COLUMN images TEXT[];