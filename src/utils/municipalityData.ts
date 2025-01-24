import municipalities from '@/data/municipalities.json';

export interface Municipality {
  number: number;
  name: string;
  countyNumber: number;
  areaCode: string;
  postalCodes: string[];
}

// Define normalization function first
export const normalizeMunicipalityName = (name: string): string => {
  return name
    .toLowerCase()
    // Replace Norwegian special characters
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    // Remove special characters and spaces
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

// Create maps for faster lookups
const postalCodeToMunicipalityMap = new Map<string, Municipality>();
const normalizedNameToMunicipalityMap = new Map<string, Municipality>();

// Initialize the maps after normalization function is defined
municipalities.forEach((municipality: Municipality) => {
  // Postal code mapping
  if (municipality.postalCodes) {
    municipality.postalCodes.forEach(postalCode => {
      postalCodeToMunicipalityMap.set(postalCode, municipality);
    });
  }
  
  // Normalized name mapping (add both normal and special character versions)
  const normalizedName = normalizeMunicipalityName(municipality.name);
  normalizedNameToMunicipalityMap.set(normalizedName, municipality);
  
  // Also add the original name for direct lookups
  normalizedNameToMunicipalityMap.set(municipality.name.toLowerCase(), municipality);
});

export const findMunicipalityByPostalCode = (postalCode: string): Municipality | undefined => {
  return municipalities.find((municipality: Municipality) => 
    municipality.postalCodes.includes(postalCode)
  );
};

export const getAllMunicipalities = (): Municipality[] => {
  return municipalities as Municipality[];
};

// Add this new function
export const findMunicipalityByName = (name: string): Municipality | undefined => {
  return municipalities.find((municipality: Municipality) => 
    municipality.name.toLowerCase() === name.toLowerCase()
  );
};

// Add a denormalization function to convert URL back to proper name
export const denormalizeMunicipalityName = (normalized: string): string => {
  // Try to find the municipality by normalized name
  const municipality = normalizedNameToMunicipalityMap.get(normalized.toLowerCase()) ||
    normalizedNameToMunicipalityMap.get(normalizeMunicipalityName(normalized));
  
  if (municipality) {
    return municipality.name;
  }

  // If not found, try to find a close match
  const allMunicipalities = getAllMunicipalities();
  const closestMatch = allMunicipalities.find(m => 
    normalizeMunicipalityName(m.name) === normalizeMunicipalityName(normalized)
  );

  return closestMatch ? closestMatch.name : normalized;
};

export const getNearbyMunicipalities = (cityName: string): string[] => {
  // Find the current municipality using normalized name
  const normalizedCity = normalizeMunicipalityName(cityName);
  const currentMunicipality = municipalities.find(m => 
    normalizeMunicipalityName(m.name) === normalizedCity
  );

  if (!currentMunicipality) return [];

  // Find municipalities that are in the same county
  const nearbyMunicipalities = municipalities
    .filter(m => {
      // Skip the current municipality
      if (m.name === currentMunicipality.name) return false;
      // Must be in the same county
      return m.countyNumber === currentMunicipality.countyNumber;
    })
    .map(m => m.name)
    .slice(0, 8); // Limit to 8 nearby municipalities

  return nearbyMunicipalities;
};

export const isMunicipalityValid = (cityName: string): boolean => {
  const normalized = normalizeMunicipalityName(cityName);
  return municipalities.some(m => 
    normalizeMunicipalityName(m.name) === normalized
  );
}; 