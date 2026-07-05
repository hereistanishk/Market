import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BuyerDashboard } from './components/BuyerDashboard';
import { SellerDashboard } from './components/SellerDashboard';
import { UserProfile } from './components/UserProfile';
import { Login } from './components/Login';
import { Product, ProfileData } from './types';
import { INITIAL_PRODUCTS } from './data';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, addDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mode, setMode] = useState<'buyer' | 'seller' | 'profile'>('buyer');
  const [activeProfileTab, setActiveProfileTab] = useState<'buyer' | 'seller'>('buyer');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [currentProfile, setCurrentProfile] = useState<ProfileData>({
    name: 'Default User',
    username: '@user',
    image: ''
  });

  useEffect(() => {
    let unsubscribeProducts: () => void;
    
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
          
        } catch (error) {
          console.error("Error fetching/creating profile:", error);
        }
      } else {
        if (unsubscribeProducts) unsubscribeProducts();
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubscribeProducts) unsubscribeProducts();
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

  const handleAddToCart = (product: Product) => {
    setCartCount(prev => prev + 1);
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
      <Header mode={mode} setMode={setMode} cartCount={cartCount} />
      
      <main className="relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          {mode === 'buyer' && (
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
              />
            </motion.div>
          )}
          {mode === 'seller' && (
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
          {mode === 'profile' && (
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
        </AnimatePresence>
      </main>
    </div>
  );
}
