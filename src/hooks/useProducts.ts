// ...existing code up to the start of the correct logic...
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { mockProducts } from '@/data/mockData';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  images?: string[]; // Ensure `images` is optional
  category: string;
  stock: number;
  key_features?: string[]; // Ensure `key_features` is optional
  created_at?: string;
  updated_at?: string;
  discount_percent?: number | null; // optional discount percentage (0-100)
  original_price?: number | null; // store original price before discount
  rating?: number;
  reviews?: number;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // If no products in DB, use mock data as fallback
      if (!data || data.length === 0) {
        setProducts(mockProducts.map(p => ({
          ...p,
          image_url: p.image, // map mockData's image to image_url
          discount_percent: null, // ensure field present
          original_price: null, // ensure field present
          rating: p.rating ?? 0,
          reviews: p.reviews ?? 0,
        })));
      } else {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
      // On error, also fallback to mock data
      setProducts(mockProducts.map(p => ({
        ...p,
        image_url: p.image,
        discount_percent: null,
        original_price: null,
        rating: p.rating ?? 0,
        reviews: p.reviews ?? 0,
      })));
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          discount_percent: productData.discount_percent ?? null,
        }])
        .select()
        .single();

      if (error) throw error;
      
      setProducts(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const sanitizeNumber = (v: any, fallback: number | null = null) => {
        if (v === null || v === undefined || v === '') return fallback;
        const n = typeof v === 'number' ? v : parseFloat(v as any);
        return isNaN(n) ? fallback : n;
      };

      const updatePayload: Record<string, any> = {};

      if (productData.name !== undefined) updatePayload.name = productData.name;
      if (productData.description !== undefined) updatePayload.description = productData.description || null;
      if (productData.price !== undefined) {
        const price = sanitizeNumber(productData.price);
        if (price === null) throw new Error('Invalid price');
        updatePayload.price = price;
      }
      if (productData.image_url !== undefined) updatePayload.image_url = productData.image_url || null;
      if (productData.images !== undefined) {
        updatePayload.images = Array.isArray(productData.images)
          ? productData.images.map(String)
          : [];
      }
      if (productData.category !== undefined) updatePayload.category = productData.category;
      if (productData.stock !== undefined) {
        const s = sanitizeNumber(productData.stock, 0);
        updatePayload.stock = s ?? 0;
      }
      if (productData.key_features !== undefined) {
        updatePayload.key_features = Array.isArray(productData.key_features)
          ? productData.key_features.map(String)
          : [];
      }

      // Only add discount fields if they exist in database
      try {
        if (productData.discount_percent !== undefined) {
          const dp = sanitizeNumber(productData.discount_percent, null);
          if (dp !== null && (dp < 0 || dp > 100)) {
            throw new Error('Discount percent must be between 0 and 100');
          }
          updatePayload.discount_percent = dp;
          
          // Get current product to access its existing price/original_price
          const currentProduct = products.find(p => p.id === id);
          
          if (dp !== null && dp > 0) {
            // Applying discount
            if (currentProduct) {
              // If product already has original_price, use it; otherwise use current price
              const basePrice = currentProduct.original_price || currentProduct.price;
              updatePayload.original_price = basePrice;
              updatePayload.price = basePrice * (1 - dp / 100);
            } else if (productData.price !== undefined) {
              // New product scenario
              const originalPrice = sanitizeNumber(productData.price);
              if (originalPrice !== null) {
                updatePayload.original_price = originalPrice;
                updatePayload.price = originalPrice * (1 - dp / 100);
              }
            }
          } else if (dp === null || dp === 0) {
            // Removing discount
            if (currentProduct && currentProduct.original_price) {
              updatePayload.price = currentProduct.original_price;
              updatePayload.original_price = null;
            }
          }
        }
      } catch (discountError) {
        console.warn('Discount columns may not exist:', discountError);
        // Continue without discount if columns don't exist
        delete updatePayload.discount_percent;
        delete updatePayload.original_price;
      }

      console.log('[updateProduct] Final payload for id:', id, JSON.stringify(updatePayload, null, 2));

      const { data, error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[updateProduct] Supabase raw error:', {
          message: error.message,
          details: (error as any).details,
          hint: (error as any).hint,
          code: (error as any).code,
        });
        throw error;
      }

      setProducts(prev => prev.map(p => p.id === id ? data : p));
      fetchProducts();

      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      return { data, error: null };
    } catch (error: any) {
      console.error('[updateProduct] Caught error object:', error);
      toast({
        title: "Error",
        description: error?.message || error?.details || "Failed to update product.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      return { error: null };
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
}