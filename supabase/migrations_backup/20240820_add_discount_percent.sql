-- Add discount functionality columns
alter table products
  add column if not exists discount_percent numeric check (discount_percent >= 0 and discount_percent <= 100);

alter table products  
  add column if not exists original_price numeric;

-- Optional: backfill nulls (no action needed if new)
-- update products set discount_percent = 0 where discount_percent is null;
