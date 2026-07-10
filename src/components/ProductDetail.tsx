import React, { useState } from 'react';
import { Product } from '../types';
import { formatPrice } from '../utils';
import { ArrowLeft, Star, ShoppingCart, CreditCard, User, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductDetailProps {
  key?: React.Key;
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export function ProductDetail({ product, onBack, onAddToCart, onBuyNow }: ProductDetailProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isFullscreenViewerOpen, setIsFullscreenViewerOpen] = useState(false);

  // Simulated data for seller
  const productRating = 4.8;
  const reviews: { id: number; user: string; rating: number; comment: string; date: string }[] = [];
  const reviewCount = reviews.length;
  const sellerRating = 4.9;

  const nextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to listings
      </button>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Gallery */}
          <div 
            className="bg-gray-50 relative aspect-square md:aspect-auto md:h-full group cursor-pointer"
            onClick={() => setIsFullscreenViewerOpen(true)}
          >
            <img 
              src={product.images?.[currentImageIdx] || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgNTAwIDUwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0YTNiOSIgZGVtaW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            
            {product.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIdx(idx);
                      }}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentImageIdx ? 'bg-gray-900' : 'bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product Info */}
          <div className="p-8 flex flex-col">
            <h1 className="text-3xl font-sans font-semibold text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-medium text-gray-900">{productRating}</span>
              </div>
              <span className="text-gray-400 text-sm">({reviewCount} reviews)</span>
            </div>

            <div className="font-mono text-3xl font-medium text-gray-900 mb-6">
              ₹{formatPrice(product.price, product.displayPrice)}
            </div>

            <p className="text-gray-600 mb-8 whitespace-pre-wrap flex-grow">
              {product.description}
            </p>

            {/* Seller Profile */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-8 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Sold by {product.sellerName}</p>
                  <div className="flex items-center gap-1 text-xs text-yellow-500 mt-0.5">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="font-medium text-gray-700">{sellerRating} Seller Rating</span>
                  </div>
                </div>
              </div>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                View Store
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button 
                onClick={() => onAddToCart(product)}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-900 py-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button 
                onClick={() => onBuyNow(product)}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <div className="text-gray-500 bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
            No reviews yet. Be the first to review this product!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-medium text-sm">
                      {review.user.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{review.user}</p>
                      <p className="text-xs text-gray-500">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Image Viewer */}
      {isFullscreenViewerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <button
            onClick={() => setIsFullscreenViewerOpen(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full transition-colors z-[110]"
          >
            <X className="w-8 h-8" />
          </button>
          
          <img 
            src={product.images?.[currentImageIdx] || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgNTAwIDUwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0YTNiOSIgZGVtaW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'} 
            alt={product.name} 
            className="max-w-full max-h-[90vh] object-contain select-none"
          />

          {product.images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-all z-[110]"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-all z-[110]"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-[110]">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIdx(idx);
                    }}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      idx === currentImageIdx ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
