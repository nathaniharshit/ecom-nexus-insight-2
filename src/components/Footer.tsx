import React from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Send, Twitter, Instagram, Facebook, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section: Newsletter */}
        <div className="py-12 md:py-16 border-b border-gray-700/50 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Stay Ahead of the Curve</h2>
            <p className="mt-2 text-gray-400 max-w-lg">Subscribe to our newsletter for the latest products, exclusive deals, and insider tips.</p>
          </div>
          <form className="w-full max-w-md flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="flex-grow h-12 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary rounded-xl"
            />
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 bg-primary hover:bg-primary/90 rounded-xl flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>

        {/* Middle section: Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-12">
          {/* Logo and description */}
          <div className="col-span-2 lg:col-span-1">
            <div 
              className="flex items-center space-x-2 cursor-pointer group w-fit" 
              onClick={handleLogoClick}
            >
              <img
                src="https://i.pinimg.com/736x/f9/d9/50/f9d9500f878c6276356c9ce3eb00c882.jpg"
                alt="FlashCart logo"
                className="h-9 w-auto rounded-lg"
              />
              <span className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                FlashCart
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              The future of online shopping, delivered with speed and style.
            </p>
          </div>

          {/* Link columns */}
          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase text-sm">Shop</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/products" className="hover:text-primary transition-colors text-sm">All Products</Link></li>
              <li><Link to="/categories/electronics" className="hover:text-primary transition-colors text-sm">Electronics</Link></li>
              <li><Link to="/categories/fashion" className="hover:text-primary transition-colors text-sm">Fashion</Link></li>
              <li><Link to="/categories/home" className="hover:text-primary transition-colors text-sm">Home & Garden</Link></li>
              <li><Link to="/sale" className="hover:text-primary transition-colors text-sm text-red-400 font-medium">Sale</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase text-sm">Company</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/about" className="hover:text-primary transition-colors text-sm">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors text-sm">Careers</Link></li>
              <li><Link to="/press" className="hover:text-primary transition-colors text-sm">Press</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors text-sm">Blog</Link></li>
              <li><Link to="/analytics" className="hover:text-primary transition-colors text-sm">Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase text-sm">Support</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/contact" className="hover:text-primary transition-colors text-sm">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors text-sm">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors text-sm">Shipping & Returns</Link></li>
              <li><Link to="/track-order" className="hover:text-primary transition-colors text-sm">Track Your Order</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase text-sm">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/terms" className="hover:text-primary transition-colors text-sm">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-primary transition-colors text-sm">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom section: Copyright and Socials */}
        <div className="py-8 border-t border-gray-700/50 flex flex-col-reverse md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-500 text-center md:text-left">
            © {new Date().getFullYear()} FlashCart, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};
