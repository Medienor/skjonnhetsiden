import { useState, useEffect } from 'react';
import type { Company } from '@/types/Company';
import { getAccountingFirms } from '@/utils/companyData';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getAccountingFirms();
        setCompanies(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch companies'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return { companies, isLoading, error };
}; 