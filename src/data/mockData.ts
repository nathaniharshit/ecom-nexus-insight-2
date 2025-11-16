// Mock data for the e-commerce platform

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
  rating: number;
  reviews: number;
  original_price?: number;
  discount_percent?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  avatar?: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
}

export interface Order {
  id: string;
  userId: string;
  products: { productId: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  shippingAddress: string;
}

export interface AnalyticsData {
  monthlySales: { month: string; sales: number; orders: number }[];
  bestSellingProducts: { productId: string; name: string; sales: number }[];
  customerRetention: { newCustomers: number; returningCustomers: number; churnRate: number };
  revenueData: { date: string; revenue: number }[];
}

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 2549, // discounted price
    original_price: 2999, // original price
    discount_percent: 15,
    image: '/placeholder.svg',
    category: 'Electronics',
    description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
    stock: 45,
    rating: 4.8,
    reviews: 324
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    price: 1999, // discounted price
    original_price: 2499, // original price
    discount_percent: 20,
    image: '/placeholder.svg',
    category: 'Electronics',
    description: 'Advanced fitness tracking with health monitoring and smartphone integration.',
    stock: 28,
    rating: 4.6,
    reviews: 156
  },
  {
    id: '3',
    name: 'Designer Laptop Bag',
    price: 1290,
    original_price: 1500,
    discount_percent: 14,
    image: '/placeholder.svg',
    category: 'Fashion',
    description: 'Stylish and functional laptop bag made from premium materials.',
    stock: 15,
    rating: 4.9,
    reviews: 89
  },
  {
    id: '4',
    name: 'Organic Coffee Blend',
    price: 240,
    original_price: 300,
    discount_percent: 20,
    image: '/placeholder.svg',
    category: 'Food',
    description: 'Premium organic coffee beans from sustainable farms.',
    stock: 120,
    rating: 4.7,
    reviews: 234
  },
  {
    id: '5',
    name: 'Minimalist Desk Lamp',
    price: 890,
    original_price: 1000,
    discount_percent: 11,
    image: '/placeholder.svg',
    category: 'Home',
    description: 'Modern LED desk lamp with adjustable brightness and USB charging.',
    stock: 67,
    rating: 4.5,
    reviews: 112
  },
  {
    id: '6',
    name: 'Luxury Skincare Set',
    price: 1490,
    original_price: 1800,
    discount_percent: 17,
    image: '/placeholder.svg',
    category: 'Beauty',
    description: 'Complete skincare routine with natural and organic ingredients.',
    stock: 33,
    rating: 4.8,
    reviews: 178
  }
];

// Mock Analytics Data
export const mockAnalytics: AnalyticsData = {
  monthlySales: [
    { month: 'Jan', sales: 45000, orders: 180 },
    { month: 'Feb', sales: 52000, orders: 205 },
    { month: 'Mar', sales: 48000, orders: 195 },
    { month: 'Apr', sales: 61000, orders: 240 },
    { month: 'May', sales: 55000, orders: 220 },
    { month: 'Jun', sales: 67000, orders: 268 },
    { month: 'Jul', sales: 72000, orders: 290 },
    { month: 'Aug', sales: 69000, orders: 275 },
    { month: 'Sep', sales: 58000, orders: 235 },
    { month: 'Oct', sales: 74000, orders: 295 },
    { month: 'Nov', sales: 81000, orders: 325 },
    { month: 'Dec', sales: 95000, orders: 380 }
  ],
  bestSellingProducts: [
    { productId: '1', name: 'Premium Wireless Headphones', sales: 1200 },
    { productId: '4', name: 'Organic Coffee Blend', sales: 980 },
    { productId: '2', name: 'Smart Fitness Watch', sales: 750 },
    { productId: '6', name: 'Luxury Skincare Set', sales: 680 },
    { productId: '3', name: 'Designer Laptop Bag', sales: 520 }
  ],
  customerRetention: {
    newCustomers: 1250,
    returningCustomers: 2100,
    churnRate: 12.5
  },
  revenueData: [
    { date: '2024-01-01', revenue: 1500 },
    { date: '2024-01-02', revenue: 2200 },
    { date: '2024-01-03', revenue: 1800 },
    { date: '2024-01-04', revenue: 2800 },
    { date: '2024-01-05', revenue: 2400 },
    { date: '2024-01-06', revenue: 3200 },
    { date: '2024-01-07', revenue: 2900 }
  ]
};

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'customer',
    joinDate: '2024-01-15',
    totalOrders: 12,
    totalSpent: 1450.50
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    joinDate: '2023-06-01',
    totalOrders: 0,
    totalSpent: 0
  }
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    userId: '1',
    products: [
      { productId: '1', quantity: 1, price: 299.99 },
      { productId: '4', quantity: 2, price: 24.99 }
    ],
    total: 349.97,
    status: 'delivered',
    date: '2024-01-10',
    shippingAddress: '123 Main St, City, State 12345'
  },
  {
    id: 'ORD-002',
    userId: '1',
    products: [
      { productId: '3', quantity: 1, price: 129.99 }
    ],
    total: 129.99,
    status: 'shipped',
    date: '2024-01-15',
    shippingAddress: '123 Main St, City, State 12345'
  }
];