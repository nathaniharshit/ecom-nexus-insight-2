import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';

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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Analytics</h1>

        <div className="mb-6">
          <DateRangePicker date={dateRange} setDate={setDateRange} />
        </div>

        {authLoading && <p>Checking authentication…</p>}
        {!authLoading && !user && (
          <div className="p-4 mb-4 rounded border bg-yellow-50 text-yellow-700 text-sm">
            Sign in to view real analytics. Currently showing empty metrics.
          </div>
        )}
        {loading && <p>Loading analytics…</p>}
        {error && user && (
          <p className="text-destructive">{error}</p>
        )}

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-card rounded-lg shadow-sm">
              <h3 className="text-sm text-muted-foreground">Total Revenue</h3>
              <p className="text-2xl font-bold">₹{data.kpis.revenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">From {data.kpis.orders} orders</p>
            </div>

            <div className="p-4 bg-card rounded-lg shadow-sm">
              <h3 className="text-sm text-muted-foreground">Registered Customers</h3>
              <p className="text-2xl font-bold">{data.kpis.customers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total platform users</p>
            </div>

            <div className="p-4 bg-card rounded-lg shadow-sm">
              <h3 className="text-sm text-muted-foreground">Available Products</h3>
              <p className="text-2xl font-bold">{data.topProducts.length}</p>
              <p className="text-xs text-muted-foreground">In catalog</p>
            </div>

            <div className="p-4 bg-card rounded-lg shadow-sm">
              <h3 className="text-sm text-muted-foreground">Conversion Rate</h3>
              <p className="text-2xl font-bold">{data.kpis.conversionRate}%</p>
              <p className="text-xs text-muted-foreground">Users who ordered</p>
            </div>
          </div>
        )}

        {data && data.topProducts.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-medium mb-3">Product Catalog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.topProducts.map((p) => (
                <div key={p.id} className="p-4 bg-card rounded-lg shadow-sm flex items-center gap-4">
                  <div className="h-16 w-16 bg-muted rounded overflow-hidden flex-shrink-0">
                    {p.image && <img src={p.image} alt={p.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.category || 'Uncategorized'}</div>
                    <div className="text-sm font-medium text-primary">₹{p.revenue.toFixed(2)}</div>
                    {p.stock !== undefined && (
                      <div className="text-xs text-muted-foreground">Stock: {p.stock}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {data && data.topProducts.length === 0 && !loading && (
          <div className="mt-8 p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-muted-foreground">No products in catalog.</p>
            <p className="text-xs text-muted-foreground">Add products to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
