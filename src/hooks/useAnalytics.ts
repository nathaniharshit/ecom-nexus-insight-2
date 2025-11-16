import { useEffect, useState, useCallback } from 'react';
// Replace with your Supabase client import if available:
// import { supabase } from '../../supabase/client';

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
      // Mock / Replace with real Supabase RPC or queries
      // const { data: rows, error: dbError } = await supabase.rpc('get_analytics', { from: startDate, to: endDate });
      // if (dbError) throw dbError;

      // Mock generator
      const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
      const salesSeries: SalesPoint[] = Array.from({ length: days }).map((_, i) => {
        const d = new Date(startDate.getTime() + i * 86400000);
        return {
          date: d.toISOString().split('T')[0],
            revenue: +(Math.random() * 5000 + 3000).toFixed(2),
            orders: Math.floor(Math.random() * 90 + 40),
            customers: Math.floor(Math.random() * 60 + 25)
        };
      });

      const totalRevenue = salesSeries.reduce((a, b) => a + b.revenue, 0);
      const totalOrders = salesSeries.reduce((a, b) => a + b.orders, 0);
      const totalCustomers = salesSeries.reduce((a, b) => a + b.customers, 0);
      const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
      const conversionRate = +(Math.random() * (3.5 - 1.2) + 1.2).toFixed(2);
      const refunds = +(totalRevenue * 0.02).toFixed(2);

      // Comparison mock
      const trend = {
        revenueDeltaPct: +(Math.random() * 20 - 5).toFixed(2),
        ordersDeltaPct: +(Math.random() * 20 - 5).toFixed(2),
        aovDeltaPct: +(Math.random() * 15 - 4).toFixed(2),
        customersDeltaPct: +(Math.random() * 25 - 6).toFixed(2)
      };

      const topProducts: TopProduct[] = Array.from({ length: 6 }).map((_, i) => ({
        id: `prod_${i}`,
        name: `Product ${i + 1}`,
        category: ['Electronics', 'Fashion', 'Home'][i % 3],
        image: '/placeholder.svg',
        sales: Math.floor(Math.random() * 500 + 120),
        revenue: +(Math.random() * 8000 + 2500).toFixed(2),
        stock: Math.floor(Math.random() * 90 + 10),
        conversion_rate: +(Math.random() * (5 - 1.5) + 1.5).toFixed(2)
      }));

      const salesByCategory: SalesByCategory[] = [
        { name: 'Electronics', value: Math.floor(Math.random() * 40000 + 20000) },
        { name: 'Fashion', value: Math.floor(Math.random() * 30000 + 15000) },
        { name: 'Home & Garden', value: Math.floor(Math.random() * 25000 + 10000) },
        { name: 'Books', value: Math.floor(Math.random() * 15000 + 5000) },
        { name: 'Sports', value: Math.floor(Math.random() * 10000 + 5000) },
      ];

      const result: AnalyticsState = {
        kpis: {
          revenue: +totalRevenue.toFixed(2),
          orders: totalOrders,
          avgOrderValue: +avgOrderValue.toFixed(2),
          customers: totalCustomers,
          conversionRate,
          refunds
        },
        trend,
        salesSeries,
        topProducts,
        salesByCategory,
      };

      cache[key] = result;
      setData(result);
    } catch (e: any) {
      setError(e.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [key, startDate, endDate, compare]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
