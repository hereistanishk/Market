import React from 'react';
import { ShoppingBag, Store, User } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  userRole: 'buyer' | 'seller';
  setUserRole: (role: 'buyer' | 'seller') => void;
  onProfileClick: () => void;
  isProfileActive: boolean;
  cartCount: number;
  onCartClick: () => void;
}

export function Header({ userRole, setUserRole, onProfileClick, isProfileActive, cartCount, onCartClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg leading-none">M</span>
          </div>
          <span className="font-sans font-semibold text-xl tracking-tight text-gray-900 hidden sm:block">Market</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setUserRole('buyer')}
              className={`relative px-3 sm:px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                userRole === 'buyer' ? 'text-gray-900' : 'text-gray-800 hover:text-gray-900'
              }`}
            >
              {userRole === 'buyer' && (
                <motion.div
                  layoutId="mode-pill"
                  className="absolute inset-0 bg-white shadow-sm rounded-md"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Buyer</span>
              </span>
            </button>
            <button
              onClick={() => setUserRole('seller')}
              className={`relative px-3 sm:px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                userRole === 'seller' ? 'text-gray-900' : 'text-gray-800 hover:text-gray-900'
              }`}
            >
              {userRole === 'seller' && (
                <motion.div
                  layoutId="mode-pill"
                  className="absolute inset-0 bg-white shadow-sm rounded-md"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                <Store className="w-4 h-4" />
                <span>Seller</span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {userRole === 'buyer' && (
              <button 
                onClick={onCartClick}
                className="relative flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="font-medium text-sm hidden sm:block">Cart</span>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gray-900 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>
            )}
            
            <div className="relative">
              <button
                onClick={onProfileClick}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ml-2 border ${
                  isProfileActive ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                }`}
                title="Profile"
              >
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
