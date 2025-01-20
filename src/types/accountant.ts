export interface Review {
  id: string;
  org_number: string;
  rating: number;
  reviewer_name: string | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  adresse: string[];
  poststed: string;
  postnummer: string;
}

export interface Accountant {
  id: string;
  name: string;
  location: string;
  services: string[];
  priceRange: string;
  rating: number;
  description: string;
  imageUrl: string;
  fullDescription: string;
  establishedYear: number;
  employees: number;
  reviews: Review[];
  organisasjonsnummer: string;
  forretningsadresse?: Address;
  reviewScore?: number;
  reviewCount?: number;
  telefon?: string;
  mobil?: string;
  email?: string;
  website?: string;
}