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

  console.log('Searching companies by location:', searchTerm);

  // Normalize the search term
  const normalizedSearchTerm = searchTerm.toUpperCase().trim();
  
  return companyData.filter(company => {
    const companyKommune = company.forretningsadresse?.kommune?.toUpperCase() || '';
    const companyPostKommune = company.postadresse?.kommune?.toUpperCase() || '';
    const companyPostnr = company.forretningsadresse?.postnummer || '';
    
    const matchesKommune = 
      companyKommune === normalizedSearchTerm ||
      companyPostKommune === normalizedSearchTerm;
    
    const matchesPostalCode = companyPostnr === searchTerm;

    if (matchesKommune || matchesPostalCode) {
      console.log('Found match:', {
        company: company.navn,
        kommune: companyKommune,
        postKommune: companyPostKommune,
        postnr: companyPostnr
      });
    }

    return matchesKommune || matchesPostalCode;
  });
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

// Update the normalizeCompanyName function to handle undefined
export const normalizeCompanyName = (name: string | undefined): string => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Add new function to get beauty clinics (based on industry code)
export const getBeautyClinics = (): Company[] => {
  return companyData.filter(company => {
    const upperName = company.navn.toUpperCase();
    const isBeautyClinic = 
      company.naeringskode1?.kode === "86.909" ||
      company.naeringskode1?.kode === "96.020" ||
      company.naeringskode1?.kode === "86.902";
    
    const isNotHolding = !upperName.includes('HOLDING');
    const isNotGroup = !upperName.includes('GROUP');
    const isNotInvest = !upperName.includes('INVEST');
    
    return isBeautyClinic && isNotHolding && isNotGroup && isNotInvest;
  });
};

// Get beauty clinics by city
export const getBeautyClinicsByCity = (city: string): Company[] => {
  const normalizedCity = city.toLowerCase();
  return getBeautyClinics().filter(company => 
    (company.forretningsadresse?.kommune?.toLowerCase() === normalizedCity) ||
    (company.postadresse?.kommune?.toLowerCase() === normalizedCity)
  );
};

// Helper function to get beauty clinics by location
export const getBeautyClinicsByLocation = (searchTerm: string): Company[] => {
  console.log('Searching for beauty clinics in:', searchTerm);
  
  // Get all companies in the location first
  const locationCompanies = getCompaniesByLocation(searchTerm);
  console.log('Total companies in location:', locationCompanies.length);

  // Filter for beauty clinics
  const beautyClinics = locationCompanies.filter(company => {
    const isBeautyClinic = 
      company.naeringskode1?.kode === "86.909" ||
      company.naeringskode1?.kode === "96.020" ||
      company.naeringskode1?.kode === "86.902";
    
    const isNotHolding = !company.navn.toUpperCase().includes('HOLDING');
    
    console.log(`Company: ${company.navn}`, {
      code: company.naeringskode1?.kode,
      isBeautyClinic,
      isNotHolding,
      kommune: company.forretningsadresse?.kommune
    });

    return isBeautyClinic && isNotHolding;
  });

  console.log('Found beauty clinics:', beautyClinics.length);
  return beautyClinics;
};

// Add this helper function and export it
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Add new function to get company by organization number
export const getCompanyByOrgNumber = (orgNumber: string): Company | undefined => {
  return companyData.find(company => 
    company.organisasjonsnummer === orgNumber
  );
};

// Add helper to validate organization number format
export const isValidOrgNumber = (orgNumber: string): boolean => {
  // Norwegian org numbers are exactly 9 digits
  return /^\d{9}$/.test(orgNumber);
}; 