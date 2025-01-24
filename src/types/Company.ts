interface Link {
  rel?: string;
  href?: string;
  type?: string;
}

interface OrganizationForm {
  kode: string;
  beskrivelse: string;
  links: Link[];
}

interface NaeringsKode {
  kode: string;
  beskrivelse: string;
}

interface Address {
  land: string;
  landkode: string;
  postnummer: string;
  poststed: string;
  adresse: string[];
  kommune: string;
  kommunenummer: string;
}

interface Location {
  city: string;
  address: string;
  postalCode: string;
  municipality: string;
  isPrimary: boolean;
}

interface Treatment {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: string;
  category?: string;
}

interface Review {
  rating: number;
  comment?: string;
  date: string;
  verified: boolean;
  treatmentId?: string;
  authorName?: string;
}

interface Reviews {
  averageRating: number;
  totalReviews: number;
  reviews?: Review[];
}

interface Staff {
  id: string;
  name: string;
  title?: string;
  specialties?: string[];
  image?: string;
  description?: string;
}

export interface Company {
  // Basic info
  organisasjonsnummer: string;
  navn: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  
  // Contact info
  telefon?: string;
  mobil?: string;
  hjemmeside?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  
  // Location info
  forretningsadresse: {
    land: string;
    landkode: string;
    postnummer: string;
    poststed: string;
    adresse: string[];
    kommune: string;
    kommunenummer: string;
  };
  postadresse?: Address;
  locations?: Location[];
  kommune: string;
  city?: string;
  
  // Business details
  naeringskode1?: NaeringsKode;
  stiftelsesdato: string;
  registreringsdatoEnhetsregisteret: string;
  
  // Beauty clinic specific
  treatments?: Treatment[];
  openingHours?: {
    [key: string]: string; // e.g., "monday": "09:00-17:00"
  };
  specialties?: string[];
  certifications?: string[];
  languages?: string[];
  staff?: Staff[];
  paymentMethods?: string[];
  parkingAvailable?: boolean;
  wheelchairAccessible?: boolean;
  
  // Reviews and ratings
  reviews?: Reviews;
  reviewScore?: number;
  reviewCount?: number;
  
  // Status flags
  active: boolean;
  verified: boolean;
  featured?: boolean;
  
  // Registration status
  registrertIMvaregisteret: boolean;
  registrertIForetaksregisteret: boolean;
  konkurs: boolean;
  underAvvikling: boolean;
  
  // Additional info
  description?: string;
  images?: {
    logo?: string;
    clinic?: string[];
    staff?: string[];
    treatments?: string[];
  };
  
  // Metadata
  lastUpdated?: string;
  links: Link[];
}

export interface CompanyWithReviews extends Company {
  reviewScore: number;
  reviewCount: number;
  reviews: Reviews;
} 