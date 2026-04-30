export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  categoryId: string;
  imageUrl: string;
  options?: {
    sugarLevels: string[];
    iceLevels: string[];
    toppings: { name: string; price: number }[];
  };
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  sugar: string;
  ice: string;
  toppings: string[];
}

export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: any; // Firestore Timestamp
}
