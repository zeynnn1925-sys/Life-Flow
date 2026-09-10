import React from 'react';
import { 
  ShoppingBag, ShoppingCart, Coffee, Utensils, Gift, Tag, Package,
  Home, Zap, Flame, Wifi, Droplets, Phone, Smartphone,
  Car, Plane, Fuel, Bus, Bike, Compass,
  Heart, Activity, Dumbbell, Smile, Pill,
  Briefcase, DollarSign, Wallet, CreditCard, Landmark, TrendingUp, Coins, PiggyBank, Building, Receipt,
  Music, Gamepad, Tv, Film, Camera, Laptop, Book, GraduationCap,
  ShieldCheck, Users, Trophy, Sparkles, HelpCircle
} from 'lucide-react';

export const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  ShoppingCart,
  Coffee,
  Utensils,
  Gift,
  Tag,
  Package,
  Home,
  Zap,
  Flame,
  Wifi,
  Droplets,
  Phone,
  Smartphone,
  Car,
  Plane,
  Fuel,
  Bus,
  Bike,
  Compass,
  Heart,
  Activity,
  Dumbbell,
  Smile,
  Pill,
  Briefcase,
  DollarSign,
  Wallet,
  CreditCard,
  Landmark,
  TrendingUp,
  Coins,
  PiggyBank,
  Building,
  Receipt,
  Music,
  Gamepad,
  Tv,
  Film,
  Camera,
  Laptop,
  Book,
  GraduationCap,
  ShieldCheck,
  Users,
  Trophy,
  Sparkles,
  HelpCircle
};

export const POPULAR_CATEGORY_COLORS = [
  '#f77f00', // Amber
  '#d62828', // Red
  '#00a87e', // Emerald
  '#5e6ad2', // Indigo
  '#007bc2', // Blue
  '#d44df0', // Purple
  '#ec7e00', // Orange
  '#428619', // Green
  '#e61e49', // Crimson
  '#fcbf49', // Gold
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
];

export function getCategoryIcon(iconName?: string): React.ElementType {
  if (!iconName) return ShoppingBag;
  return CATEGORY_ICON_MAP[iconName] || ShoppingBag;
}
