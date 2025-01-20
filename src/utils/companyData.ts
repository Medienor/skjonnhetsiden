import companies from '@/data/company.json';
import type { Company } from '@/types/Company';
import { findMunicipalityByPostalCode } from './municipalityData';

// Type assertion for the imported JSON
const companyData = companies as Company[];

export const getCompaniesByCity = (city: string): Company[] => {
  const normalizedCity = city.toLowerCase();
  return companyData.filter(company => 
    company.forretningsadresse?.kommune?.toLowerCase() === normalizedCity ||
    company.postadresse?.kommune?.toLowerCase() === normalizedCity
  );
};

export const getCompaniesByPostalCode = (postalCode: string): Company[] => {
  return companyData.filter(company => 
    company.forretningsadresse?.postnummer === postalCode
  );
};

export const getAllCompanies = (): Company[] => {
  return companyData;
};

export const searchCompanies = (query: string): Company[] => {
  const searchTerm = query.toLowerCase();
  return companyData.filter(company => 
    company.navn.toLowerCase().includes(searchTerm) ||
    company.organisasjonsnummer.includes(searchTerm)
  );
};

// Get companies that are accounting firms (based on industry code)
export const getAccountingFirms = (): Company[] => {
  return companyData.filter(
    company => company.naeringskode1?.kode === "69.201"
  );
};

// Get accounting firms by city
export const getAccountingFirmsByCity = (city: string): Company[] => {
  const normalizedCity = city.toLowerCase();
  return getAccountingFirms().filter(company => 
    (company.forretningsadresse?.kommune?.toLowerCase() === normalizedCity) ||
    (company.postadresse?.kommune?.toLowerCase() === normalizedCity)
  );
};

// Helper function to normalize city names
export const normalizeCityName = (city: string): string => {
  const cityMap: Record<string, string> = {
    'oslo': 'Oslo',
    'bergen': 'Bergen',
    'trondheim': 'Trondheim',
    'stavanger': 'Stavanger',
    'kristiansand': 'Kristiansand',
    'drammen': 'Drammen',
    'ålesund': 'Ålesund',
    'alesund': 'Ålesund',
    // Add more city mappings as needed
  };
  
  return cityMap[city.toLowerCase()] || city;
};

export const getCompaniesByMunicipality = (municipality: string): Company[] => {
  if (!municipality) return [];
  
  const normalizedMunicipality = municipality.toUpperCase();
  return companyData.filter(company => 
    company.forretningsadresse?.kommune?.toUpperCase() === normalizedMunicipality
  );
};

// New function to get companies by postal code or municipality
export const getCompaniesByLocation = (searchTerm: string): Company[] => {
  if (!searchTerm) return [];

  if (/^\d{4}$/.test(searchTerm)) {
    // If it's a postal code, get companies directly by postal code
    // AND companies in the municipality that the postal code belongs to
    const municipality = findMunicipalityByPostalCode(searchTerm);
    if (municipality) {
      return companyData.filter(company => 
        company.forretningsadresse?.postnummer === searchTerm ||
        (company.forretningsadresse?.kommune && 
         company.forretningsadresse.kommune.toUpperCase() === municipality.toUpperCase())
      );
    }
    return getCompaniesByPostalCode(searchTerm);
  }
  
  // If it's not a postal code, search by municipality name
  return getCompaniesByMunicipality(searchTerm);
};

// Helper function to get accounting firms by location
export const getAccountingFirmsByLocation = (searchTerm: string): Company[] => {
  return getCompaniesByLocation(searchTerm).filter(company => 
    company.naeringskode1?.kode === "69.201"
  );
};

// Add new function to get company by name
export const getCompanyByNormalizedName = (normalizedName: string): Company | undefined => {
  return companyData.find(company => 
    normalizeCompanyName(company.navn) === normalizedName
  );
};

// Add helper function to normalize company names for URLs
export const normalizeCompanyName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}; 