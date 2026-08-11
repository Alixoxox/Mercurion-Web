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

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  stock: number;
  price: number;
  rating: {
    rate: number;
    count: number;
  };
}
export interface Feedback {
  id: number;
  value: number;
  comment: string | null;
  createdAt: string;
  feedbackImage: string | null;
  userName: string;
  userId: number;
}
