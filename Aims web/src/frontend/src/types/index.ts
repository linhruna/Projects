// Types for the AIMS application

export type ProductType = 'book' | 'newspaper' | 'cd' | 'dvd';

export interface BaseProduct {
  id: string;
  name: string;
  originalValue: number; // Original value of the product
  price: number; // Current selling price (must be 30%-150% of originalValue)
  type: ProductType;
  image: string;
  stock: number;
  weight: number; // in kg
  description: string;
  isActive: boolean;
}

export interface Book extends BaseProduct {
  type: 'book';
  author: string;
  coverType: string;
  publisher: string;
  publicationDate: string;
  pages: number;
  language: string;
  genre: string;
}

export interface Newspaper extends BaseProduct {
  type: 'newspaper';
  editor: string;
  publisher: string;
  publicationDate: string;
  issueNumber: string;
  frequency: string;
  issn: string;
  language: string;
  sections: string[];
}

export interface CD extends BaseProduct {
  type: 'cd';
  artist: string;
  recordLabel: string;
  tracks: { name: string; duration: string }[];
  genre: string;
  releaseDate: string;
}

export interface DVD extends BaseProduct {
  type: 'dvd';
  discType: string;
  director: string;
  runtime: number; // in minutes
  studio: string;
  language: string;
  subtitles: string[];
  releaseDate: string;
  genre: string;
}

export type Product = Book | Newspaper | CD | DVD;

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'productManager' | 'admin';
  isBlocked: boolean;
}

export interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  email?: string; // Optional for backward compatibility
}

export interface ProductHistory {
  id: string;
  productId: string;
  productName: string;
  action: 'add' | 'edit' | 'delete' | 'deactivate';
  timestamp: string;
  user: string;
}
