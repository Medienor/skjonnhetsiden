import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { FilterSection } from "@/components/FilterSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import type { Company } from "@/types/Company";
import { getAccountingFirms, normalizeCompanyName, getBeautyClinics } from "@/utils/companyData";
import { Button } from "@/components/ui/button";
import { Star, Building2, Check, Calendar, ArrowRight } from "lucide-react";
import { getAllMunicipalities, findMunicipalityByPostalCode } from "@/utils/municipalityData";
import { Helmet } from "react-helmet-async";
import { toast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { supabase } from '../utils/supabase';
import { RequestOfferForm } from '@/components/RequestOfferForm';
import { TREATMENTS } from '@/types/treatments';

const norwegianCities = [
  "Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", 
  "Fredrikstad", "Tromsø", "Sandnes", "Kristiansand", "Lillestrøm",
  "Ålesund", "Tønsberg", "Moss", "Haugesund", "Sandefjord",
  "Arendal", "Bodø", "Larvik", "Askøy", "Sarpsborg",
  "Kongsberg", "Molde"
];

const ITEMS_PER_PAGE = 10;
const MAX_ITEMS = 10;

interface CompanyWithReviews extends Company {
  reviewScore: number;
  reviewCount: number;
  reviews: {
    averageRating: number;
    totalReviews: number;
  };
}

interface IpLocation {
  city: string;
  postal: string;
  region: string;
  country: string;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getRandomColor = (companyName: string) => {
  // Using company name as seed to get consistent color for each company
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-emerald-500',
    'bg-orange-500',
    'bg-rose-500',
  ];
  const index = companyName.length % colors.length;
  return colors[index];
};

const getRandomPrice = (treatment: 'botox' | 'filler') => {
  const ranges = {
    botox: {
      min: 1490,
      max: 2990,
      step: 100
    },
    filler: {
      min: 2490,
      max: 4990,
      step: 100
    }
  };

  const range = ranges[treatment];
  const steps = Math.floor((range.max - range.min) / range.step);
  const randomSteps = Math.floor(Math.random() * steps);
  return range.min + (randomSteps * range.step);
};

const CompanyCard: React.FC<{ company: CompanyWithReviews }> = ({ company }) => {
  const normalizedName = company.navn.toLowerCase().replace(/\s+/g, '-').replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a');
  
  // Mockup prices - these can be removed if the display section is removed
  // const botoxPrice = Math.floor(Math.random() * (3500 - 1800 + 1) + 1800).toString().slice(0, -2) + "90";
  // const fillerPrice = Math.floor(Math.random() * (4500 - 2800 + 1) + 2800).toString().slice(0, -2) + "90";

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full ${getRandomColor(company.navn)} flex items-center justify-center`}>
            <span className="text-base font-semibold text-white">{getInitials(company.navn)}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-blue-900">{company.navn}</h3>
            <div className="flex items-center gap-1 mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(Number(company.reviewScore))
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                {company.reviewScore.toFixed(1)} ({company.reviewCount} vurderinger)
              </span>
            </div>
          </div>
        </div>
        
        {company.forretningsadresse && (
          <p className="text-gray-600 text-sm mb-2 px-5">
            {company.forretningsadresse.adresse[0]}, {company.forretningsadresse.poststed}
          </p>
        )}
        
        <div className="mt-3 pt-3 border-t flex items-center justify-between px-5 pb-5">
          <Link 
            to={`/klinikk/${normalizedName}`}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center"
          >
            Les vurderinger <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          {company.telefon && (
            <span className="text-sm text-gray-600">Tlf: {company.telefon}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="text-center py-12 px-4 bg-white rounded-lg shadow-sm">
    <div className="mb-4">
      <Building2 className="mx-auto h-12 w-12 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Ingen klinikker funnet
    </h3>
    <p className="text-gray-500 mb-6">
      Vi fant ingen klinikker som matcher dine filtervalg. Prøv å justere filtrene eller vis alle klinikker.
    </p>
    <Button 
      onClick={() => window.location.reload()}
      variant="outline"
    >
      Vis alle klinikker
    </Button>
  </div>
);

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [userLocation, setUserLocation] = useState<IpLocation | null>(null);

  useEffect(() => {
    const fetchCompaniesWithReviews = async () => {
      try {
        const initialCompanies = getBeautyClinics()
          .filter(company => {
            const upperName = company.navn.toUpperCase();
            return !upperName.includes('GROUP') && !upperName.includes('INVEST');
          })
          .slice(0, MAX_ITEMS);
        
        const orgNumbers = initialCompanies.map(company => company.organisasjonsnummer);
        
        const { data: reviewsData, error } = await supabase
          .from('reviews')
          .select('*')
          .in('org_number', orgNumbers);

        if (error) throw error;

        const reviewsByCompany = (reviewsData || []).reduce((acc: Record<string, Array<{rating: number}>>, review) => {
          if (!acc[review.org_number]) {
            acc[review.org_number] = [];
          }
          acc[review.org_number].push(review);
          return acc;
        }, {});

        const companiesWithReviews: CompanyWithReviews[] = initialCompanies.map(company => {
          const companyReviews = reviewsByCompany[company.organisasjonsnummer] || [];
          const totalReviews = companyReviews.length;
          const averageRating = totalReviews > 0
            ? companyReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;

          return {
            ...company,
            reviewScore: averageRating,
            reviewCount: totalReviews,
            reviews: {
              averageRating,
              totalReviews
            }
          };
        });

        // Sort companies by location relevance and reviews
        const sortedCompanies = [...companiesWithReviews].sort((a, b) => {
          if (userLocation) {
            // Exact postal code match gets highest priority
            if (a.forretningsadresse?.postnummer === userLocation.postal && 
                b.forretningsadresse?.postnummer !== userLocation.postal) {
              return -1;
            }
            if (b.forretningsadresse?.postnummer === userLocation.postal && 
                a.forretningsadresse?.postnummer !== userLocation.postal) {
              return 1;
            }

            // Same city gets second priority
            const aInCity = a.forretningsadresse?.kommune.toLowerCase() === userLocation.city.toLowerCase();
            const bInCity = b.forretningsadresse?.kommune.toLowerCase() === userLocation.city.toLowerCase();
            if (aInCity && !bInCity) return -1;
            if (bInCity && !aInCity) return 1;

            // Same region gets third priority
            const aInRegion = a.forretningsadresse?.kommune.toLowerCase().includes(userLocation.region.toLowerCase());
            const bInRegion = b.forretningsadresse?.kommune.toLowerCase().includes(userLocation.region.toLowerCase());
            if (aInRegion && !bInRegion) return -1;
            if (bInRegion && !aInRegion) return 1;
          }

          // If location is same or no location, sort by reviews
          if (a.reviewCount > 0 && b.reviewCount > 0) {
            return b.reviewScore - a.reviewScore;
          }
          if (a.reviewCount > 0) return -1;
          if (b.reviewCount > 0) return 1;
          
          // Finally sort by name
          return a.navn.localeCompare(b.navn, 'nb');
        });

        setFilteredCompanies(sortedCompanies);
      } catch (error) {
        console.error('Error fetching companies and reviews:', error);
      }
    };

    fetchCompaniesWithReviews();
  }, [userLocation]); // Add userLocation as dependency

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.country === 'NO') { // Only process if user is in Norway
          setUserLocation({
            city: data.city,
            postal: data.postal,
            region: data.region,
            country: data.country
          });

          // Auto-filter companies based on location
          const nearbyCompanies = getBeautyClinics()
            .filter(company => {
              // First prioritize exact postal code match
              if (company.forretningsadresse?.postnummer === data.postal) {
                return true;
              }
              
              // Then check if company is in same city
              if (company.forretningsadresse?.kommune.toLowerCase() === data.city.toLowerCase()) {
                return true;
              }
              
              // Finally check if company is in same region
              return company.forretningsadresse?.kommune.toLowerCase().includes(data.region.toLowerCase());
            })
            .slice(0, MAX_ITEMS)
            .map(company => ({
              ...company,
              reviewScore: 0,
              reviewCount: 0,
              reviews: {
                averageRating: 0,
                totalReviews: 0
              }
            }));

          setFilteredCompanies(nearbyCompanies);
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchUserLocation();
  }, []); // Run once on mount

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    
    if (!/^\d{4}$/.test(term)) {
      const filtered = getBeautyClinics()
        .filter(company => {
          const upperName = company.navn.toUpperCase();
          return (
            !upperName.includes('GROUP') && 
            !upperName.includes('INVEST') &&
            (company.navn.toLowerCase().includes(term.toLowerCase()) ||
             company.forretningsadresse?.kommune.toLowerCase().includes(term.toLowerCase()))
          );
        })
        .slice(0, MAX_ITEMS)
        .map(company => ({
          ...company,
          reviewScore: 0,
          reviewCount: 0,
          reviews: {
            averageRating: 0,
            totalReviews: 0
          }
        }));
      setFilteredCompanies(filtered);
    }
  };

  const handleFilter = (filtered: Company[]) => {
    setCurrentPage(1); // Reset to first page when filtering
    setFilteredCompanies(filtered.map(company => ({
      ...company,
      reviewScore: 0,
      reviewCount: 0,
      reviews: {
        averageRating: 0,
        totalReviews: 0
      }
    })));
  };

  return (
    <>
      <Helmet>
        <title>Sammenlign og finn en god skjønnhetsklinikk i 2025 | Skjønnhetsklinikkguiden.no</title>
        <meta 
          name="description" 
          content="Finn og sammenlign skjønnhetsklinikker i hele Norge. Les kundevurderinger og velg riktig klinikk for dine behov. Få oversikt over behandlinger, priser og tilgjengelighet."
        />
        <meta 
          name="keywords" 
          content="skjønnhetsklinikk, kosmetisk behandling, botox, fillers, hudpleie, ansiktsbehandling, skjønnhetsbehandling"
        />
        <link rel="canonical" href="https://skjønnhetsklinikkguiden.no" />
        <meta property="og:title" content="Sammenlign og finn en god skjønnhetsklinikk i 2025" />
        <meta 
          property="og:description" 
          content="Finn og sammenlign skjønnhetsklinikker i hele Norge. Få oversikt over behandlinger og les kundevurderinger."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://skjønnhetsklinikkguiden.no" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="relative bg-cover bg-center py-16" style={{ backgroundImage: 'url(/bg.jpg)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-[2px]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="text-white lg:col-span-7 lg:pr-16">
                <h1 className="text-4xl font-bold tracking-tight leading-[1.1] mb-4">
                  Finn den beste skjønnhetsklinikken for deg!
                </h1>
                <p className="text-lg font-light opacity-90 mb-8 leading-relaxed">
                  Vi hjelper deg å finne den rette skjønnhetsklinikken. Sammenlign behandlinger, priser og les vurderinger fra tidligere kunder. Få oversikt over godkjente klinikker i hele Norge.
                </p>
                
                <SearchBar 
                  onSearch={handleSearch} 
                  className="mb-4" 
                  inputClassName="bg-white/95 border-0 text-lg py-3 text-gray-900 placeholder-gray-500"
                  dropdownClassName="bg-white/95 border-0 shadow-xl max-h-[300px] overflow-y-auto z-50"
                  optionClassName="hover:bg-blue-50 px-4 py-2 cursor-pointer text-gray-900"
                  selectClassName="text-gray-900 bg-white/95 border-0 rounded-lg"
                />
              </div>

              <div className="lg:col-span-5">
                <RequestOfferForm />
              </div>
            </div>
          </div>
        </div>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
            Våre behandlinger
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {TREATMENTS.map((treatment) => (
              <Link
                key={treatment.id}
                to={`/behandling/${treatment.id}`}
                className="group relative overflow-hidden rounded-lg shadow-lg aspect-[4/3]"
              >
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                <img
                  src={treatment.image}
                  alt={treatment.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.previousElementSibling?.remove();
                  }}
                  style={{ 
                    opacity: 0,
                    transition: 'opacity 0.5s ease-in-out'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-medium text-lg">
                      {treatment.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">
            <FilterSection 
              onFilter={handleFilter}
              companies={getBeautyClinics().slice(0, MAX_ITEMS)}
            />
            <div>
              {filteredCompanies.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {filteredCompanies.map((company) => (
                      <CompanyCard 
                        key={company.organisasjonsnummer} 
                        company={company as CompanyWithReviews} 
                      />
                    ))}
                  </div>

                  <div className="text-center text-gray-600 mt-4">
                    Viser {filteredCompanies.length} av {filteredCompanies.length} skjønnhetsklinikker
                    {filteredCompanies.length === MAX_ITEMS && (
                      <span className="ml-1">
                        (Søk eller filtrer for mer spesifikke resultater)
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">
            Finn skjønnhetsklinikk i din by
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {norwegianCities.map((city) => (
              <Link
                key={city}
                to={`/${city.toLowerCase()}`}
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-blue-900 hover:text-blue-700 text-center"
              >
                Skjønnhetsklinikk {city}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;