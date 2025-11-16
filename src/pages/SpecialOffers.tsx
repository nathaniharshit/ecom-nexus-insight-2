import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { ShoppingCart } from '../components/ShoppingCart';
import { useProducts } from '../hooks/useProducts';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { motion } from 'framer-motion';
import { 
  Filter, 
  SortAsc, 
  Grid, 
  List, 
  Tag,
  ArrowLeft,
  Percent,
  ShoppingBag
} from 'lucide-react';

const SpecialOffers = () => {
  const { products, loading } = useProducts();
  const navigate = useNavigate();
  
  // Cart state
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // State management
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('discount');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter only products with discounts
  const discountedProducts = products.filter(product => 
    product.discount_percent && product.discount_percent > 0
  );

  // Get unique categories from discounted products
  const categories = ['all', ...new Set(discountedProducts.map(product => product.category))];

  // Filter products by category and search query
  const filteredProducts = discountedProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'discount':
        return (b.discount_percent || 0) - (a.discount_percent || 0);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onCartClick={() => setIsCartOpen(true)} 
      />
      
      {/* Shopping Cart Sidebar */}
      <ShoppingCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full font-medium text-sm mb-4">
              <Percent className="w-4 h-4" />
              <span>Limited Time Offers</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Special Offers & Discounts</h1>
            <p className="text-lg md:text-xl max-w-2xl mb-8 text-blue-100">
              Discover amazing deals on our top products. Don't miss out on these exclusive discounts!  
            </p>
            <Button 
              onClick={() => navigate('/')}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge 
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer text-sm py-2 px-3 capitalize ${selectedCategory === category ? 'bg-blue-600' : 'hover:bg-blue-50'}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search special offers..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            {/* Sort Options */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="discount">Highest Discount</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{sortedProducts.length}</span> special offers
          </p>
          <Separator className="mt-2" />
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square w-full bg-gray-100">
                  <div className="w-full h-full animate-pulse bg-gray-200" />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 animate-pulse bg-gray-200 rounded" />
                    <div className="h-4 w-1/2 animate-pulse bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className={viewMode === 'grid' ? 
            'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3' : 
            'flex flex-col gap-3'
          }>
            {sortedProducts.map(product => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard 
                  product={product} 
                  viewMode={viewMode} 
                  showAddToCart={true}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <Tag className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No special offers found</h3>
            <p className="text-gray-600 mb-6">We couldn't find any products matching your criteria.</p>
            <Button 
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Back to Shopping */}
        {sortedProducts.length > 0 && (
          <div className="mt-12 text-center">
            <Button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} FlashCart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SpecialOffers;