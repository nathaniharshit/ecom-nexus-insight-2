import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Heart, Trash2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { user, profile } = useAuth();

  // Handle view product
  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        onLoginClick={() => navigate('/auth')}
        onLogoutClick={() => console.log('Logout clicked')}
        onAdminClick={() => navigate('/admin')}
        isLoggedIn={!!user}
        userRole={profile?.role as 'customer' | 'admin'}
        userName={profile?.full_name || ''}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold flex items-center">
              <Heart className="mr-2 h-6 w-6 text-red-500" /> My Wishlist
            </h1>
          </div>
          
          {wishlistItems.length > 0 && (
            <Button 
              variant="outline" 
              onClick={clearWishlist}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4"
          >
            <div className="bg-muted rounded-lg p-8 max-w-md mx-auto">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Items added to your wishlist will appear here. Start exploring products you love!
              </p>
              <Button onClick={() => navigate('/')} className="flex items-center gap-2">
                Browse Products
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard
                  product={product}
                  onViewProduct={() => handleViewProduct(product.id)}
                  showAddToCart={true}
                  // isListView={false} // default grid card
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;