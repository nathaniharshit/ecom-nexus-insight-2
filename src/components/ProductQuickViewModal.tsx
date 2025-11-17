import React from 'react';
import { X } from 'lucide-react';
import { Product } from '../hooks/useProducts';

interface ProductQuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductQuickViewModal = ({ product, onClose }: ProductQuickViewModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Product Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            {product.images?.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} - Image ${index + 1}`}
                className="w-full h-auto rounded-lg shadow-sm"
              />
            ))}
          </div>

          {/* Product Details */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <p className="text-sm text-gray-600">{product.description}</p>
            <div className="text-lg font-bold text-primary">
              ₹{product.price.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
