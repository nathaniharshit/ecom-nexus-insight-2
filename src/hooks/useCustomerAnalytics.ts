import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerData {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerGrowth: number;
  topCustomers: Array<{
    id: string;
    name: string;
    orders: number;
    totalSpent: number;
    lastOrder: string;
    segment: 'VIP' | 'Regular' | 'New';
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  acquisitionData: Array<{
    date: string;
    newCustomers: number;
    returningCustomers: number;
  }>;
}

interface UseCustomerAnalyticsOptions {
  startDate: Date;
  endDate: Date;
}

export function useCustomerAnalytics({ startDate, endDate }: UseCustomerAnalyticsOptions) {
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all profiles (customers)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch orders with customer data
      const { data: orders, error: ordersError } = await (supabase as any)
        .from('orders')
        .select(`
          id,
          user_id,
          total,
          created_at,
          profiles(user_id, created_at)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.warn('Orders table not available:', ordersError);
        // Provide fallback data when orders table doesn't exist
        const totalCustomers = profiles?.length || 0;
        const currentMonth = new Date();
        currentMonth.setDate(1);
        
        const newCustomersThisMonth = profiles?.filter(p => 
          new Date(p.created_at) >= currentMonth
        ).length || 0;

        const fallbackData: CustomerData = {
          totalCustomers,
          newCustomers: newCustomersThisMonth,
          returningCustomers: 0,
          customerGrowth: 0,
          topCustomers: [],
          customerSegments: [
            { segment: 'New', count: totalCustomers, percentage: 100, color: '#45B7D1' }
          ],
          acquisitionData: []
        };

        setData(fallbackData);
        setLoading(false);
        return;
      }

      // Calculate metrics
      const totalCustomers = profiles?.length || 0;
      const currentMonth = new Date();
      currentMonth.setDate(1);
      
      const newCustomersThisMonth = profiles?.filter(p => 
        new Date(p.created_at) >= currentMonth
      ).length || 0;

      // Calculate customer segments based on order history
      const customerOrderCounts = new Map<string, { orders: number; totalSpent: number; lastOrder: string }>();
      
      orders?.forEach(order => {
        const userId = order.user_id;
        if (!customerOrderCounts.has(userId)) {
          customerOrderCounts.set(userId, { orders: 0, totalSpent: 0, lastOrder: order.created_at });
        }
        const customer = customerOrderCounts.get(userId)!;
        customer.orders += 1;
        customer.totalSpent += Number(order.total || 0);
        if (new Date(order.created_at) > new Date(customer.lastOrder)) {
          customer.lastOrder = order.created_at;
        }
      });

      // Create top customers list
      const topCustomers = Array.from(customerOrderCounts.entries())
        .map(([userId, stats]) => ({
          id: userId,
          name: `Customer ${userId.slice(0, 8)}`, // You can enhance this with real names
          orders: stats.orders,
          totalSpent: stats.totalSpent,
          lastOrder: stats.lastOrder,
          segment: (stats.totalSpent > 50000 ? 'VIP' : 
                   stats.orders > 3 ? 'Regular' : 'New') as 'VIP' | 'Regular' | 'New'
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      // Calculate segments
      const vipCustomers = topCustomers.filter(c => c.segment === 'VIP').length;
      const regularCustomers = topCustomers.filter(c => c.segment === 'Regular').length;
      const newCustomers = topCustomers.filter(c => c.segment === 'New').length;
      const totalSegmented = Math.max(vipCustomers + regularCustomers + newCustomers, 1);

      const customerSegments = [
        { segment: 'VIP', count: vipCustomers, percentage: Math.round((vipCustomers / totalSegmented) * 100), color: '#FF6B6B' },
        { segment: 'Regular', count: regularCustomers, percentage: Math.round((regularCustomers / totalSegmented) * 100), color: '#4ECDC4' },
        { segment: 'New', count: newCustomers, percentage: Math.round((newCustomers / totalSegmented) * 100), color: '#45B7D1' }
      ];

      // Calculate acquisition data for the date range
      const acquisitionData = [];
      const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
      
      for (let i = 0; i < dayCount; i++) {
        const date = new Date(startDate.getTime() + i * 86400000);
        const dateStr = date.toISOString().split('T')[0];
        
        const newCustomersOnDay = profiles?.filter(p => 
          new Date(p.created_at).toISOString().split('T')[0] === dateStr
        ).length || 0;

        const returningCustomersOnDay = orders?.filter(order => {
          const orderDate = new Date(order.created_at).toISOString().split('T')[0];
          if (orderDate !== dateStr) return false;
          
          const customerFirstOrder = orders.filter(o => o.user_id === order.user_id)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
          
          return customerFirstOrder?.id !== order.id;
        }).length || 0;

        acquisitionData.push({
          date: dateStr,
          newCustomers: newCustomersOnDay,
          returningCustomers: returningCustomersOnDay
        });
      }

      // Calculate growth (simplified - comparing with previous month)
      const previousMonth = new Date(currentMonth);
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      
      const previousMonthCustomers = profiles?.filter(p => {
        const createDate = new Date(p.created_at);
        return createDate >= previousMonth && createDate < currentMonth;
      }).length || 0;

      const customerGrowth = previousMonthCustomers > 0 
        ? ((newCustomersThisMonth - previousMonthCustomers) / previousMonthCustomers) * 100 
        : 0;

      const returningCustomers = customerOrderCounts.size;

      const result: CustomerData = {
        totalCustomers,
        newCustomers: newCustomersThisMonth,
        returningCustomers,
        customerGrowth,
        topCustomers,
        customerSegments,
        acquisitionData
      };

      setData(result);
    } catch (e: any) {
      console.error('[useCustomerAnalytics] Error:', e);
      setError(e.message || 'Failed to load customer analytics');
      
      // Provide fallback data on error
      setData({
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        customerGrowth: 0,
        topCustomers: [],
        customerSegments: [],
        acquisitionData: []
      });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  return { data, loading, error, refetch: fetchCustomerData };
}