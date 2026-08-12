export type OrderStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface PastOrder {
  id: number;
  orderDate: string;
  totalAmount: number;
  phoneNumber: string;
  city: string;
  country: string;
  postalCode: string;
  address: string;
  status: OrderStatus;
}



export interface OrderItem {
  id: number;
  title: string;
  image: string;
  category: string;
  quantity: number;
  priceAtPurchase: number;
}