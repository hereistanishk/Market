export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sellerId: string;
  sellerName: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt?: number;
  id?: string;
  productId?: string;
}

export interface Address {
  buildingNameOrNo: string;
  area1: string;
  area2?: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
}

export interface BuyerProfile {
  name: string;
  username: string;
  image?: string;
  address: Address;
}

export interface SellerProfile {
  businessName: string;
  businessUsername: string;
  image?: string;
  businessType: string;
  businessTagline?: string;
  businessAddress: Address;
}

export interface ProfileData {
  name: string;
  username: string;
  image: string;
  buyerProfile?: BuyerProfile;
  sellerProfile?: SellerProfile;
}
