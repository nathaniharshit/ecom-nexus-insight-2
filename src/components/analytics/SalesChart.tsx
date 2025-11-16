import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesPoint } from '@/hooks/useAnalytics';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

interface SalesChartProps {
  salesData: SalesPoint[];
  title?: string;
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label);
    const formattedDate = date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return (
      <div className="bg-popover border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm mb-2">{formattedDate}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">
              {entry.name === 'Revenue' ? formatCurrency(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const TrendIndicator = ({ data, metric }: { data: SalesPoint[], metric: keyof SalesPoint }) => {
  if (data.length < 2) return null;
  
  const recent = data.slice(-3).reduce((sum, point) => sum + (point[metric] as number), 0);
  const previous = data.slice(-6, -3).reduce((sum, point) => sum + (point[metric] as number), 0);
  
  if (previous === 0) return null;
  
  const change = ((recent - previous) / previous) * 100;
  const isPositive = change > 0;
  
  return (
    <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      <span>{Math.abs(change).toFixed(1)}%</span>
    </div>
  );
};

export const SalesChart: React.FC<SalesChartProps> = ({ 
  salesData, 
  title = "Sales Analytics", 
  height = 300 
}) => {
  // Prepare data for different chart types
  const chartData = salesData.map(point => ({
    ...point,
    date: formatDate(point.date),
    fullDate: point.date
  }));

  // Calculate aggregated metrics for pie chart
  const totalRevenue = salesData.reduce((sum, point) => sum + point.revenue, 0);
  const totalOrders = salesData.reduce((sum, point) => sum + point.orders, 0);
  const totalCustomers = salesData.reduce((sum, point) => sum + point.customers, 0);

  const pieData = [
    { name: 'Revenue', value: totalRevenue, color: COLORS[0] },
    { name: 'Orders', value: totalOrders * 100, color: COLORS[1] }, // Scale for visibility
    { name: 'Customers', value: totalCustomers * 150, color: COLORS[2] } // Scale for visibility
  ].filter(item => item.value > 0);

  // Summary stats
  const avgDailyRevenue = totalRevenue / Math.max(salesData.length, 1);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          {title}
        </CardTitle>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              Total Revenue
              <TrendIndicator data={salesData} metric="revenue" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalOrders}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              Total Orders
              <TrendIndicator data={salesData} metric="orders" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(avgDailyRevenue)}</div>
            <div className="text-xs text-muted-foreground">Avg Daily Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(avgOrderValue)}</div>
            <div className="text-xs text-muted-foreground">Avg Order Value</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue" className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Revenue</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="combined" className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Combined</span>
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <PieChartIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
          </TabsList>

          {/* Revenue Trend Chart */}
          <TabsContent value="revenue">
            <ResponsiveContainer width="100%" height={height}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0088FE"
                  strokeWidth={3}
                  dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#0088FE', strokeWidth: 2 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Orders Bar Chart */}
          <TabsContent value="orders">
            <ResponsiveContainer width="100%" height={height}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="orders" 
                  fill="#00C49F"
                  radius={[4, 4, 0, 0]}
                  name="Orders"
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Combined Chart */}
          <TabsContent value="combined">
            <ResponsiveContainer width="100%" height={height}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  yAxisId="revenue"
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                />
                <YAxis 
                  yAxisId="orders"
                  orientation="right"
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  yAxisId="revenue"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0088FE"
                  strokeWidth={3}
                  dot={{ fill: '#0088FE', r: 4 }}
                  name="Revenue"
                />
                <Line 
                  yAxisId="orders"
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#00C49F"
                  strokeWidth={2}
                  dot={{ fill: '#00C49F', r: 3 }}
                  name="Orders"
                />
                <Line 
                  yAxisId="orders"
                  type="monotone" 
                  dataKey="customers" 
                  stroke="#FFBB28"
                  strokeWidth={2}
                  dot={{ fill: '#FFBB28', r: 3 }}
                  name="Customers"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Overview Pie Chart */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'Revenue' ? formatCurrency(value as number) : value, 
                      name
                    ]} 
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-4">
                <h4 className="font-medium">Sales Summary</h4>
                <div className="space-y-2">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground flex-1">{item.name}</span>
                      <span className="font-medium text-sm">
                        {item.name === 'Revenue' 
                          ? formatCurrency(item.value) 
                          : item.name === 'Orders' 
                          ? (item.value / 100).toString()
                          : (item.value / 150).toString()
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};