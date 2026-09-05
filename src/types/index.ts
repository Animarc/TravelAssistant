// Activity types
export type ActivityType = 'normal' | 'vuelo' | 'transporte' | 'comida' | 'visita';
export type EntityId = string | number;
export type TripRole = 'viewer' | 'editor' | 'owner';

export interface Activity {
  id?: EntityId;
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
  id?: EntityId;
  title: string;
  activities: Activity[];
}

// Accommodation
export interface Accommodation {
  id: EntityId;
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
  id: EntityId;
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
  id: EntityId;
  firstName: string;
  lastName: string;
  age: number;
  email?: string;
  phonePrefix?: string;
  phone?: string;
  documents: TravelerDocument[];
  paysBudget: boolean;
}

export interface Trip {
  id: string;
  tripName: string;
  days: Day[];
  accommodations: Accommodation[];
  shoppingItems: ShoppingItem[];
  travelers: Traveler[];
  currentDay: number;
  description?: string;
  coverImageUrl?: string;
  isPublic?: boolean;
  currency: string;
  currentUserRole?: TripRole;
  capabilities?: TripCapabilities;
}

export interface TripCapabilities {
  canEdit: boolean;
  canManageMembers: boolean;
  canDelete: boolean;
}

export interface AuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface TripMember {
  userId: string;
  role: TripRole;
  joinedAt: string;
}

export interface TripInvitation {
  id: string;
  tripId: string;
  invitedUserId?: string;
  invitedByUserId: string;
  role: Exclude<TripRole, 'owner'>;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
}

// Views
export type ViewType = 'planning' | 'budget' | 'objects' | 'travelers' | 'account';

// Language
export type Language = 'es' | 'en' | 'fr' | 'de' | 'zh' | 'ru' | 'ja';

// App State
export interface AppState {
  trips: Trip[];
  activeTripId: string;
  tripName: string;
  days: Day[];
  accommodations: Accommodation[];
  shoppingItems: ShoppingItem[];
  travelers: Traveler[];
  currentDay: number;
  currentView: ViewType;
  lastTripView: Exclude<ViewType, 'account'>;
  language: Language;
  isAuthenticated: boolean;
  authLoading: boolean;
  user: AuthUser | null;
  error: string | null;
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
