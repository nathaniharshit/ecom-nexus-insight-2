import { useState } from 'react';
import { User, Menu, Search, Heart, X, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

interface HeaderProps {
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onAdminClick?: () => void;
  isLoggedIn?: boolean;
  userRole?: 'customer' | 'admin';
  userName?: string;
  onSearch?: (query: string) => void;
  onCartClick?: () => void;
}

export const Header = ({ 
  onLoginClick, 
  onLogoutClick,
  onAdminClick,
  isLoggedIn = false,
  userRole = 'customer',
  userName = '',
  onSearch,
  onCartClick
}: HeaderProps) => {
  const navigate = useNavigate();
  const handleSignInClick = () => {
    navigate('/auth');
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { products } = useProducts();
  const { wishlistItems } = useWishlist();
  const { getCartItemCount } = useCart();

  const handleLogoClick = () => {
    window.location.href = '/';
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (onSearch) {
      onSearch(query);
    }
    
    if (query.trim() !== '') {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5));
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches([searchQuery, ...recentSearches.slice(0, 4)]);
      }
      if (onSearch) {
        onSearch(searchQuery);
      }
      setIsSearchOpen(false);
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setSearchResults([]);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Logo */}
        <div 
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group flex-shrink-0" 
          onClick={handleLogoClick}
        >
          <div className="relative">
            <img
              src="https://i.pinimg.com/736x/f9/d9/50/f9d9500f878c6276356c9ce3eb00c882.jpg"
              alt="SmartCart logo"
              className="h-9 sm:h-11 w-auto rounded-lg transition-transform duration-200 group-hover:scale-105"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-200">
            SmartCart
          </span>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8">
          <form onSubmit={handleSearchSubmit} className="relative w-full group">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Search for products, brands, and more..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                className="pl-10 pr-10 h-11 bg-muted/30 border border-border/50 rounded-xl focus:bg-background focus:border-primary/50 transition-all duration-200 focus:shadow-lg focus:shadow-primary/5 focus:ring-2 focus:ring-primary/20"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {isSearchOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-popover/95 backdrop-blur-xl rounded-xl shadow-2xl border border-border/50 z-50 max-h-96 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {searchResults.length > 0 ? (
                  <div className="overflow-auto max-h-96 py-2">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" />
                      Search Results
                    </div>
                    {searchResults.map((product, index) => (
                      <div 
                        key={product.id}
                        className="mx-2 px-3 py-2.5 hover:bg-accent rounded-lg cursor-pointer flex items-center gap-3 transition-colors duration-150 group"
                        onClick={() => handleProductClick(product.id)}
                      >
                        <div className="h-12 w-12 bg-muted rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-border/50 group-hover:ring-primary/50 transition-all">
                          {product.image_url && (
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate capitalize">{product.category}</p>
                        </div>
                        <div className="text-sm font-semibold text-primary">₹{product.price.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No products found
                  </div>
                ) : recentSearches.length > 0 && (
                  <div className="py-2">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Recent Searches
                    </div>
                    {recentSearches.map((search, idx) => (
                      <div
                        key={idx}
                        className="mx-2 px-3 py-2 hover:bg-accent rounded-lg cursor-pointer text-sm transition-colors duration-150"
                        onClick={() => {
                          setSearchQuery(search);
                          handleSearchChange({ target: { value: search } } as any);
                        }}
                      >
                        {search}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Insights (admin only) */}
          {userRole === 'admin' && (
            <Button
              variant="ghost"
              className="hidden md:flex rounded-xl hover:bg-accent transition-all"
              onClick={() => navigate('/analytics')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Insights
            </Button>
          )}

          {/* Cart */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative hover:bg-accent rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 h-10 w-10"
                  onClick={onCartClick}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {getCartItemCount() > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] rounded-full px-1 flex items-center justify-center text-[10px] font-bold shadow-lg animate-in zoom-in duration-200"
                    >
                      {getCartItemCount()}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-popover/95 backdrop-blur-sm">
                <p className="text-xs">Shopping Cart</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Wishlist */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative hover:bg-accent rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 h-10 w-10"
                  onClick={() => navigate('/wishlist')}
                >
                  <Heart className="w-5 h-5" />
                  {wishlistItems.length > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] rounded-full px-1 flex items-center justify-center text-[10px] font-bold shadow-lg animate-in zoom-in duration-200"
                    >
                      {wishlistItems.length}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-popover/95 backdrop-blur-sm">
                <p className="text-xs">Wishlist</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-accent rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 h-10 w-10"
              >
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-xl border-border/50">
              {!isLoggedIn ? (
                <>
                  <DropdownMenuItem onClick={handleSignInClick} className="cursor-pointer rounded-lg">
                    <span className="font-medium">Sign In</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLoginClick} className="cursor-pointer rounded-lg">
                    Sign Up
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  {userName && (
                    <>
                      <div className="px-2 py-2.5 text-sm">
                        <p className="font-semibold text-foreground">Hello, {userName.split(' ')[0]}!</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Welcome back</p>
                      </div>
                      <DropdownMenuSeparator className="bg-border/50" />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer rounded-lg">
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer rounded-lg">
                    My Orders
                  </DropdownMenuItem>
                  {userRole === 'admin' && onAdminClick && (
                    <>
                      <DropdownMenuSeparator className="bg-border/50" />
                      <DropdownMenuItem onClick={onAdminClick} className="cursor-pointer rounded-lg text-primary">
                        <span className="font-medium">Admin Dashboard</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem onClick={onLogoutClick} className="cursor-pointer rounded-lg text-destructive focus:text-destructive">
                    Sign Out
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden hover:bg-accent rounded-xl transition-all duration-200 h-10 w-10"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Search - Visible on mobile */}
      <div className="md:hidden px-4 pb-3 pt-1">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 h-10 bg-muted/30 border border-border/50 rounded-xl focus:bg-background focus:border-primary/50 transition-all"
          />
        </form>
      </div>
    </header>
  );
};
