import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { ProductCard } from '../components/ProductCard';
import { ShoppingCart } from '../components/ShoppingCart';
import { AdminDashboard } from '../components/AdminDashboard';
import { useProducts } from '../hooks/useProducts';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { motion } from 'framer-motion';
import { 
  Filter, 
  SortAsc, 
  Grid, 
  List, 
  Star, 
  ShieldCheck, 
  Truck, 
  RefreshCw,
  ArrowLeft,
  X
} from 'lucide-react';

const Index = () => {
  const { user, profile, loading, signOut } = useAuth();
  const { products } = useProducts();
  console.log('Index page products:', products);
  console.log('Index page loading:', loading);
  const navigate = useNavigate();
  
  // Cart state
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // State management
  const [currentView, setCurrentView] = useState<'customer' | 'admin'>('customer');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<'all' | 'under-500' | '500-1000' | 'over-1000'>('all');
  const [showDiscount, setShowDiscount] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Check if user is admin
  const isAdmin = profile?.role === 'admin';
  const isLoggedIn = !!user;

  // Debug logging
  console.log('User profile:', profile);
  console.log('User role:', profile?.role);
  console.log('Is admin:', isAdmin);

  // Get unique categories from database products
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      // Apply category filter
      const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
      
      // Apply search filter if search query exists
      const searchMatch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Apply price range filter
      let priceMatch = true;
      if (priceRange === 'under-500') {
        priceMatch = product.price < 500;
      } else if (priceRange === '500-1000') {
        priceMatch = product.price >= 500 && product.price <= 1000;
      } else if (priceRange === 'over-1000') {
        priceMatch = product.price > 1000;
      }
      
      // Apply discount filter
      const discountMatch = !showDiscount || (product.discount_percent && product.discount_percent > 0);
      
      // Apply stock filter
      const stockMatch = !inStock || product.stock > 0;
      
      return categoryMatch && searchMatch && priceMatch && discountMatch && stockMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return ((b as any).rating ?? 0) - ((a as any).rating ?? 0);
        case 'popular':
        default:
          return ((b as any).rating ?? 0) - ((a as any).rating ?? 0) || ((b as any).reviews ?? 0) - ((a as any).reviews ?? 0); // Default sorting by popularity (rating)
      }
    });

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentView('customer');
  };

  // Show loading state
  // Always render homepage layout, even if loading or products is empty
  // Show loading spinner at top if loading
  // Show fallback message if products is empty
  const showLoading = loading;

  // Render admin dashboard
  if (currentView === 'admin') {
    // Check if user is admin
    if (!isAdmin) {
      setCurrentView('customer');
      return null;
    }
    
    return (
      <div className="min-h-screen bg-background">
        <Header
          onLoginClick={handleLogin}
          onLogoutClick={handleLogout}
          onAdminClick={() => setCurrentView('customer')}
          isLoggedIn={isLoggedIn}
          userRole={(profile?.role as 'customer' | 'admin') || 'customer'}
          userName={profile?.full_name || user?.email || ''}
          onCartClick={() => setIsCartOpen(true)}
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentView('customer')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Store
            </Button>
          </div>
          
          <AdminDashboard />
        </div>

        {/* Removed ShoppingCart component */}
      </div>
    );
  }

  // Render customer store
  return (
    <div className="min-h-screen bg-background">
      <Header
        onLoginClick={handleLogin}
        onLogoutClick={handleLogout}
        onAdminClick={isAdmin ? () => setCurrentView('admin') : undefined}
        isLoggedIn={isLoggedIn}
        userRole={(profile?.role as 'customer' | 'admin') || 'customer'}
        userName={profile?.full_name || user?.email || ''}
        onSearch={setSearchQuery}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Hero Section */}
       <HeroSection
         onMakeAppointment={() => {
           document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
         }}
         onLearnMore={() => {
           document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
         }}
         onViewOffers={() => {
           navigate('/special-offers');
         }}
       />

      {/* Features Section */}
      <section className="py-10 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center animate-fade-in p-4 bg-background/50 rounded-lg shadow-sm">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-success/10 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 md:w-8 md:h-8 text-success" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Free Shipping</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Free shipping on all orders over $50</p>
            </div>

            <div className="text-center animate-fade-in p-4 bg-background/50 rounded-lg shadow-sm">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Secure Payment</h3>
              <p className="text-xs md:text-sm text-muted-foreground">100% secure payment methods</p>
            </div>

            <div className="text-center animate-fade-in p-4 bg-background/50 rounded-lg shadow-sm">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-warning/10 rounded-full flex items-center justify-center">
                <RefreshCw className="w-6 h-6 md:w-8 md:h-8 text-warning" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Easy Returns</h3>
              <p className="text-xs md:text-sm text-muted-foreground">30 day money back guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">Shop by Category</h2>
          <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
            <div className="flex gap-2 md:gap-4 md:flex-wrap md:justify-center min-w-max md:min-w-0">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap transition-all duration-200 hover:scale-105"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-10 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">Our Products</h2>
            
            <div className="flex flex-wrap gap-3 items-center">
              {/* Filter button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 transition-all ${isFilterOpen ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {(showDiscount || inStock || priceRange !== 'all') && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {(showDiscount ? 1 : 0) + (inStock ? 1 : 0) + (priceRange !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              
              {/* Active filters */}
              {(showDiscount || inStock || priceRange !== 'all') && (
                <div className="flex flex-wrap gap-1 items-center">
                  {showDiscount && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-background">
                      On Sale
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setShowDiscount(false)} />
                    </Badge>
                  )}
                  
                  {inStock && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-background">
                      In Stock
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setInStock(false)} />
                    </Badge>
                  )}
                  
                  {priceRange !== 'all' && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-background">
                      {priceRange === 'under-500' ? 'Under $500' : 
                       priceRange === '500-1000' ? '$500-$1000' : 'Over $1000'}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange('all')} />
                    </Badge>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setShowDiscount(false);
                      setInStock(false);
                      setPriceRange('all');
                    }}
                  >
                    Clear all
                  </Button>
                </div>
              )}
              
              {/* Sort select */}
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
              </select>
              
              {/* View mode buttons */}
              <div className="flex border rounded-md overflow-hidden">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`px-2 rounded-none ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`px-2 rounded-none ${viewMode === 'list' ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Filter panel */}
          {isFilterOpen && (
            <div className="mb-6 p-4 bg-background rounded-lg shadow-sm border animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Price Range</h3>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={priceRange === 'all'} 
                        onChange={() => setPriceRange('all')} 
                      />
                      <span>All Prices</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={priceRange === 'under-500'} 
                        onChange={() => setPriceRange('under-500')} 
                      />
                      <span>Under $500</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={priceRange === '500-1000'} 
                        onChange={() => setPriceRange('500-1000')} 
                      />
                      <span>$500 - $1000</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={priceRange === 'over-1000'} 
                        onChange={() => setPriceRange('over-1000')} 
                      />
                      <span>Over $1000</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Availability</h3>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showDiscount} 
                        onChange={() => setShowDiscount(!showDiscount)} 
                      />
                      <span>On Sale</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={inStock} 
                        onChange={() => setInStock(!inStock)} 
                      />
                      <span>In Stock Only</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Products grid */}
          <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredProducts.map((product) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={viewMode === 'grid' ? 'w-full' : 'w-full'}
              >
                <Card className={`h-full overflow-hidden transition-all duration-200 hover:shadow-md ${viewMode === 'grid' ? '' : 'flex flex-row'}`}>
                  <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'h-48 md:h-56' : 'w-1/3 h-full'}`}>
                    <img 
                      src={product.image_url || '/placeholder.svg'} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    
                    {/* Quick view overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="text-xs"
                      >
                        Quick View
                      </Button>
                    </div>
                    
                    {/* Discount badge */}
                    {product.discount_percent && product.discount_percent > 0 && (
                      <Badge className="absolute top-2 left-2 bg-destructive hover:bg-destructive">
                        {product.discount_percent}% OFF
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className={`p-4 flex flex-col ${viewMode === 'grid' ? '' : 'w-2/3'}`}>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.name}</h3>
                      
                      {/* Rating stars */}
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < (product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({product.reviews || 0} reviews)
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {product.description || 'No description available'}
                      </p>
                      
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="font-semibold">
                          ${product.discount_percent && product.discount_percent > 0 
                            ? (product.price * (1 - product.discount_percent / 100)).toFixed(2)
                            : product.price.toFixed(2)
                          }
                        </span>
                        
                        {product.discount_percent && product.discount_percent > 0 && (
                          <span className="text-muted-foreground text-sm line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <Button 
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="w-full"
                      >
                        View Product
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* No products message */}
          {filteredProducts.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or browse all products</p>
              <Button 
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange('all');
                  setShowDiscount(false);
                  setInStock(false);
                  setSearchQuery('');
                }}
                className="animate-pulse"
              >
                Reset Filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 animate-fade-in">Stay Updated</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto animate-fade-in">
            Subscribe to our newsletter and be the first to know about new products, exclusive offers, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-4 py-2 rounded-md border border-primary-foreground/20 bg-transparent placeholder:text-primary-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
            />
            <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all duration-200 animate-pulse">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">SmartCart</h3>
              <p className="text-muted-foreground text-sm">Your one-stop shop for all your needs.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Home</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Shop</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Shipping</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Returns</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Track Order</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <address className="text-sm text-muted-foreground not-italic">
                <p>123 Commerce St.</p>
                <p>Anytown, AT 12345</p>
                <p className="mt-2">Email: support@SmartCart.com</p>
                <p>Phone: (123) 456-7890</p>
              </address>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SmartCart. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Shopping Cart */}
      <ShoppingCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  );
};

export default Index;
