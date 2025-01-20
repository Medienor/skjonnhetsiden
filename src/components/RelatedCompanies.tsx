import { Link } from "react-router-dom";
import { Building2, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { normalizeCompanyName } from "@/utils/companyData";
import type { Accountant } from "@/types/accountant";
import { Button } from "@/components/ui/button";

interface RelatedCompaniesProps {
  currentCompany: Accountant;
  allCompanies: Accountant[];
}

interface AccountantWithRatings extends Accountant {
  averageRating: number;
  totalReviews: number;
}

export const RelatedCompanies = ({ currentCompany, allCompanies }: RelatedCompaniesProps) => {
  const [relatedCompanies, setRelatedCompanies] = useState<AccountantWithRatings[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedCompanies = async () => {
      try {
        // Get companies from the same municipality
        const sameAreaCompanies = allCompanies
          .filter(company => 
            company.location === currentCompany.location &&
            company.id !== currentCompany.id
          )
          .slice(0, 4);

        // Get reviews for these companies
        const { data: reviewsData, error } = await supabase
          .from('reviews')
          .select('*')
          .in('org_number', sameAreaCompanies.map(c => c.id));

        if (error) throw error;

        // Calculate average ratings
        const companiesWithRatings: AccountantWithRatings[] = sameAreaCompanies.map(company => {
          const companyReviews = reviewsData?.filter(r => r.org_number === company.id) || [];
          const averageRating = companyReviews.length > 0
            ? companyReviews.reduce((sum, review) => sum + review.rating, 0) / companyReviews.length
            : 0;
          
          return {
            ...company,
            averageRating,
            totalReviews: companyReviews.length
          };
        });

        setRelatedCompanies(companiesWithRatings);
      } catch (error) {
        console.error('Error fetching related companies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentCompany && allCompanies.length > 0) {
      fetchRelatedCompanies();
    }
  }, [currentCompany, allCompanies]);

  if (isLoading) {
    return <div className="text-center py-8">Laster relaterte selskaper...</div>;
  }

  if (relatedCompanies.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-blue-900 mb-8">
        Andre regnskapsførere i {currentCompany.location}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedCompanies.map((company) => (
          <div key={company.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Link 
              to={`/regnskapsforer/${normalizeCompanyName(company.name)}`}
              className="block"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 line-clamp-2">{company.name}</h3>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium">
                        {company.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 ml-1">
                      ({company.totalReviews})
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {company.location}
              </p>
            </Link>
            <Link to="/tilbud">
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                variant="secondary"
              >
                Få tilbud
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};