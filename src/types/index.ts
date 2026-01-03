// Activity types
export type ActivityType = 'normal' | 'vuelo' | 'transporte' | 'comida' | 'visita';

export interface Activity {
  time: string;
  name: string;
  description: string;
  importantInfo?: string;
  price?: string | number;
  currency?: string;
  coordinates?: [number, number];
  type?: ActivityType;
  isOptional?: boolean;
  isDone?: boolean;
}

export interface Day {
  title: string;
  activities: Activity[];
}

// Accommodation
export interface Accommodation {
  id: number;
  name: string;
  price: number;
  link?: string;
  fromDay: number;
  toDay: number;
  coordinates?: [number, number];
}

// Shopping
export type ShoppingCategory = 'transporte' | 'entradas' | 'electronica' | 'documentos' | 'otros';

export interface ShoppingItem {
  id: number;
  name: string;
  category: ShoppingCategory;
  price: number;
  currency: string;
  purchased: boolean;
  link?: string;
}

// Travelers
export type DocumentType = 'passport' | 'id' | 'driverLicense' | 'other';

export interface TravelerDocument {
  type: DocumentType;
  number: string;
}

export interface Traveler {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  email?: string;
  phonePrefix?: string;
  phone?: string;
  documents: TravelerDocument[];
  paysBudget: boolean;
}

// Views
export type ViewType = 'planning' | 'budget' | 'objects' | 'travelers' | 'account';

// Language
export type Language = 'es' | 'en' | 'fr' | 'de' | 'zh' | 'ru' | 'ja';

// App State
export interface AppState {
  tripName: string;
  days: Day[];
  accommodations: Accommodation[];
  shoppingItems: ShoppingItem[];
  travelers: Traveler[];
  currentDay: number;
  currentView: ViewType;
  language: Language;
}

// Transfer (auto-generated between activities)
export interface Transfer {
  isTransfer: true;
  from: string;
  to: string;
  distance: string;
  coordinates: [[number, number], [number, number]];
}

export type ActivityOrTransfer = (Activity & { originalIndex: number; isTransfer?: false }) | Transfer;
