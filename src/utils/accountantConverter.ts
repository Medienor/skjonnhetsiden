import type { Company } from '@/types/Company';
import type { Accountant } from '@/types/accountant';

export const convertCompanyToAccountant = (company: Company): Accountant => {
  // Convert stiftelsesdato (YYYY-MM-DD) to year
  const establishedYear = company.stiftelsesdato 
    ? parseInt(company.stiftelsesdato.split('-')[0]) 
    : parseInt(company.registreringsdatoEnhetsregisteret?.split('-')[0]) || 0;

  // Get number of employees - this is usually not provided in the data
  // but we can indicate if the company has registered employees
  const employees = company.harRegistrertAntallAnsatte ? 1 : 0;

  return {
    id: company.organisasjonsnummer,
    name: company.navn,
    location: company.forretningsadresse?.poststed || '',
    services: [],  // Add services if available
    forretningsadresse: company.forretningsadresse,  // Add this line
    organisasjonsnummer: company.organisasjonsnummer,
    telefon: company.telefon,
    mobil: company.mobil,
    priceRange: 'Ta kontakt for pristilbud', // More appropriate than random prices
    rating: 0, // Start with 0 until we have real reviews
    description: `${company.navn} tilbyr regnskapstjenester og økonomisk rådgivning.`,
    imageUrl: '/placeholder.svg',
    fullDescription: `${company.navn} er et autorisert regnskapsførerselskap som tilbyr regnskapstjenester og økonomisk rådgivning. ${
      company.vedtektsfestetFormaal 
        ? `\n\nFormål: ${company.vedtektsfestetFormaal.join(' ')}` 
        : ''
    }`,
    establishedYear,
    employees,
    reviews: [] // Empty until we implement a review system
  };
};

export const convertCompaniesToAccountants = (companies: Company[]): Accountant[] => {
  return companies.map(convertCompanyToAccountant);
}; 