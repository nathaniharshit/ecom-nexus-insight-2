import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Product } from '../hooks/useProducts';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { ProductQuickViewModal } from './ProductQuickViewModal';

interface ProductCardProps {
  product: Product;
  onViewProduct?: (productId: string) => void;
  className?: string;
  showAddToCart?: boolean;
  isListView?: boolean;
}

export const ProductCard = ({
  product,
  onViewProduct,
  className = "",
  showAddToCart = true,
  isListView = false,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleAddToCart = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isAddingToCart || product.stock === 0) return;
    setIsAddingToCart(true);
    setTimeout(() => {
      addToCart(product, 1);
      setIsAddingToCart(false);
    }, 800);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        ...product,
        image: product.image_url || (product.images && product.images[0]) || '',
        rating: (product as any).rating || 0,
        rating_count: (product as any).rating_count || 0,
        description: product.description ?? '',
      });
    }
  };

  const discountedPrice = product.discount_percent
    ? product.price - (product.price * (product.discount_percent / 100))
    : null;

  const rating = (product as any).rating || (Math.random() * (5 - 3.8) + 3.8);
  const ratingCount = (product as any).rating_count || Math.floor(Math.random() * 200) + 50;
  const isWishlisted = isInWishlist(product.id);

  return (
    <>
      <Card
        className={`group relative flex flex-col overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 bg-background border border-border/50 cursor-pointer ${className}`}
      >
        <CardContent className="p-0 flex flex-col flex-grow">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-[4/3] w-full overflow-hidden bg-muted/30 rounded-t-xl">
              <img
                src={product.image_url || product.images?.[0] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                loading="lazy"
              />
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {discountedPrice && (
                <Badge variant="destructive" className="text-xs font-bold shadow-lg">
                  -{product.discount_percent}%
                </Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="secondary" className="text-xs font-bold shadow-lg bg-black/60 text-white border-none">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100"
              onClick={handleWishlistToggle}
            >
              <Heart className={`w-5 h-5 transition-all ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-foreground/70'}`} />
            </Button>
          </div>

          {/* Product Details */}
          <div className="p-4 flex flex-col flex-grow">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{product.category}</p>
            <h3 className="font-semibold text-base text-foreground mt-1.5 line-clamp-2 flex-grow">{product.name}</h3>
            
            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-bold text-foreground">{rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({ratingCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-xl font-bold text-primary">
                ₹{discountedPrice ? discountedPrice.toFixed(2) : product.price.toFixed(2)}
              </span>
              {discountedPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 pt-0 mt-auto flex gap-2">
            {/* Quick View Button */}
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
            >
              <Eye className="w-5 h-5 mr-2" />
              Quick View
            </Button>

            {/* View Product Button */}
            <Button
              size="lg"
              variant="default"
              className="flex-1"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              View Product
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <ProductQuickViewModal
          product={product}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </>
  );
};