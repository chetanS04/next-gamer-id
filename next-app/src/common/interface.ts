export interface LoginFormData {
  email: string;
  password: string;
}

export enum UserRole {
  VISITOR = 0,
  BUYER = 1,
  SELLER = 2,
  ADMIN = 3,
}

export interface RegisterUser {
  phone_number: string;
  username: string;
  password_confirmation: string;
  password: string;
  email: string;
  name: string;
  store_name: string;
  user_status?: string; // Make user_status optional
}

export interface GameField {
  id: number;
  label: string;
  value: string;
  type: "text" | "number";
  icon?: string;
  required?: boolean;
}

export interface Game {
  id: number;
  seller_id: number;
  name: string;
  price: string;
  description: string;
  primary_image?: string;
  secondary_image?: string;
  game_image1?: string | null;
  game_image2?: string | null;
  game_image3?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  images?: string[];
  fields?: GameField[];
  topup_options: TopupOption[];
  game_name?: string | undefined;
  game_id?: string | number | undefined;
}

export interface Seller {
  name: string;
  email: string;
  status: string;
  id: number;
}

export interface Order {
  buyer_confirmation: boolean;
  admin_confirmations: boolean;
  buyer_confirmations: boolean;
  seller_confirmation: boolean;
  id: number;
  price: number;
  buyer_id: number;
  seller_id: number;
  game_id: number;
  amount: string;
  status: string;
  created_at: string;
  updated_at: string;
  buyer?: User;
  seller?: User;
  game?: Game;
}

export interface CurrencyPurchase {
  player_id: string;
  currency_amount: number;
  payment_status: string;
}

export interface Listing {
  transaction_id: string;
  type: string;
  amount: number;
  created_at: string;
  order?: Order;
  currencyPurchase?: CurrencyPurchase;
  user_id: number;
  id: number;
  price: number;
  status: "active" | "inactive";
  seller?: Seller;
  game?: Game;
  fields?: ListingField[];
  game_images?: string[];
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface ListingField {
  id: number;
  label: string;
  value: string | number;
  icon?: string;
}

export interface TopupOption {
  id: number;
  currency_name: string;
  currency_amount: number;
  price: number;
  currency_image?: string;
}

export interface Slider {
  id: number;
  title: string;
  description: string;
  image?: File | string; // Must be optional and match FormData
  status: boolean;
  created_at: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
}

export interface User {
  id: number;
  name: string;
  store_name?: string | null;
  user_status?: string | null;
  email: string;
  role: string;

  email_verified_at: string;
  email_verification_code?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  order_id: number | null;
  currency_id: number;
  type: string;
  amount: string;
  commission_amount: string;
  commission_percent: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TopupOrder {
  id: number;
  payment_id: string;
  user_id: number;
  player_id: string;
  currency_amount: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  user: User;
  transaction: Transaction;
}
