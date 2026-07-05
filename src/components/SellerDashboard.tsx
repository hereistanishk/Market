import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Package, IndianRupee, TrendingUp, X, Upload, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageCropper } from './ImageCropper';

interface SellerDashboardProps {
  products: Product[];
  sellerId: string;
  sellerName: string;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  isSellerProfileComplete: boolean;
  onGoToProfile: () => void;
}

export function SellerDashboard({ products, sellerId, sellerName, onAddProduct, onEditProduct, onDeleteProduct, isSellerProfileComplete, onGoToProfile }: SellerDashboardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const myProducts = products.filter(p => p.sellerId === sellerId);
  const totalValue = myProducts.reduce((sum, p) => sum + p.price, 0);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    images: [] as string[]
  });

  const [cropImage, setCropImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImage(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
    // reset input
    e.target.value = '';
  };

  const handleCropComplete = (croppedImage: string) => {
    if (formData.images.length < 5) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, croppedImage]
      }));
    }
    setCropImage(null);
  };


  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddClick = () => {
    setEditingProductId(null);
    setFormData({ name: '', price: '', description: '', images: [] });
    setIsAdding(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      images: product.images || []
    });
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.description || formData.images.length === 0) return;

    if (editingProductId) {
      onEditProduct(editingProductId, {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        images: formData.images
      });
    } else {
      onAddProduct({
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        images: formData.images,
        sellerId: sellerId,
        sellerName: sellerName
      });
    }
    
    setIsAdding(false);
    setEditingProductId(null);
    setFormData({ name: '', price: '', description: '', images: [] });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-sans font-semibold tracking-tight text-gray-900 mb-2">Storefront</h1>
          <p className="text-gray-500">Manage your active listings and track performance.</p>
        </div>
        {isSellerProfileComplete && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Listing</span>
          </button>
        )}
      </div>

      {!isSellerProfileComplete && (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-yellow-900">Complete Your Seller Profile</h3>
            <p className="text-yellow-700 mt-1">You need to set up your business details before you can list products.</p>
          </div>
          <button 
            onClick={onGoToProfile}
            className="bg-yellow-900 text-yellow-50 px-5 py-2 rounded-xl font-medium hover:bg-yellow-800 transition-colors whitespace-nowrap"
          >
            Go to Profile
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Listings</p>
              <p className="text-2xl font-semibold text-gray-900">{myProducts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-xl text-green-600">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Inventory Value (Est.)</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900">{myProducts.length * 142}</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xl relative w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10"
            >
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"  
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingProductId ? 'Edit Listing' : 'Create New Listing'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:bg-white transition-colors"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Modern Table Lamp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:bg-white transition-colors"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="49.99"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Images (Up to 5)</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group border border-gray-200">
                          <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-white/90 text-red-500 p-1.5 rounded-full shadow-sm hover:bg-white transition-colors flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      
                      {formData.images.length < 5 && (
                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-900 bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-colors relative">
                          <Upload className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500 font-medium">Add Photo</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:bg-white transition-colors resize-none"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe your product..."
                    />
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end mt-2">
                  <button type="submit" className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors">
                    {editingProductId ? 'Save Changes' : 'Publish Listing'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Your Products</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {myProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              You haven't listed any products yet.
            </div>
          ) : (
            myProducts.map(product => (
              <div key={product.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 hover:bg-gray-50 transition-colors">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <img src={product.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgNTAwIDUwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0YTNiOSIgZGVtaW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow text-center sm:text-left">
                  <h4 className="font-medium text-gray-900 text-lg">{product.name}</h4>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                </div>
                <div className="flex items-center gap-3 mt-4 sm:mt-0">
                  <span className="font-mono font-medium text-gray-900 mr-3">₹{product.price.toFixed(2)}</span>
                  <button 
                    onClick={() => handleEditClick(product)}
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                    title="Edit listing"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => onDeleteProduct(product.id)}
                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                    title="Delete listing"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {cropImage && (
        <ImageCropper
          imageSrc={cropImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImage(null)}
        />
      )}
    </div>
  );
}
