import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  rating: number;
  rating_count: number;
  stock: number;
  discount?: number;
};

type WishlistContextType = {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const { user } = useAuth();
  
  // Load wishlist from localStorage when component mounts or user changes
  useEffect(() => {
    const loadWishlist = () => {
      const userId = user?.id || 'guest';
      const savedWishlist = localStorage.getItem(`wishlist_${userId}`);
      if (savedWishlist) {
        try {
          setWishlistItems(JSON.parse(savedWishlist));
        } catch (error) {
          console.error('Failed to parse wishlist from localStorage:', error);
          setWishlistItems([]);
        }
      }
    };
    
    loadWishlist();
  }, [user]);
  
  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    const userId = user?.id || 'guest';
    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(wishlistItems));
  }, [wishlistItems, user]);
  
  const addToWishlist = (product: Product) => {
    setWishlistItems(prev => {
      // Check if product already exists in wishlist
      if (prev.some(item => item.id === product.id)) {
        return prev; // Don't add duplicates
      }
      return [...prev, product];
    });
  };
  
  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  };
  
  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.id === productId);
  };
  
  const clearWishlist = () => {
    setWishlistItems([]);
  };
  
  return (
    <WishlistContext.Provider 
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};