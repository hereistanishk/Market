import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Product, CartItem } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (productId: string, delta: number) => void;
  onCheckout: () => void;
}

export function Cart({ isOpen, onClose, cartItems, updateQuantity, onCheckout }: CartProps) {
  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 right-0 w-full md:w-96 bg-gray-50 z-[101] shadow-xl flex flex-col"
          >
            <div className="bg-white px-4 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">My Cart</h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.productId} className="bg-white p-3 rounded-xl flex gap-3 shadow-sm border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.name}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-gray-900">₹{item.product.price.toFixed(2)}</span>
                        <div className="flex items-center bg-gray-100 text-gray-900 rounded-lg overflow-hidden">
                          <button onClick={() => updateQuantity(item.productId!, -1)} className="px-2 py-1 hover:bg-gray-200">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-2 text-sm font-medium min-w-[1.5rem] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId!, 1)} className="px-2 py-1 hover:bg-gray-200">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="bg-white p-4 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Bill total</span>
                  <span className="font-bold text-gray-900">₹{total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-between"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm leading-none">{cartItems.reduce((a, b) => a + b.quantity, 0)} items</span>
                    <span className="text-sm leading-none mt-1 opacity-90">₹{total.toFixed(2)}</span>
                  </div>
                  <span className="flex items-center gap-2">
                    Proceed to Pay <span className="text-lg">→</span>
                  </span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
