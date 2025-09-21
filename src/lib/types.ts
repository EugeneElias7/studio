
import type { User as FirebaseUser } from 'firebase/auth';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  category: string;
  subcategory?: string;
  stock: number;
};

export type Category = {
  id: string;
  name:string;
  subcategories: string[];
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

export type Address = {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
};

export type Order = {
  id: string;
  date: string; // Should be ISO string
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: Omit<CartItem, 'id' | 'imageUrl' | 'price' >[];
  total: number;
  shippingAddress: Address;
  userId: string;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  addresses: Address[];
}

export type AppUser = UserProfile & {
  orders: Order[];
} | null;
