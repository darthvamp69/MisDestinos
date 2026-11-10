export type PinStatus = 'visited' | 'wishlist';

export interface TravelPin {
  id: string;
  title: string;
  note: string;
  status: PinStatus;
  latitude: number;
  longitude: number;
  country?: string;
  city?: string;
  photoUri?: string;
  createdAt: number;
}
