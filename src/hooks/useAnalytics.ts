import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SalesPoint {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category?: string;
  image?: string;
  sales: number;
  revenue: number;
  stock?: number;
  conversion_rate?: number;
}

export interface SalesByCategory {
  name: string;
  value: number;
}

export interface AnalyticsState {
  kpis: {
    revenue: number;
    orders: number;
    avgOrderValue: number;
    customers: number;
    conversionRate: number;
    refunds: number;
  };
  trend: {
    revenueDeltaPct: number;
    ordersDeltaPct: number;
    aovDeltaPct: number;
    customersDeltaPct: number;
  };
  salesSeries: SalesPoint[];
  topProducts: TopProduct[];
  salesByCategory: SalesByCategory[];
}

interface UseAnalyticsOptions {
  startDate: Date;
  endDate: Date;
  compare?: boolean;
}

const cache: Record<string, AnalyticsState> = {};

export function useAnalytics({ startDate, endDate, compare = true }: UseAnalyticsOptions) {
  const [data, setData] = useState<AnalyticsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = `${startDate.toISOString()}_${endDate.toISOString()}_${compare}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (cache[key]) {
      setData(cache[key]);
      setLoading(false);
      return;
    }

    try {
      // First, get platform-wide metrics (total products and customers)
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id,name,price,category,image_url,stock');
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id,created_at');

      if (productsError) console.warn('Products query failed:', productsError);
      if (profilesError) console.warn('Profiles query failed:', profilesError);

      const totalProducts = (products || []).length;
      const totalRegisteredCustomers = (profiles || []).length;
      // Query orders within date range
      const fromIso = new Date(startDate).toISOString();
      // include the end of day for the endDate
      const toIso = new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString();

      const { data: orders, error: ordersError } = await (supabase as any)
        .from('orders')
        .select('id,user_id,total,created_at')
        .gte('created_at', fromIso)
        .lte('created_at', toIso);

      if (ordersError) {
        // Detect missing table error and surface a clearer message
        if (String(ordersError.message).includes('does not exist')) {
          throw new Error('Orders table not found. Apply migrations to create public.orders and public.order_items.');
        }
        throw ordersError;
      }

      // Fetch related order_items with product info for the same range
      const { data: items, error: itemsError } = await (supabase as any)
        .from('order_items')
        .select('id,order_id,product_id,quantity,price,created_at,products(id,name,category,image_url)')
        .in('order_id', (orders ?? []).map((o: any) => o.id));

      if (itemsError) {
        if (String(itemsError.message).includes('does not exist')) {
          throw new Error('Order items table not found. Apply migrations to create public.order_items.');
        }
        throw itemsError;
      }

      // Build salesSeries by day
      const dayCount = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
      const salesSeriesMap: Record<string, { revenue: number; orders: Set<string>; customers: Set<string> }> = {};
      for (let i = 0; i < dayCount; i++) {
        const d = new Date(startDate.getTime() + i * 86400000);
        const keyDay = d.toISOString().split('T')[0];
        salesSeriesMap[keyDay] = { revenue: 0, orders: new Set(), customers: new Set() };
      }

      // Aggregate from orders and items
      const ordersById: Record<string, any> = {};
      (orders ?? []).forEach((o: any) => {
        const day = new Date(o.created_at).toISOString().split('T')[0];
        if (!salesSeriesMap[day]) salesSeriesMap[day] = { revenue: 0, orders: new Set(), customers: new Set() };
        salesSeriesMap[day].revenue += Number(o.total ?? 0);
        salesSeriesMap[day].orders.add(o.id);
        if (o.user_id) salesSeriesMap[day].customers.add(o.user_id);
        ordersById[o.id] = o;
      });

      // If there are items, sum product-level metrics
      const productAgg: Record<string, { id: string; name: string; category?: string; image?: string; sales: number; revenue: number }> = {};
      (items ?? []).forEach((it: any) => {
        const prod = it.products ?? it.product ?? null;
        const prodId = it.product_id ?? prod?.id ?? 'unknown';
        if (!productAgg[prodId]) {
          productAgg[prodId] = { id: prodId, name: prod?.name ?? prodId, category: prod?.category, image: prod?.image_url ?? prod?.image, sales: 0, revenue: 0 };
        }
        const qty = Number(it.quantity ?? 0);
        const price = Number(it.price ?? 0);
        productAgg[prodId].sales += qty;
        productAgg[prodId].revenue += qty * price;

        // attribute item revenue to day based on order
        const order = ordersById[it.order_id];
        const day = order ? new Date(order.created_at).toISOString().split('T')[0] : new Date(it.created_at).toISOString().split('T')[0];
        if (!salesSeriesMap[day]) salesSeriesMap[day] = { revenue: 0, orders: new Set(), customers: new Set() };
        salesSeriesMap[day].revenue += qty * price;
        if (order) salesSeriesMap[day].orders.add(order.id);
        if (order?.user_id) salesSeriesMap[day].customers.add(order.user_id);
      });

      const salesSeries: SalesPoint[] = Object.keys(salesSeriesMap)
        .sort()
        .map((d) => ({ date: d, revenue: +salesSeriesMap[d].revenue.toFixed(2), orders: salesSeriesMap[d].orders.size, customers: salesSeriesMap[d].customers.size }));

      const totalRevenue = salesSeries.reduce((a, b) => a + b.revenue, 0);
      const totalOrders = salesSeries.reduce((a, b) => a + b.orders, 0);
      const orderingCustomers = salesSeries.reduce((a, b) => a + b.customers, 0);
      const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
      const refunds = +(totalRevenue * 0.02).toFixed(2);

      // Trend placeholder: compute simple pct change vs previous period (not implemented fully here)
      const trend = {
        revenueDeltaPct: 0,
        ordersDeltaPct: 0,
        aovDeltaPct: 0,
        customersDeltaPct: 0,
      };

      const topProducts: TopProduct[] = Object.values(productAgg)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6)
        .map((p) => ({ id: p.id, name: p.name, category: p.category, image: p.image, sales: p.sales, revenue: +p.revenue.toFixed(2) } as TopProduct));

      const salesByCategoryMap: Record<string, number> = {};
      Object.values(productAgg).forEach((p) => {
        const cat = p.category ?? 'Uncategorized';
        salesByCategoryMap[cat] = (salesByCategoryMap[cat] || 0) + p.revenue;
      });
      const salesByCategory: SalesByCategory[] = Object.keys(salesByCategoryMap).map((k) => ({ name: k, value: Math.round(salesByCategoryMap[k]) }));

      const result: AnalyticsState = {
        kpis: {
          revenue: +totalRevenue.toFixed(2),
          orders: totalOrders,
          avgOrderValue: +avgOrderValue.toFixed(2),
          customers: totalRegisteredCustomers, // Show total registered customers, not just ordering ones
          conversionRate: +(totalRegisteredCustomers ? (orderingCustomers / totalRegisteredCustomers * 100).toFixed(2) : '0'),
          refunds,
        },
        trend,
        salesSeries,
        topProducts,
        salesByCategory,
      };

      cache[key] = result;
      setData(result);
    } catch (e: any) {
      console.error('[useAnalytics] Supabase query failed:', e);
      const msg = e.message || 'Failed to load analytics data from Supabase';
      setError(msg);

      // Lightweight fallback: derive minimal metrics from products if orders tables are missing
      if (msg.includes('Orders table not found') || msg.includes('Order items table not found')) {
        try {
          const { data: products, error: productsError } = await supabase.from('products').select('id,price,category');
          if (productsError) throw productsError;
          const count = (products || []).length;
          const revenueEstimate = (products || []).reduce((sum: number, p: any) => sum + Number(p.price || 0), 0);
          const byCategory: Record<string, number> = {};
          (products || []).forEach((p: any) => {
            const cat = p.category || 'Uncategorized';
            byCategory[cat] = (byCategory[cat] || 0) + Number(p.price || 0);
          });
          const salesByCategory: SalesByCategory[] = Object.keys(byCategory).map((c) => ({ name: c, value: Math.round(byCategory[c]) }));
          const fallback: AnalyticsState = {
            kpis: {
              revenue: +revenueEstimate.toFixed(2),
              orders: 0,
              avgOrderValue: 0,
              customers: 0,
              conversionRate: 0,
              refunds: 0,
            },
            trend: { revenueDeltaPct: 0, ordersDeltaPct: 0, aovDeltaPct: 0, customersDeltaPct: 0 },
            salesSeries: [],
            topProducts: (products || []).slice(0, 6).map((p: any) => ({ id: p.id, name: p.id, sales: 0, revenue: Number(p.price || 0), category: p.category, image: undefined })),
            salesByCategory,
          };
          setData(fallback);
          return;
        } catch (prodErr: any) {
          console.error('[useAnalytics] Fallback products query failed:', prodErr);
        }
      }

      // Provide empty structure when no fallback populated.
      setData({
        kpis: { revenue: 0, orders: 0, avgOrderValue: 0, customers: 0, conversionRate: 0, refunds: 0 },
        trend: { revenueDeltaPct: 0, ordersDeltaPct: 0, aovDeltaPct: 0, customersDeltaPct: 0 },
        salesSeries: [],
        topProducts: [],
        salesByCategory: [],
      });
    } finally {
      setLoading(false);
    }
  }, [key, startDate, endDate, compare]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
