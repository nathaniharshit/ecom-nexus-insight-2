import heroImage from '../assets/hero-ecommerce.jpg';
import { Button } from '../components/ui/button';
import { ArrowRight, ShoppingBag, Star, TrendingUp, Sparkles, Zap, Package } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  onMakeAppointment?: () => void;
  onLearnMore?: () => void;
  onViewOffers?: () => void;
}

export const HeroSection = (props: HeroSectionProps) => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Enhanced Background elements with mesh gradient */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-cyan-300/20 to-blue-300/20 rounded-full blur-3xl"
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      {/* Main content */}
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between relative z-10 px-4 sm:px-6 lg:px-8 py-12 lg:py-20 gap-12 lg:gap-16">
        {/* Text Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl lg:w-1/2 space-y-8"
        >
          {/* Premium Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/50 text-blue-700 px-5 py-2 rounded-full font-medium text-sm shadow-lg shadow-blue-100/50"
          >
            <Sparkles className="w-4 h-4 fill-current animate-pulse" />
            <span>Premium Shopping Experience</span>
            <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-bold">NEW</span>
          </motion.div>
          
          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight"
          >
            Discover the{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Best
              </span>
              <motion.span 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute bottom-2 left-0 h-3 bg-gradient-to-r from-blue-400/40 to-purple-400/40 -z-0 blur-sm"
              />
            </span>
            {' '}in Online Shopping
          </motion.h1>
          
          {/* Description */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-gray-600 text-lg sm:text-xl leading-relaxed"
          >
            Your one-stop destination for premium products, unbeatable prices, and seamless shopping. 
            <span className="font-semibold text-gray-800"> Discover top brands, trending gadgets, and stylish fashion.</span>
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-7 rounded-2xl font-semibold text-base shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 group border-0 relative overflow-hidden"
              onClick={() => {
                const el = document.getElementById('products');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <ShoppingBag className="w-5 h-5" />
              Start Shopping Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-blue-200 bg-white/80 backdrop-blur-sm hover:bg-blue-50 hover:border-blue-300 text-blue-700 hover:text-blue-800 px-8 py-7 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={props.onViewOffers}
            >
              <Zap className="w-5 h-5 mr-2" />
              View Special Offers
            </Button>
          </motion.div>
          
          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-200/50"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white" />
                ))}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">10,000+</p>
                <p className="text-gray-500 text-xs">Happy Customers</p>
              </div>
            </div>
            
            <div className="h-8 w-px bg-gray-300" />
            
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">4.9/5</p>
                <p className="text-gray-500 text-xs">Rating</p>
              </div>
            </div>
            
            <div className="h-8 w-px bg-gray-300" />
            
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              <div className="text-sm">
                <p className="font-semibold text-gray-900">Free Shipping</p>
                <p className="text-gray-500 text-xs">On orders $50+</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, rotateY: -15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="lg:w-1/2 w-full max-w-2xl relative"
        >
          <div className="relative perspective-1000">
            {/* Main image container */}
            <div className="relative z-10 group">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5">
                <img 
                  src={heroImage} 
                  alt="Shopping Experience" 
                  className="w-full h-auto object-cover aspect-[4/3] transition-transform duration-700 group-hover:scale-105" 
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                
                {/* Floating discount badge */}
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1, type: "spring", stiffness: 200 }}
                  className="absolute top-6 right-6 bg-gradient-to-br from-red-500 to-pink-600 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-red-500/50 backdrop-blur-sm"
                >
                  <p className="text-xs font-medium opacity-90">Up to</p>
                  <p className="text-2xl font-black leading-none">30% OFF</p>
                </motion.div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-2xl -z-10 group-hover:blur-3xl transition-all duration-500" />
            </div>
            
            {/* Decorative elements */}
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full z-0 opacity-90 blur-sm"
            />
            <motion.div 
              animate={{ 
                rotate: -360,
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full z-0 opacity-90 blur-sm"
            />
            
            {/* Floating stats card */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8, type: "spring" }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="absolute -bottom-12 -left-8 lg:-left-12 bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl z-20 border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <ShoppingBag className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Happy Customers</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">10,000+</p>
                </div>
              </div>
            </motion.div>
            
            {/* Floating product card */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8, type: "spring" }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="absolute -top-8 -right-8 lg:-right-12 bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl z-20 border border-gray-100 max-w-[180px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Trending</p>
                  <p className="text-lg font-bold text-gray-900">Today</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}