import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, TrendingUp, TrendingDown, AlertTriangle, Star } from 'lucide-react';

interface ProductPerformanceData {
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

interface ProductAnalyticsProps {
  data: ProductPerformanceData;
  height?: number;
}

const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

const getStatusColor = (stock: number) => {
  if (stock === 0) return 'text-red-600';
  if (stock < 10) return 'text-yellow-600';
  return 'text-green-600';
};

const getStatusText = (stock: number) => {
  if (stock === 0) return 'Out of Stock';
  if (stock < 10) return 'Low Stock';
  return 'In Stock';
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    case 'down':
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    default:
      return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  }
};

export const ProductAnalytics: React.FC<ProductAnalyticsProps> = ({ 
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
              <span className="font-medium">
                {entry.name.includes('Revenue') || entry.name.includes('Value') 
                  ? formatCurrency(entry.value) 
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Inventory Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.inventoryStatus.total_products}</div>
            <p className="text-xs text-muted-foreground">In catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.inventoryStatus.total_inventory_value)}</div>
            <p className="text-xs text-muted-foreground">Total stock value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data.inventoryStatus.low_stock_items}</div>
            <p className="text-xs text-muted-foreground">Items need restock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.inventoryStatus.out_of_stock_items}</div>
            <p className="text-xs text-muted-foreground">Urgent restocking</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={height}>
              <BarChart data={data.categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="category" 
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="revenue" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profitability Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Product Profitability Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={height}>
              <ScatterChart data={data.profitabilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="revenue"
                  type="number"
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                />
                <YAxis 
                  dataKey="profit_margin"
                  type="number"
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'profit_margin' ? `${value}%` : formatCurrency(value as number),
                    name === 'profit_margin' ? 'Profit Margin' : name === 'revenue' ? 'Revenue' : 'Units Sold'
                  ]}
                  labelFormatter={(label) => `Product: ${label}`}
                />
                <Scatter 
                  dataKey="units_sold" 
                  fill="#82ca9d"
                  name="Units Sold"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Product Performance Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    #{index + 1}
                  </div>
                  
                  {product.image && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">{product.category}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{product.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-right">
                  <div>
                    <div className="font-medium">{formatCurrency(product.revenue)}</div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                  
                  <div>
                    <div className="font-medium">{product.units_sold}</div>
                    <div className="text-xs text-muted-foreground">Units Sold</div>
                  </div>
                  
                  <div>
                    <div className={`font-medium ${getStatusColor(product.stock)}`}>
                      {product.stock}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getStatusText(product.stock)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1">
                      {getTrendIcon(product.trend)}
                      <span className="text-sm font-medium">{product.profit_margin}%</span>
                    </div>
                    <Badge 
                      variant={product.profit_margin > 30 ? 'default' : 
                              product.profit_margin > 15 ? 'secondary' : 'destructive'}
                    >
                      {product.profit_margin > 30 ? 'High' : 
                       product.profit_margin > 15 ? 'Medium' : 'Low'} Margin
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Category Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.categoryPerformance.map((category) => (
              <div key={category.category} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">{category.category}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Revenue:</span>
                    <span className="font-medium">{formatCurrency(category.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Units Sold:</span>
                    <span className="font-medium">{category.units_sold}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Products:</span>
                    <span className="font-medium">{category.products_count}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">Avg Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{category.avg_rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Performance</span>
                      <span>{Math.min(100, (category.revenue / 10000) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={Math.min(100, (category.revenue / 10000) * 100)} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};