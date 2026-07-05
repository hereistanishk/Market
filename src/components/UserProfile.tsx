import React, { useState } from 'react';
import { User, Upload, Star, LogOut, Camera, Package, Store, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { ProfileData, BuyerProfile, SellerProfile, Address } from '../types';
import { ImageCropper } from './ImageCropper';

interface UserProfileProps {
  profile: ProfileData;
  setProfile: (profile: ProfileData) => Promise<void>;
  onLogout: () => void;
  initialTab?: 'buyer' | 'seller';
}

const emptyAddress: Address = {
  buildingNameOrNo: '',
  area1: '',
  area2: '',
  landmark: '',
  pincode: '',
  city: '',
  state: '',
  country: ''
};

export function UserProfile({ profile, setProfile, onLogout, initialTab = 'buyer' }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>(initialTab);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isEditing, setIsEditing] = useState<boolean>(!profile.buyerProfile?.name && !profile.sellerProfile?.businessName);
  const [cropImage, setCropImage] = useState<{ src: string, type: 'buyer' | 'seller' } | null>(null);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  React.useEffect(() => {
    if (profile.buyerProfile) setBuyerData(profile.buyerProfile);
    if (profile.sellerProfile) setSellerData(profile.sellerProfile);
  }, [profile]);

  const [buyerData, setBuyerData] = useState<BuyerProfile>(
    profile.buyerProfile || { name: '', username: '', address: emptyAddress }
  );
  
  const [sellerData, setSellerData] = useState<SellerProfile>(
    profile.sellerProfile || { businessName: '', businessUsername: '', businessType: '', businessAddress: emptyAddress }
  );

  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress as WEBP
          resolve(canvas.toDataURL('image/webp', 0.7));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleBuyerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          setCropImage({ src: reader.result as string, type: 'buyer' });
        };
        reader.readAsDataURL(e.target.files[0]);
      } catch (error) {
        console.error("Error reading image:", error);
      }
    }
    // reset input
    e.target.value = '';
  };

  const handleSellerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          setCropImage({ src: reader.result as string, type: 'seller' });
        };
        reader.readAsDataURL(e.target.files[0]);
      } catch (error) {
        console.error("Error reading image:", error);
      }
    }
    // reset input
    e.target.value = '';
  };

  const handleCropComplete = (croppedImage: string) => {
    if (cropImage?.type === 'buyer') {
      setBuyerData({ ...buyerData, image: croppedImage });
    } else if (cropImage?.type === 'seller') {
      setSellerData({ ...sellerData, image: croppedImage });
    }
    setCropImage(null);
  };

  const handleSaveProfiles = async () => {
    return setProfile({
      ...profile,
      buyerProfile: buyerData,
      sellerProfile: sellerData
    });
  };

  const renderAddressFields = (address: Address, onChange: (address: Address) => void) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Building Name / No.</label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
          value={address.buildingNameOrNo}
          onChange={(e) => onChange({ ...address, buildingNameOrNo: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Area 1</label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
          value={address.area1}
          onChange={(e) => onChange({ ...address, area1: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Area 2 <span className="text-gray-400 font-normal">(Optional)</span></label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
          value={address.area2 || ''}
          onChange={(e) => onChange({ ...address, area2: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Landmark <span className="text-gray-400 font-normal">(Optional)</span></label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
          value={address.landmark || ''}
          onChange={(e) => onChange({ ...address, landmark: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
          value={address.pincode}
          onChange={(e) => onChange({ ...address, pincode: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
          value={address.city}
          onChange={(e) => onChange({ ...address, city: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
          value={address.state}
          onChange={(e) => onChange({ ...address, state: e.target.value })}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
          value={address.country}
          onChange={(e) => onChange({ ...address, country: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-sans font-semibold tracking-tight text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-500">Manage your personal and business information.</p>
        </div>
      </div>

      <div>
        {/* Detailed Profiles (Buyer / Seller) */}
        <div className="w-full">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'buyer' ? 'Buyer Profile' : 'Seller Profile'}
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            <div className="p-6 sm:p-8">
              <div className="flex space-x-2 bg-gray-100/80 p-1.5 rounded-2xl mb-8">
                <button
                  onClick={() => setActiveTab('buyer')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeTab === 'buyer'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Buyer Profile
                </button>
                <button
                  onClick={() => setActiveTab('seller')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeTab === 'seller'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Seller Profile
                </button>
              </div>

              {!isEditing ? (
                <>
                  {activeTab === 'buyer' ? (
                    buyerData.name ? (
                      <div className="flex flex-col sm:flex-row gap-8 items-start">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0">
                          {buyerData.image ? (
                            <img src={buyerData.image} alt="Buyer" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-12 h-12 text-gray-400" />
                          )}
                        </div>
                        <div className="space-y-4 flex-grow w-full">
                          <div>
                            <h3 className="text-2xl font-semibold text-gray-900">{buyerData.name}</h3>
                            <p className="text-gray-500 font-medium">{buyerData.username}</p>
                          </div>
                          
                          <div className="pt-4 border-t border-gray-100">
                             <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Shipping Address</p>
                                <p className="text-gray-700">
                                  {buyerData.address.buildingNameOrNo}, {buyerData.address.area1}
                                  {buyerData.address.area2 ? `, ${buyerData.address.area2}` : ''}
                                </p>
                                <p className="text-gray-700">
                                  {buyerData.address.city}, {buyerData.address.state} {buyerData.address.pincode}
                                </p>
                                <p className="text-gray-700">{buyerData.address.country}</p>
                                {buyerData.address.landmark && (
                                   <p className="text-sm text-gray-500 mt-1">Landmark: {buyerData.address.landmark}</p>
                                )}
                             </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Buyer Profile</h3>
                        <p className="text-gray-500 mb-6">You haven't set up your buyer profile yet.</p>
                        <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">Create Profile</button>
                      </div>
                    )
                  ) : (
                    sellerData.businessName ? (
                      <div className="flex flex-col sm:flex-row gap-8 items-start">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0">
                          {sellerData.image ? (
                            <img src={sellerData.image} alt="Seller" className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-12 h-12 text-gray-400" />
                          )}
                        </div>
                        <div className="space-y-4 flex-grow w-full">
                          <div>
                            {sellerData.businessType && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">{sellerData.businessType}</span>
                              </div>
                            )}
                            <h3 className="text-2xl font-semibold text-gray-900">{sellerData.businessName}</h3>
                            <p className="text-gray-500 font-medium">{sellerData.businessUsername}</p>
                            {sellerData.businessTagline && (
                              <p className="text-gray-700 italic mt-2">"{sellerData.businessTagline}"</p>
                            )}
                          </div>
                          
                          <div className="pt-4 border-t border-gray-100">
                             <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Business Address</p>
                                <p className="text-gray-700">
                                  {sellerData.businessAddress.buildingNameOrNo}, {sellerData.businessAddress.area1}
                                  {sellerData.businessAddress.area2 ? `, ${sellerData.businessAddress.area2}` : ''}
                                </p>
                                <p className="text-gray-700">
                                  {sellerData.businessAddress.city}, {sellerData.businessAddress.state} {sellerData.businessAddress.pincode}
                                </p>
                                <p className="text-gray-700">{sellerData.businessAddress.country}</p>
                                {sellerData.businessAddress.landmark && (
                                   <p className="text-sm text-gray-500 mt-1">Landmark: {sellerData.businessAddress.landmark}</p>
                                )}
                             </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Seller Profile</h3>
                        <p className="text-gray-500 mb-6">You haven't set up your seller profile yet.</p>
                        <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">Create Profile</button>
                      </div>
                    )
                  )}
                  
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors shadow-sm"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {activeTab === 'buyer' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row gap-8 items-start">
                        <div className="flex-shrink-0">
                          <div className="relative w-32 h-32 group cursor-pointer">
                            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-4 border-white shadow-sm">
                              {buyerData.image ? (
                                <img src={buyerData.image} alt="Buyer Profile" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-12 h-12 text-gray-400" />
                              )}
                            </div>
                            <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <Camera className="w-8 h-8 text-white mb-1" />
                              <span className="text-white text-xs font-medium">Change</span>
                              <input type="file" accept="image/*" onChange={handleBuyerImageUpload} className="hidden" />
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex-grow w-full">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Buyer Details</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
                              <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
                                value={buyerData.name}
                                onChange={(e) => setBuyerData({ ...buyerData, name: e.target.value })}
                                placeholder="Your full name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Username</label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                  <span className="text-gray-500">@</span>
                                </div>
                                <input
                                  type="text"
                                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
                                  value={buyerData.username.startsWith('@') ? buyerData.username.slice(1) : buyerData.username}
                                  onChange={(e) => setBuyerData({ ...buyerData, username: '@' + e.target.value.replace(/^@/, '') })}
                                  placeholder="username"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                        <div>
                          {renderAddressFields(buyerData.address, (addr) => setBuyerData({ ...buyerData, address: addr }))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'seller' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row gap-8 items-start">
                        <div className="flex-shrink-0">
                          <div className="relative w-32 h-32 group cursor-pointer">
                            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-4 border-white shadow-sm">
                              {sellerData.image ? (
                                <img src={sellerData.image} alt="Seller Profile" className="w-full h-full object-cover" />
                              ) : (
                                <Store className="w-12 h-12 text-gray-400" />
                              )}
                            </div>
                            <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <Camera className="w-8 h-8 text-white mb-1" />
                              <span className="text-white text-xs font-medium">Change</span>
                              <input type="file" accept="image/*" onChange={handleSellerImageUpload} className="hidden" />
                            </label>
                          </div>
                        </div>

                        <div className="flex-grow w-full">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                              <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
                                value={sellerData.businessName}
                                onChange={(e) => setSellerData({ ...sellerData, businessName: e.target.value })}
                                placeholder="e.g. Lumina Home"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Business Username</label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                  <span className="text-gray-500">@</span>
                                </div>
                                <input
                                  type="text"
                                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
                                  value={sellerData.businessUsername.startsWith('@') ? sellerData.businessUsername.slice(1) : sellerData.businessUsername}
                                  onChange={(e) => setSellerData({ ...sellerData, businessUsername: '@' + e.target.value.replace(/^@/, '') })}
                                  placeholder="business_username"
                                />
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                              <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
                                value={sellerData.businessType}
                                onChange={(e) => setSellerData({ ...sellerData, businessType: e.target.value })}
                                placeholder="e.g. Retail, Electronics, Handmade"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Business Tagline <span className="text-gray-400 font-normal">(Optional)</span></label>
                              <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
                                value={sellerData.businessTagline || ''}
                                onChange={(e) => setSellerData({ ...sellerData, businessTagline: e.target.value })}
                                placeholder="A short catchy phrase for your business"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Address</h3>
                        <div>
                          {renderAddressFields(sellerData.businessAddress, (addr) => setSellerData({ ...sellerData, businessAddress: addr }))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="w-1/3 bg-gray-100 text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          setSaveStatus('saving');
                          try {
                            await handleSaveProfiles();
                            setSaveStatus('saved');
                            setIsEditing(false);
                            setTimeout(() => setSaveStatus('idle'), 3000);
                          } catch (error) {
                            console.error("Save failed", error);
                            setSaveStatus('error');
                            setTimeout(() => setSaveStatus('idle'), 3000);
                          }
                        }}
                        disabled={saveStatus === 'saving'}
                        className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-70"
                      >
                        {saveStatus === 'idle' && 'Save Profile'}
                        {saveStatus === 'saving' && 'Saving...'}
                        {saveStatus === 'saved' && 'Saved Successfully!'}
                        {saveStatus === 'error' && 'Error Saving Profile'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {cropImage && (
        <ImageCropper
          imageSrc={cropImage.src}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImage(null)}
        />
      )}
    </div>
  );
}

