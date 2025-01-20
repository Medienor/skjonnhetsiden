import municipalities from '@/data/municipalities.json';

interface Municipality {
  number: number;
  name: string;
  countyNumber: number;
  areaCode: string;
  postalCodes: string[];
}

// Create a map for faster postal code lookups
const postalCodeToMunicipalityMap = new Map<string, string>();

// Initialize the map
municipalities.forEach((municipality: Municipality) => {
  municipality.postalCodes.forEach(postalCode => {
    postalCodeToMunicipalityMap.set(postalCode, municipality.name);
  });
});

export const findMunicipalityByPostalCode = (postalCode: string): string | null => {
  return postalCodeToMunicipalityMap.get(postalCode) || null;
};

export const getAllMunicipalities = (): Municipality[] => {
  return municipalities;
};

// Enhanced normalization function
export const normalizeMunicipalityName = (name: string): string => {
  // Convert to lowercase and take first part before any dash
  return name
    .toLowerCase()
    .split('-')[0]
    .trim();
};

// Add a denormalization function to convert URL back to proper name
export const denormalizeMunicipalityName = (normalized: string): string => {
  const municipalities = getAllMunicipalities();
  const municipality = municipalities.find(m => 
    normalizeMunicipalityName(m.name) === normalized
  );
  return municipality ? municipality.name : normalized;
};

export const getNearbyMunicipalities = (cityName: string): string[] => {
  // Find the current municipality
  const currentMunicipality = municipalities.find(
    m => m.name.toLowerCase() === cityName.toLowerCase()
  );

  if (!currentMunicipality) return [];

  // Find municipalities that are in the same county
  // and have similar postal code patterns
  const nearbyMunicipalities = municipalities.filter(m => {
    // Skip the current municipality
    if (m.name === currentMunicipality.name) return false;

    // Must be in the same county
    if (m.countyNumber !== currentMunicipality.countyNumber) return false;

    // Check if they share postal code patterns
    const currentPostalPrefix = currentMunicipality.postalCodes[0].substring(0, 1);
    const municipalityPostalPrefix = m.postalCodes[0].substring(0, 1);

    return currentPostalPrefix === municipalityPostalPrefix;
  })
  .map(m => m.name)
  .slice(0, 8); // Limit to 8 nearby municipalities

  return nearbyMunicipalities;
}; 