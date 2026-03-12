export interface Property {
  id: number;
  title: string;
  price: number | null;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  area: string;
  status: string;
  type?: string;
  isVip: boolean | null;
  isNegotiable: boolean | null;
  image_urls: string[] | null;
  ownerName?: string;
  ownerPhone?: string;
  floor?: number | null;
  beds?: number | null;
  bathroom?: number | null;
  features?: string[];
  description?: string;
  user_id?: string;
}
export interface PropertyForm {
  title: string;
  price: number | null;
  area: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  isVip: boolean;
  isNegotiable: boolean;
  ownerName: string;
  ownerPhone: string;
  type: string;
  image_urls: string[] | null;
  user_id: string | undefined;
  floor: number | null;
  beds: number | null;
  bathroom: number | null;
  features: string[];
  description: string;
}
