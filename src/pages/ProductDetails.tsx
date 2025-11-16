import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  ShoppingCart
} from 'lucide-react';

import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { ShoppingCart as ShoppingCartDrawer } from '@/components/ShoppingCart';
import Wishlist from '@/pages/Wishlist';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  // ...existing code...

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) {
          setError('Failed to fetch product details');
        } else {
          setProduct(data);
          setSelectedImageIndex(0);
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const renderStars = (rating: number = 0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleNextImage = () => {
    const images = product?.images || [];
    const totalImages = product?.image_url ? images.length + 1 : images.length;
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
  };

  const handlePreviousImage = () => {
    const images = product?.images || [];
    const totalImages = product?.image_url ? images.length + 1 : images.length;
    setSelectedImageIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
  };

  const adjustQuantity = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(product?.stock || 1, prev + delta)));
  };


  const handleAddToCart = () => {
    if (!product || product.stock === 0 || isAddingToCart) return;
    setIsAddingToCart(true);
    addToCart(product, quantity);
    setCartOpen(true);
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive text-lg">{error || 'Product not found'}</p>
        <Button onClick={() => navigate('/')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  const images = product?.images || [];
  const allImages = [
    ...(product?.image_url ? [product.image_url] : []),
    ...images
  ].filter(img => img && img.trim() !== '');

  const mainImage = allImages[selectedImageIndex] || '/placeholder.svg';

  return (
    <>
  <Header onCartClick={() => setCartOpen(true)} />
  {/* Cart and Wishlist Drawers */}
  <ShoppingCartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
  {wishlistOpen && <Wishlist />}
      <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => navigate('/')} className="hover:text-foreground transition-colors">
              Home
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="capitalize">{product.category}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-6">
            <div className="sticky top-8">
              {/* Main Image */}
              <div className="relative mb-4 bg-muted/30 rounded-lg overflow-hidden">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-[500px] object-contain"
                />
                {allImages.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                      onClick={handlePreviousImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageSelect(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index 
                          ? 'border-primary' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="lg:col-span-6">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  {product.stock <= 10 && product.stock > 0 && (
                    <Badge variant="destructive">Only {product.stock} left!</Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {renderStars(product.rating || 4.2)}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating || 4.2} out of 5 stars
                  </span>
                  <span className="text-sm text-primary hover:underline cursor-pointer">
                    (125 reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">₹{product.price.toFixed(2)}</span>
                  <span className="text-lg text-muted-foreground line-through">₹{(product.price * 1.2).toFixed(2)}</span>
                  <Badge variant="destructive">17% off</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">About this product</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {/* Key Features */}
              {product.key_features && product.key_features.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Key Features</h3>
                  <ul className="space-y-1">
                    {product.key_features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              {/* Quantity & Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustQuantity(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 min-w-12 text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustQuantity(1)}
                      disabled={quantity >= (product.stock || 0)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button 
                    size="lg" 
                    className="w-full" 
                    disabled={product.stock === 0}
                    onClick={handleAddToCart}
                  >
                    {isAddingToCart ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    disabled={product.stock === 0}
                  >
                    Buy Now
                  </Button>
                </div>

                {/* Wishlist & Share */}
                <div className="flex gap-2">
                  <Button
                    variant={isInWishlist(product.id) ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => {
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
                    }}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Delivery Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Free Delivery</p>
                        <p className="text-sm text-muted-foreground">Order above ₹499</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <RotateCcw className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">7 Days Return</p>
                        <p className="text-sm text-muted-foreground">Easy return policy</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">1 Year Warranty</p>
                        <p className="text-sm text-muted-foreground">Manufacturer warranty</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Product Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Category:</span>
                      <span className="ml-2 text-muted-foreground capitalize">{product.category}</span>
                    </div>
                    <div>
                      <span className="font-medium">Stock:</span>
                      <span className="ml-2 text-muted-foreground">{product.stock} units</span>
                    </div>
                    <div>
                      <span className="font-medium">SKU:</span>
                      <span className="ml-2 text-muted-foreground">{product.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="font-medium">Weight:</span>
                      <span className="ml-2 text-muted-foreground">1.2 kg</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Customer Reviews</h3>
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">{renderStars(5)}</div>
                        <span className="font-medium">Great product!</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Excellent quality and fast delivery. Highly recommended!
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">- John D.</p>
                    </div>
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">{renderStars(4)}</div>
                        <span className="font-medium">Good value for money</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Product is as described. Good quality for the price.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">- Sarah M.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="delivery" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Delivery Information</h3>
                  <div className="space-y-3">
                    <p><span className="font-medium">Standard Delivery:</span> 3-5 business days</p>
                    <p><span className="font-medium">Express Delivery:</span> 1-2 business days (₹99 extra)</p>
                    <p><span className="font-medium">Free Delivery:</span> On orders above ₹499</p>
                    <p><span className="font-medium">Cash on Delivery:</span> Available</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      </div>
    </>
  );
};

export default ProductDetails;
