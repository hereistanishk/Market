import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BuyerDashboard } from './components/BuyerDashboard';
import { SellerDashboard } from './components/SellerDashboard';
import { UserProfile } from './components/UserProfile';
import { Login } from './components/Login';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { FooterNav } from './components/FooterNav';
import { Product, ProfileData, CartItem } from './types';
import { INITIAL_PRODUCTS } from './data';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, addDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appSection, setAppSection] = useState<'shop' | 'freelance' | 'message' | 'dropship' | 'browse' | 'profile' | 'checkout'>('shop');
  const [userRole, setUserRole] = useState<'buyer' | 'seller'>('buyer');
  const [activeProfileTab, setActiveProfileTab] = useState<'buyer' | 'seller'>('buyer');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<{product: Product, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [currentProfile, setCurrentProfile] = useState<ProfileData>({
    name: 'Default User',
    username: '@user',
    image: ''
  });

  useEffect(() => {
    let unsubscribeProducts: () => void;
    let unsubscribeCart: () => void;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthenticated(!!user);
      if (user) {
        try {
          const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
          if (profileDoc.exists()) {
            setCurrentProfile(profileDoc.data() as ProfileData);
          } else {
            const newProfile: (ProfileData & { createdAt: any, updatedAt: any }) | any = {
              name: user.displayName || user.email?.split('@')[0] || 'User',
              username: '@' + (user.email?.split('@')[0] || 'user'),
              image: user.photoURL || '',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            await setDoc(doc(db, 'profiles', user.uid), newProfile);
            setCurrentProfile({
              name: newProfile.name,
              username: newProfile.username,
              image: newProfile.image
            });
          }
          
          // Subscribe to products
          const q = query(collection(db, 'products'));
          unsubscribeProducts = onSnapshot(q, (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Product[];
            setProducts(productsData);
          }, (error) => {
            console.error("Error fetching products:", error);
          });
          
          // Subscribe to cart items
          const cartQ = query(collection(db, 'profiles', user.uid, 'cartItems'));
          unsubscribeCart = onSnapshot(cartQ, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as CartItem[];
            setCartItems(items);
          }, (error: any) => {
            if (error.code === 'permission-denied') return; // Ignore on logout
            console.error("Error fetching cart items:", error);
          });
          
        } catch (error) {
          console.error("Error fetching/creating profile:", error);
        }
      } else {
        if (unsubscribeProducts) unsubscribeProducts();
        if (unsubscribeCart) unsubscribeCart();
        setCartItems([]);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeCart) unsubscribeCart();
    };
  }, []);

  const handleUpdateProfile = async (updatedProfile: ProfileData) => {
    if (!currentUser) return;
    
    // Optimistic update
    setCurrentProfile(updatedProfile);
    
    try {
      const updateData: any = {
        name: updatedProfile.name,
        username: updatedProfile.username,
        image: updatedProfile.image,
        updatedAt: serverTimestamp()
      };
      
      if (updatedProfile.buyerProfile) {
        updateData.buyerProfile = updatedProfile.buyerProfile;
      }
      
      if (updatedProfile.sellerProfile) {
        updateData.sellerProfile = updatedProfile.sellerProfile;
      }

      await updateDoc(doc(db, 'profiles', currentUser.uid), updateData);
    } catch (error) {
      console.error("Error updating profile:", error);
      handleFirestoreError(error, OperationType.UPDATE, 'profiles');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMode('buyer');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const handleBuyNow = (product: Product) => {
    if (!currentUser) {
      setMode('profile');
      return;
    }
    setCheckoutItems([{ product, quantity: 1 }]);
    setAppSection('checkout');
  };

  const handleCheckoutCart = () => {
    if (!currentUser) {
      setMode('profile');
      return;
    }
    setIsCartOpen(false);
    setCheckoutItems(cartItems.map(item => ({ product: item.product, quantity: item.quantity })));
    setMode('checkout');
  };

  const handlePlaceOrder = async () => {
    setCheckoutItems([]);
    setMode('buyer');
    
    // Clear cart if the items were from the cart
    if (currentUser) {
      try {
        cartItems.forEach(async (item) => {
          if (item.productId) {
            const cartRef = doc(db, 'profiles', currentUser.uid, 'cartItems', item.productId);
            await deleteDoc(cartRef);
          }
        });
      } catch (error) {
        console.error("Error clearing cart after order", error);
      }
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!currentUser) {
      setMode('profile');
      return;
    }
    
    if (!product.id) return;
    
    const existing = cartItems.find(item => item.productId === product.id);
    const cartRef = doc(db, 'profiles', currentUser.uid, 'cartItems', product.id);
    
    try {
      if (existing) {
        await updateDoc(cartRef, {
          quantity: existing.quantity + 1
        });
      } else {
        await setDoc(cartRef, {
          product: {
            name: product.name,
            description: product.description,
            price: product.price,
            images: product.images,
            sellerId: product.sellerId,
            sellerName: product.sellerName
          },
          productId: product.id,
          quantity: 1,
          addedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error adding to cart", error);
      handleFirestoreError(error, OperationType.WRITE, `profiles/${currentUser.uid}/cartItems`);
    }
  };

  const updateCartQuantity = async (productId: string, delta: number) => {
    if (!currentUser) return;
    const existing = cartItems.find(item => item.productId === productId);
    if (!existing) return;
    
    const newQuantity = existing.quantity + delta;
    const cartRef = doc(db, 'profiles', currentUser.uid, 'cartItems', productId);
    
    try {
      if (newQuantity <= 0) {
        await deleteDoc(cartRef);
      } else {
        await updateDoc(cartRef, {
          quantity: newQuantity
        });
      }
    } catch (error) {
      console.error("Error updating cart quantity", error);
      handleFirestoreError(error, OperationType.UPDATE, `profiles/${currentUser.uid}/cartItems`);
    }
  };

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    try {
      await addDoc(collection(db, 'products'), newProduct);
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error("Error deleting product: ", error);
    }
  };

  const handleEditProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), updatedProduct);
    } catch (error) {
      console.error("Error editing product: ", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex justify-center items-center">Loading...</div>;
  }

  if (!isAuthenticated || !currentUser) {
    // The Login component will handle the firebase auth which will trigger the onAuthStateChanged.
    // For fallback when email is needed by UI (e.g. no google popup worked), you could still intercept.
    // But Login directly interfaces with Firebase Auth now.
    return <Login onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">
      <Header userRole={userRole} setUserRole={setUserRole} onProfileClick={() => setAppSection('profile')} isProfileActive={appSection === 'profile'} cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} onCartClick={() => setIsCartOpen(true)} />
      
      <main className="relative overflow-x-hidden pb-20">
        <AnimatePresence mode="wait">
          {appSection === 'shop' && userRole === 'buyer' && (
            <motion.div
              key="buyer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <BuyerDashboard 
                products={products} 
                onAddToCart={handleAddToCart} 
                onBuyNow={handleBuyNow}
              />
            </motion.div>
          )}
          {appSection === 'shop' && userRole === 'seller' && (
            <motion.div
              key="seller"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SellerDashboard 
                products={products}
                sellerId={currentUser.uid}
                sellerName={currentProfile.sellerProfile?.businessName || currentProfile.name}
                onAddProduct={handleAddProduct}
                onDeleteProduct={handleDeleteProduct}
                onEditProduct={handleEditProduct}
                isSellerProfileComplete={!!(currentProfile.sellerProfile?.businessName && currentProfile.sellerProfile?.businessUsername)}
                onGoToProfile={() => {
                  setActiveProfileTab('seller');
                  setMode('profile');
                }}
              />
            </motion.div>
          )}
          {appSection === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <UserProfile 
                profile={currentProfile} 
                setProfile={handleUpdateProfile} 
                onLogout={handleLogout} 
                initialTab={activeProfileTab}
              />
            </motion.div>
          )}

          {appSection === 'checkout' && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10"
            >
              <Checkout 
                products={checkoutItems}
                profile={currentProfile}
                onBack={() => setAppSection('shop')}
                onPlaceOrder={handlePlaceOrder}
              />
            </motion.div>
          )}
          
          {appSection === 'freelance' && (
            <motion.div
              key="freelance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10 flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
            >
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Freelance Marketplace</h2>
              <p className="text-gray-500 max-w-sm mb-6">
                {userRole === 'buyer' 
                  ? 'Opt for freelance work and hire talented professionals. Feature coming soon.' 
                  : 'Publish your gig and find freelance work. Feature coming soon.'}
              </p>
            </motion.div>
          )}
{appSection === 'message' && (
            <motion.div
              key="message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10 flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
              <p className="text-gray-500 max-w-sm">{userRole === 'buyer' ? 'Connect with buyers and sellers in real-time. Message feature coming soon.' : 'Message with sellers and buyers both. Message feature coming soon.'}</p>
            </motion.div>
          )}
          
          {appSection === 'dropship' && (
            <motion.div
              key="dropship"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10 flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
            >
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Drop Shipping</h2>
              <p className="text-gray-500 max-w-sm">Manage your drop shipping products and orders. Feature coming soon.</p>
            </motion.div>
          )}
{appSection === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10 flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
            >
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse & Settings</h2>
              <p className="text-gray-500 max-w-sm">Settings and other features coming soon.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateCartQuantity}
        onCheckout={handleCheckoutCart}
      />
      <FooterNav appSection={appSection} setAppSection={setAppSection} />
    </div>
  );
}
