import { Product } from '../models/product';

export const DUMMY_PRODUCTS: Product[] = [
  { id: 1, title: 'Wireless Headphones', description: 'Noise-cancelling over-ear headphones with 30h battery.', category: 'Electronics', image: 'https://picsum.photos/seed/headphones/400', stock: 25, price: 99.99, rating: { rate: 4.5, count: 120 } },
  { id: 2, title: 'Smart Watch', description: 'Fitness tracking smartwatch with heart-rate monitor.', category: 'Electronics', image: 'https://picsum.photos/seed/watch/400', stock: 40, price: 149.5, rating: { rate: 4.2, count: 86 } },
  { id: 3, title: 'Cotton T-Shirt', description: 'Soft 100% cotton crew-neck t-shirt.', category: 'Apparel', image: 'https://picsum.photos/seed/tshirt/400', stock: 120, price: 19.99, rating: { rate: 4.0, count: 210 } },
  { id: 4, title: 'Denim Jacket', description: 'Classic denim jacket, unisex fit.', category: 'Apparel', image: 'https://picsum.photos/seed/denim/400', stock: 15, price: 59.0, rating: { rate: 4.6, count: 45 } },
  { id: 5, title: 'Ceramic Mug Set', description: 'Set of 4 matte ceramic coffee mugs.', category: 'Home', image: 'https://picsum.photos/seed/mug/400', stock: 60, price: 24.99, rating: { rate: 4.3, count: 132 } },
  { id: 6, title: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness.', category: 'Home', image: 'https://picsum.photos/seed/lamp/400', stock: 32, price: 34.5, rating: { rate: 4.1, count: 58 } },
  { id: 7, title: 'Sci-Fi Novel', description: 'Award-winning science fiction paperback.', category: 'Books', image: 'https://picsum.photos/seed/book/400', stock: 80, price: 14.99, rating: { rate: 4.8, count: 300 } },
  { id: 8, title: 'Cookbook', description: 'Modern home cooking recipes, hardcover.', category: 'Books', image: 'https://picsum.photos/seed/cookbook/400', stock: 22, price: 27.99, rating: { rate: 4.4, count: 74 } },
  { id: 9, title: 'Yoga Mat', description: 'Non-slip eco-friendly yoga mat.', category: 'Sports', image: 'https://picsum.photos/seed/yoga/400', stock: 50, price: 29.99, rating: { rate: 4.2, count: 97 } },
  { id: 10, title: 'Running Shoes', description: 'Lightweight cushioned running shoes.', category: 'Sports', image: 'https://picsum.photos/seed/shoes/400', stock: 0, price: 79.0, rating: { rate: 4.7, count: 150 } },
];