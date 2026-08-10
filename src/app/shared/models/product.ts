export interface ProductRating {
  id?: number;
  value: number;
  comment?: string | null;
}

export interface ProductWishlistedBy {
  id: number;
  userId?: number;
  addedAt?: string;
}

export interface BackendProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  stock: number;
  price: number;
  ratings?: ProductRating[];
  wishlistedBy?: ProductWishlistedBy[];
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  stock?: number;
  wishlistedBy?: ProductWishlistedBy[];
  rating: {
    rate: number;
    count: number;
  };
}
