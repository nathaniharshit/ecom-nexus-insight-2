import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserPlus, TrendingUp } from 'lucide-react';

interface CustomerData {
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

interface CustomerAnalyticsProps {
  data: CustomerData;
  height?: number;
}

const SEGMENT_COLORS = {
  VIP: '#FF6B6B',
  Regular: '#4ECDC4',
  New: '#45B7D1',
  Dormant: '#96CEB4'
};

const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

export const CustomerAnalytics: React.FC<CustomerAnalyticsProps> = ({ 
  data, 
  height = 300 
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Customer Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCustomers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{data.customerGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.newCustomers}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returning</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.returningCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {((data.returningCustomers / data.totalCustomers) * 100).toFixed(1)}% retention rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. CLV</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.topCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / data.topCustomers.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Customer Lifetime Value</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Segments Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.customerSegments}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {data.customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} customers (${props.payload.percentage}%)`, 
                      props.payload.segment
                    ]} 
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-2">
                {data.customerSegments.map((segment) => (
                  <div key={segment.segment} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="text-sm">{segment.segment}</span>
                    </div>
                    <Badge variant="secondary">{segment.percentage}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Acquisition Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Acquisition Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={height - 100}>
              <LineChart data={data.acquisitionData}>
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
                <Line 
                  type="monotone" 
                  dataKey="newCustomers" 
                  stroke="#45B7D1"
                  strokeWidth={2}
                  dot={{ fill: '#45B7D1', r: 3 }}
                  name="New Customers"
                />
                <Line 
                  type="monotone" 
                  dataKey="returningCustomers" 
                  stroke="#4ECDC4"
                  strokeWidth={2}
                  dot={{ fill: '#4ECDC4', r: 3 }}
                  name="Returning Customers"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topCustomers.slice(0, 10).map((customer, index) => (
              <div 
                key={customer.id} 
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{customer.name || `Customer ${customer.id.slice(0, 8)}`}</div>
                    <div className="text-sm text-muted-foreground">
                      Last order: {new Date(customer.lastOrder).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(customer.totalSpent)}</div>
                  <div className="text-sm text-muted-foreground">{customer.orders} orders</div>
                </div>
                
                <Badge 
                  variant={customer.segment === 'VIP' ? 'destructive' : 
                          customer.segment === 'Regular' ? 'default' : 'secondary'}
                >
                  {customer.segment}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};