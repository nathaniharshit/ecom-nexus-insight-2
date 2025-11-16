import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  ChevronRight,
  LogOut,
  Settings,
  Heart,
  Search,
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { Header } from './Header';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';

interface OrderCardProps {
  order: any;
  onViewDetails: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onViewDetails }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="mb-4 border-l-4 hover:shadow-lg transition-all duration-300" style={{ borderLeftColor: order.status === 'delivered' ? '#10b981' : order.status === 'shipped' ? '#3b82f6' : order.status === 'processing' ? '#f59e0b' : order.status === 'cancelled' ? '#ef4444' : '#6b7280' }}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-bold">{order.order_number}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(order.created_at || order.date)}
              </CardDescription>
            </div>
            <Badge className={`${getStatusColor(order.status)} text-white capitalize px-3 py-1 rounded-full`}>
              <span className="flex items-center gap-1">
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-3">
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Package className="w-3 h-3" /> Items
              </span>
              <span className="font-medium bg-gray-100 px-2 py-1 rounded-md">{order.items?.length || order.products?.length || 0} items</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> Total
              </span>
              <span className="font-bold text-primary">₹{order.total.toFixed(2)}</span>
            </div>
            {order.tracking_number && (
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Truck className="w-3 h-3" /> Tracking
                </span>
                <span className="font-medium font-mono text-xs bg-gray-100 px-2 py-1 rounded-md">{order.tracking_number}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-between hover:bg-primary hover:text-white transition-colors" 
            onClick={() => onViewDetails(order.id)}
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

interface OrderDetailsProps {
  orderId: string;
  onBack: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId, onBack }) => {
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      const orderData = await getOrderById(orderId);
      setOrder(orderData);
      setLoading(false);
    };

    fetchOrder();
  }, [orderId, getOrderById]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack} disabled>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Order not found</h3>
            <p className="text-muted-foreground">The order details could not be loaded.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'delivered':
        return 4;
      case 'shipped':
        return 3;
      case 'processing':
        return 2;
      case 'pending':
        return 1;
      case 'cancelled':
        return 0;
      default:
        return 1;
    }
  };

  const statusStep = getStatusStep(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
        <h2 className="text-2xl font-bold">Order {order.order_number}</h2>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Order Date</h4>
                <p>{formatDate(order.created_at || order.date)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Order Status</h4>
                <Badge className="mt-1 capitalize">{order.status}</Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Order Total</h4>
                <p className="text-lg font-bold">₹{order.total.toFixed(2)}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Shipping Address</h4>
                <p>{order.shipping_address}</p>
              </div>
              {order.tracking_number && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Tracking Number</h4>
                  <p>{order.tracking_number}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Tracking */}
      <Card className="overflow-hidden border-t-4 border-primary">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Order Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative">
            {/* Progress Bar */}
            <div className="absolute top-4 left-0 right-0 h-2 bg-gray-100 rounded-full">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${statusStep === 0 ? 100 : (statusStep / 4) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                  statusStep === 0 ? 'bg-red-500' : 
                  statusStep === 4 ? 'bg-green-500' : 
                  'bg-primary'
                }`}
              />
            </div>
            
            {/* Steps */}
            <div className="flex justify-between relative z-10 pt-2">
              <div className="text-center">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md ${
                    statusStep === 0 ? 'bg-red-500 text-white' :
                    statusStep >= 1 ? 'bg-primary text-white' : 
                    'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Package className="w-5 h-5" />
                </motion.div>
                <p className={`text-xs font-medium ${statusStep >= 1 ? 'text-primary' : ''}`}>Order Placed</p>
                {order.created_at && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              <div className="text-center">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md ${
                    statusStep === 0 ? 'bg-red-500 text-white' :
                    statusStep >= 2 ? 'bg-primary text-white' : 
                    'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </motion.div>
                <p className={`text-xs font-medium ${statusStep >= 2 ? 'text-primary' : ''}`}>Processing</p>
              </div>
              
              <div className="text-center">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md ${
                    statusStep === 0 ? 'bg-red-500 text-white' :
                    statusStep >= 3 ? 'bg-primary text-white' : 
                    'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                </motion.div>
                <p className={`text-xs font-medium ${statusStep >= 3 ? 'text-primary' : ''}`}>Shipped</p>
                {order.tracking_number && statusStep >= 3 && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    #{order.tracking_number}
                  </p>
                )}
              </div>
              
              <div className="text-center">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md ${
                    statusStep === 0 ? 'bg-red-500 text-white' :
                    statusStep >= 4 ? 'bg-green-500 text-white' : 
                    'bg-gray-100 text-gray-500'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                </motion.div>
                <p className={`text-xs font-medium ${statusStep >= 4 ? 'text-green-500' : ''}`}>Delivered</p>
                {statusStep >= 4 && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(order.updated_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(order.items || order.products || []).map((item: any, index: number) => {
              const product = item.product || {};
              return (
                <div key={index} className="flex items-center gap-4 py-3 border-b last:border-0">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {(product.image_url || item.product_image) ? (
                      <img 
                        src={product.image_url || item.product_image} 
                        alt={product.name || item.product_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">{product.name || item.product_name || `Product #${item.product_id || item.productId}`}</h4>
                    <div className="flex justify-between mt-1">
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ProfileDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { orders, loading: ordersLoading } = useOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not logged in
  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const filteredOrders = orders.filter(order => 
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onLoginClick={() => navigate('/auth')}
          onLogoutClick={handleLogout}
          isLoggedIn={!!user}
          userRole={user?.role || 'customer'}
          userName={user?.fullName || ''}
          onCartClick={() => {}}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onLoginClick={() => navigate('/auth')}
        onLogoutClick={handleLogout}
        isLoggedIn={!!user}
        userRole={user?.role || 'customer'}
        userName={user?.fullName || ''}
        onCartClick={() => {}}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="mb-4 overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary/70 p-6 text-white">
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="w-24 h-24 border-4 border-white">
                    <AvatarImage src={user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary-foreground text-primary text-xl">
                      {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{user?.fullName}</h3>
                    <p className="text-primary-foreground/80 text-sm">{user?.email}</p>
                    <Badge className="mt-2 bg-white text-primary hover:bg-white">
                      {user?.role === 'admin' ? 'Admin' : 'Customer'}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-muted p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold">{orders.length}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold">
                      {orders.filter(o => o.status === 'delivered').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Delivered</p>
                  </div>
                </div>
                <nav className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => setSelectedOrderId(null)}>
                    <Package className="w-4 h-4 mr-2" />
                    My Orders
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/wishlist')}>
                    <Heart className="w-4 h-4 mr-2" />
                    Wishlist
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" disabled>
                    <Settings className="w-4 h-4 mr-2" />
                    Account Settings
                  </Button>
                  <Separator />
                  <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </nav>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Account Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Your account is secure</span>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-1">Last login</p>
                  <p className="text-sm">{new Date().toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedOrderId ? (
              <OrderDetails orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />
            ) : (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <ShoppingBag className="w-6 h-6 text-primary" />
                      My Orders
                    </h2>
                    <p className="text-muted-foreground text-sm">Track and manage your purchases</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/')}
                    className="hover:bg-primary hover:text-white transition-colors"
                  >
                    Continue Shopping
                  </Button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search orders by order number..."
                    className="pl-10 focus-visible:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {ordersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : filteredOrders.length > 0 ? (
                  <div>
                    {filteredOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <OrderCard 
                          order={order} 
                          onViewDetails={(id) => setSelectedOrderId(id)} 
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No orders found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery ? 'No orders match your search criteria.' : 'You haven\'t placed any orders yet.'}
                      </p>
                      <Button onClick={() => navigate('/')}>
                        Start Shopping
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};