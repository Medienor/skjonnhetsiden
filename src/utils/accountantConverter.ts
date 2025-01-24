import type { Company } from '@/types/Company';
import type { Accountant } from '@/types/accountant';

export const convertCompanyToAccountant = (company: Company): Accountant => {
  // Convert stiftelsesdato (YYYY-MM-DD) to year
  const establishedYear = company.stiftelsesdato 
    ? parseInt(company.stiftelsesdato.split('-')[0]) 
    : parseInt(company.registreringsdatoEnhetsregisteret?.split('-')[0]) || 0;

  // Get number of employees from staff array if available
  const employees = company.staff?.length || 0;

  // Convert reviews to match Accountant.Review type
  const reviews = company.reviews?.reviews?.map(review => ({
    id: review.treatmentId || '', // Use treatmentId as fallback id
    org_number: company.organisasjonsnummer,
    rating: review.rating,
    comment: review.comment || '',
    reviewer_name: review.authorName || 'Anonym',
    created_at: review.date,
    updated_at: review.date,
    verified: review.verified
  })) || [];

  return {
    id: company.organisasjonsnummer,
    name: company.navn,
    location: company.forretningsadresse?.poststed || '',
    services: company.treatments?.map(t => t.name) || [],
    forretningsadresse: company.forretningsadresse,
    organisasjonsnummer: company.organisasjonsnummer,
    telefon: company.telefon,
    mobil: company.mobil,
    priceRange: 'Ta kontakt for pristilbud',
    rating: company.rating || 0,
    description: company.description || `${company.navn} tilbyr skjønnhetsbehandlinger.`,
    imageUrl: company.images?.logo || '/placeholder.svg',
    fullDescription: `${company.navn} er en skjønnhetsklinikk som tilbyr ${
      company.treatments?.map(t => t.name).join(', ') || 'ulike behandlinger'
    }.`,
    establishedYear,
    employees,
    reviews
  };
};

export const convertCompaniesToAccountants = (companies: Company[]): Accountant[] => {
  return companies.map(convertCompanyToAccountant);
}; 