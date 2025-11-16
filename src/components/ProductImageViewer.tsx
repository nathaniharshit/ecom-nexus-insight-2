import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface ProductImageViewerProps {
  images: string[];
  productName: string;
  mainImage?: string;
}

export function ProductImageViewer({ images, productName, mainImage }: ProductImageViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Combine main image with additional images
  const allImages = [
    ...(mainImage ? [mainImage] : []),
    ...(images || [])
  ].filter(img => img && img.trim() !== '');

  if (allImages.length === 0) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    setIsZoomed(false);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    setIsZoomed(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="backdrop-blur-sm bg-background/80 hover:bg-background">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 bg-background">
        <div className="flex h-full">
          {/* Thumbnail Sidebar */}
          {allImages.length > 1 && (
            <div className="w-24 bg-muted/30 p-2 overflow-y-auto border-r">
              <div className="space-y-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setIsZoomed(false);
                    }}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover:border-primary/50 ${
                      index === currentImageIndex 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${productName} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Image Area */}
          <div className="flex-1 relative bg-background">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-background/90 to-transparent p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">{productName}</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="backdrop-blur-sm"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Image */}
            <div className="h-full flex items-center justify-center p-4 pt-20 pb-16">
              <div className="relative max-w-full max-h-full">
                <img
                  src={allImages[currentImageIndex]}
                  alt={`${productName} - Image ${currentImageIndex + 1}`}
                  className={`max-w-full max-h-full object-contain transition-transform duration-300 cursor-zoom-in ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
              </div>
            </div>

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background border-border"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background border-border"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {allImages.length > 1 && (
                    <>
                      <span className="text-sm text-muted-foreground">
                        {currentImageIndex + 1} of {allImages.length}
                      </span>
                      {/* Dot Indicators */}
                      <div className="flex gap-1">
                        {allImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setCurrentImageIndex(index);
                              setIsZoomed(false);
                            }}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex 
                                ? 'bg-primary' 
                                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {isZoomed && (
                  <span className="text-xs text-muted-foreground">Click image to zoom out</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}