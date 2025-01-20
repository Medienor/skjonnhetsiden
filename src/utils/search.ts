import { Company } from '@/types/Company';
import { getAllMunicipalities } from './municipalityData';
import { getAccountingFirms } from './companyData';

type SearchResult = {
  type: 'municipality' | 'company';
  name: string;
  url: string;
  subtitle?: string; // Optional subtitle for companies
};

type CompanySearchResult = {
  type: 'company';
  name: string;
  url: string;
  subtitle: string;
};

let cachedCompanies: Company[] | null = null;

const initializeCompanies = async () => {
  if (!cachedCompanies) {
    try {
      cachedCompanies = await getAccountingFirms();
      console.log('Fetched companies:', cachedCompanies?.length); // Debug log
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }
  return cachedCompanies || [];
};

export const searchItems = async (searchTerm: string): Promise<SearchResult[]> => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  const searchLower = searchTerm.toLowerCase();
  const results: SearchResult[] = [];
  
  // Search municipalities
  const municipalities = getAllMunicipalities()
    .filter(m => m.name.toLowerCase().includes(searchLower))
    .slice(0, 3)
    .map(m => ({
      type: 'municipality' as const,
      name: m.name,
      url: `/${m.name.toLowerCase()}`
    }));
  
  results.push(...municipalities);
  
  // Search companies
  try {
    const companies = await initializeCompanies();
    
    const validCompanies = companies.filter(c => 
      c && 
      c.navn
    );
    
    const matchingCompanies = validCompanies
      .filter(c => c.navn.toLowerCase().includes(searchLower))
      .slice(0, 5)
      .map(c => {
        const result: CompanySearchResult = {
          type: 'company',
          name: c.navn,
          url: `/regnskapsforer/${c.navn.toLowerCase().replace(/\s+/g, '-')}`,
          subtitle: c.forretningsadresse?.kommune || ''
        };
        return result;
      });
    
    results.push(...matchingCompanies);
  } catch (error) {
    console.error('Error searching companies:', error);
  }
  
  return results.slice(0, 8);
}; 