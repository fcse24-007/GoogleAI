export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'provider' | 'admin';
}

export interface Accommodation {
  id: string;
  title: string;
  price: number;
  location: string;
  type: 'Flat' | 'Shared House' | 'Studio' | 'Apartment';
  amenities: string[];
  availabilityDate: string;
  depositAmount: number;
  imageUrl: string;
  status: 'Available' | 'Reserved';
  providerId: string;
  description: string;
  latitude: number;
  longitude: number;
}

export interface FilterPreference {
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  type?: string;
  availabilityDate?: string;
}

export interface Reservation {
  id: string;
  userId: string;
  accommodationId: string;
  receiptNumber: string;
  timestamp: string;
}

export interface Message {
  id: string;
  accommodationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}
