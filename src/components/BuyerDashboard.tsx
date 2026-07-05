import React, { useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ProductDetail } from './ProductDetail';
import { Search } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

interface BuyerDashboardProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function BuyerDashboard({ products, onAddToCart }: BuyerDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {selectedProduct ? (
          <ProductDetail 
            key="detail"
            product={selectedProduct} 
            onBack={() => setSelectedProduct(null)} 
            onAddToCart={onAddToCart} 
          />
        ) : (
          <div key="grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-sans font-semibold tracking-tight text-gray-900 mb-2">Discover</h1>
                <p className="text-gray-500">Find something you love from independent sellers.</p>
              </div>
              
              <div className="relative group max-w-md w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gray-900 transition-colors">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all sm:text-sm"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 mt-8">
                <p className="text-gray-500">No products found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={onAddToCart} 
                    onClick={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
