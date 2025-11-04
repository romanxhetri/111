export enum Dietary {
  Vegetarian = 'V',
  Vegan = 'VG',
  GlutenFree = 'GF',
}

export enum OrderType {
  Delivery = 'delivery',
  Pickup = 'pickup',
}

export interface CustomizationOption {
  name: string;
  price: number;
}

export interface CustomizationCategory {
  title: string;
  type: 'multi' | 'single';
  options: CustomizationOption[];
}

export interface SelectedCustomization {
  title: string;
  option: CustomizationOption;
}

export interface Review {
  author: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface NutritionalInfo {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  spicyLevel: 0 | 1 | 2 | 3;
  dietaryTags: Dietary[];
  isAvailable: boolean;
  customizationOptions?: CustomizationCategory[];
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  nutritionalInfo?: NutritionalInfo;
}

export interface Category {
  id: string;
  name: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
  cartItemId: string; // Unique ID for this item + customization combo
  selectedCustomizations?: SelectedCustomization[];
}

export interface ActiveOrder {
  id: string;
  estimatedTime: Date; // More generic than 'delivery' time
  orderType: OrderType;
  scheduledFor?: Date;
}

export interface User {
  name: string;
  email: string;
  spudPoints: number;
  badges: string[];
  avatar: {
    base: string;
    accessories: string[];
  }
  isAdmin?: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  totalPrice: number; // subtotal + tax + deliveryFee - discount
  date: string;
  orderType: OrderType;
  deliveryAddress?: string;
  pickupTime?: string; // This is a string like "15-20 mins" for immediate orders
  scheduledFor?: string; // ISO string for scheduled orders
  pointsEarned: number;
}

export interface PromoCode {
  code: string;
  discountPercentage: number;
  isActive: boolean;
}

export interface DailySpecial {
  itemId: number;
  specialPrice: number;
  description: string;
}