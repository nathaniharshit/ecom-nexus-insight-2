import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductPerformanceData {
  topProducts: Array<{
    id: string;
    name: string;
    category: string;
    image?: string;
    revenue: number;
    units_sold: number;
    stock: number;
    profit_margin: number;
    rating: number;
    reviews: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  categoryPerformance: Array<{
    category: string;
    revenue: number;
    units_sold: number;
    products_count: number;
    avg_rating: number;
  }>;
  inventoryStatus: {
    low_stock_items: number;
    out_of_stock_items: number;
    total_products: number;
    total_inventory_value: number;
  };
  profitabilityData: Array<{
    product_name: string;
    revenue: number;
    profit_margin: number;
    units_sold: number;
  }>;
}

interface UseProductAnalyticsOptions {
  startDate: Date;
  endDate: Date;
}

export function useProductAnalytics({ startDate, endDate }: UseProductAnalyticsOptions) {
  const [data, setData] = useState<ProductPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch order items to calculate sales performance
      const { data: orderItems, error: orderItemsError } = await (supabase as any)
        .from('order_items')
        .select(`
          id,
          product_id,
          quantity,
          price,
          created_at,
          orders(id, created_at, status)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Calculate product performance metrics
      const productSalesMap = new Map<string, { units_sold: number; revenue: number; last_sale?: string }>();

      if (orderItemsError) {
        console.warn('Order items not available:', orderItemsError);
        // Use products without sales data
      } else {
        orderItems?.forEach((item: any) => {
          const productId = item.product_id;
          if (!productSalesMap.has(productId)) {
            productSalesMap.set(productId, { units_sold: 0, revenue: 0, last_sale: item.created_at });
          }
          const productData = productSalesMap.get(productId)!;
          productData.units_sold += Number(item.quantity || 0);
          productData.revenue += Number(item.quantity || 0) * Number(item.price || 0);
          
          if (item.created_at && (!productData.last_sale || new Date(item.created_at) > new Date(productData.last_sale))) {
            productData.last_sale = item.created_at;
          }
        });
      }

      // Build top products with performance data
      const topProducts = (products || []).map((product: any) => {
        const salesData = productSalesMap.get(product.id) || { units_sold: 0, revenue: 0 };
        const stock = Number(product.stock || 0);
        
        // Calculate profit margin (simplified - using 20-40% based on category)
        const baseProfitMargin = product.category === 'Electronics' ? 25 : 
                               product.category === 'Footwear' ? 30 : 
                               product.category === 'Clothing' ? 35 : 20;
        
        const profit_margin = baseProfitMargin + (Math.random() * 20 - 10); // Add some variance
        
        // Calculate rating (mock for now - you can add reviews table later)
        const rating = 4.0 + Math.random() * 1.0;
        const reviews = Math.floor(Math.random() * 200) + 10;
        
        // Determine trend based on recent sales
        const trend = salesData.units_sold > 10 ? 'up' : 
                     salesData.units_sold > 0 ? 'stable' : 'down';

        return {
          id: product.id,
          name: product.name || 'Unnamed Product',
          category: product.category || 'Uncategorized',
          image: product.image_url,
          revenue: salesData.revenue,
          units_sold: salesData.units_sold,
          stock,
          profit_margin: Math.round(profit_margin * 100) / 100,
          rating: Math.round(rating * 10) / 10,
          reviews,
          trend: trend as 'up' | 'down' | 'stable'
        };
      }).sort((a, b) => b.revenue - a.revenue);

      // Calculate category performance
      const categoryMap = new Map<string, {
        revenue: number;
        units_sold: number;
        products: Set<string>;
        total_rating: number;
        rating_count: number;
      }>();

      topProducts.forEach(product => {
        const category = product.category;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            revenue: 0,
            units_sold: 0,
            products: new Set(),
            total_rating: 0,
            rating_count: 0
          });
        }
        const catData = categoryMap.get(category)!;
        catData.revenue += product.revenue;
        catData.units_sold += product.units_sold;
        catData.products.add(product.id);
        catData.total_rating += product.rating;
        catData.rating_count += 1;
      });

      const categoryPerformance = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        revenue: data.revenue,
        units_sold: data.units_sold,
        products_count: data.products.size,
        avg_rating: data.rating_count > 0 ? data.total_rating / data.rating_count : 0
      }));

      // Calculate inventory status
      const inventoryStatus = {
        total_products: products?.length || 0,
        low_stock_items: topProducts.filter(p => p.stock > 0 && p.stock < 10).length,
        out_of_stock_items: topProducts.filter(p => p.stock === 0).length,
        total_inventory_value: topProducts.reduce((sum, p) => sum + (p.stock * (p.revenue / Math.max(p.units_sold, 1))), 0)
      };

      // Create profitability data for scatter plot
      const profitabilityData = topProducts
        .filter(p => p.revenue > 0 || p.units_sold > 0)
        .map(p => ({
          product_name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
          revenue: p.revenue,
          profit_margin: p.profit_margin,
          units_sold: p.units_sold
        }));

      const result: ProductPerformanceData = {
        topProducts: topProducts.slice(0, 20), // Limit to top 20
        categoryPerformance,
        inventoryStatus,
        profitabilityData
      };

      setData(result);
    } catch (e: any) {
      console.error('[useProductAnalytics] Error:', e);
      setError(e.message || 'Failed to load product analytics');
      
      // Provide fallback data on error
      setData({
        topProducts: [],
        categoryPerformance: [],
        inventoryStatus: {
          low_stock_items: 0,
          out_of_stock_items: 0,
          total_products: 0,
          total_inventory_value: 0
        },
        profitabilityData: []
      });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  return { data, loading, error, refetch: fetchProductData };
}