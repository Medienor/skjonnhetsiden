import municipalities from '@/data/municipalities.json';

export const findMunicipalityByPostalCode = (postalCode: string) => {
  for (const municipality of municipalities) {
    if (municipality.postalCodes.includes(postalCode)) {
      return municipality.name;
    }
  }
  return null;
}; 