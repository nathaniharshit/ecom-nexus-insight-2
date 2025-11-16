import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';
import { SalesChart } from '@/components/analytics/SalesChart';
import { CustomerAnalytics } from '@/components/analytics/CustomerAnalytics';
import { ProductAnalytics } from '@/components/analytics/ProductAnalytics';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useCustomerAnalytics } from '@/hooks/useCustomerAnalytics';
import { useProductAnalytics } from '@/hooks/useProductAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, Package, TrendingUp } from 'lucide-react';

const Analytics = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6); // last 7 days
    return { from: start, to: end };
  });

  const startDate = dateRange?.from ?? new Date();
  const endDate = dateRange?.to ?? new Date();

  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, refetch } = useAnalytics({
    startDate,
    endDate,
    compare: true,
  });

  // Fetch real customer and product analytics
  const { data: customerData, loading: customerLoading, error: customerError } = useCustomerAnalytics({
    startDate,
    endDate
  });

  const { data: productData, loading: productLoading, error: productError } = useProductAnalytics({
    startDate,
    endDate
  });

  // Show loading state
  const isLoading = loading || customerLoading || productLoading;
  const hasErrors = error || customerError || productError;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <DateRangePicker date={dateRange} setDate={setDateRange} />
        </div>

        {authLoading && <p>Checking authentication…</p>}
        {!authLoading && !user && (
          <div className="p-4 mb-4 rounded border bg-yellow-50 text-yellow-700 text-sm">
            Sign in to view real analytics. Currently showing actual database data.
          </div>
        )}
        
        {isLoading && <p>Loading analytics data…</p>}
        {hasErrors && !isLoading && (
          <div className="p-4 mb-4 rounded border bg-red-50 text-red-700 text-sm">
            <p>Some analytics data could not be loaded:</p>
            {error && <p>• Sales: {error}</p>}
            {customerError && <p>• Customers: {customerError}</p>}
            {productError && <p>• Products: {productError}</p>}
          </div>
        )}
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-card rounded-lg shadow-sm">
                <h3 className="text-sm text-muted-foreground">Total Revenue</h3>
                <p className="text-2xl font-bold">₹{data?.kpis.revenue.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground">From {data?.kpis.orders || 0} orders</p>
              </div>

              <div className="p-4 bg-card rounded-lg shadow-sm">
                <h3 className="text-sm text-muted-foreground">Registered Customers</h3>
                <p className="text-2xl font-bold">{data?.kpis.customers.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground">Total platform users</p>
              </div>

              <div className="p-4 bg-card rounded-lg shadow-sm">
                <h3 className="text-sm text-muted-foreground">Available Products</h3>
                <p className="text-2xl font-bold">{productData?.inventoryStatus.total_products || data?.topProducts.length || 0}</p>
                <p className="text-xs text-muted-foreground">In catalog</p>
              </div>

              <div className="p-4 bg-card rounded-lg shadow-sm">
                <h3 className="text-sm text-muted-foreground">Conversion Rate</h3>
                <p className="text-2xl font-bold">{data?.kpis.conversionRate || 0}%</p>
                <p className="text-xs text-muted-foreground">Users who ordered</p>
              </div>
            </div>

            {data && data.salesSeries && data.salesSeries.length > 0 ? (
              <SalesChart 
                salesData={data.salesSeries} 
                title="Sales Performance Trends"
                height={400}
              />
            ) : (
              <div className="p-8 bg-muted/50 rounded-lg text-center">
                <p className="text-muted-foreground mb-4">No sales data available yet.</p>
                <p className="text-xs text-muted-foreground">
                  Add some orders to see beautiful sales analytics charts!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sales">
            {data && data.salesSeries && data.salesSeries.length > 0 ? (
              <SalesChart 
                salesData={data.salesSeries} 
                title="Detailed Sales Analytics"
                height={500}
              />
            ) : (
              <div className="p-8 bg-muted/50 rounded-lg text-center">
                <h3 className="text-lg font-medium mb-2">No Sales Data Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start making sales to unlock powerful analytics insights including:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 max-w-md mx-auto">
                  <li>• Revenue trend analysis</li>
                  <li>• Order volume tracking</li>
                  <li>• Customer acquisition metrics</li>
                  <li>• Growth rate comparisons</li>
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="customers">
            {customerData ? (
              <CustomerAnalytics data={customerData} height={400} />
            ) : (
              <div className="p-8 bg-muted/50 rounded-lg text-center">
                <h3 className="text-lg font-medium mb-2">Loading Customer Analytics</h3>
                <p className="text-muted-foreground">Fetching customer data from database...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="products">
            {productData ? (
              <ProductAnalytics data={productData} height={400} />
            ) : (
              <div className="p-8 bg-muted/50 rounded-lg text-center">
                <h3 className="text-lg font-medium mb-2">Loading Product Analytics</h3>
                <p className="text-muted-foreground">Fetching product data from database...</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
