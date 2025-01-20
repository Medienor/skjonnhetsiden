import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { FilterSection } from "@/components/FilterSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import type { Company } from "@/types/Company";
import { getAccountingFirms, normalizeCompanyName } from "@/utils/companyData";
import { Button } from "@/components/ui/button";
import { Star, Building2, Check } from "lucide-react";
import { getAllMunicipalities, findMunicipalityByPostalCode } from "@/utils/municipalityData";
import { Helmet } from "react-helmet-async";
import { toast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { ArrowRight } from "lucide-react";
import { supabase } from '../utils/supabase';
import { RequestOfferForm } from '@/components/RequestOfferForm';

const cityArticles = [
  {
    city: "Oslo",
    title: "Velge regnskapsfører i Oslo",
    description: "Oslo har Norges største utvalg av regnskapsførere. Her er hva du bør se etter.",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7"
  },
  {
    city: "Bergen",
    title: "Finn rett regnskapsfører i Bergen",
    description: "Bergen har mange spesialiserte regnskapsførere for maritime næringer og tech-startups.",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
  },
  {
    city: "Stavanger",
    title: "Regnskapsførere i Stavanger",
    description: "Oljebyen har regnskapsførere med bred erfaring fra energisektoren.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c"
  },
  {
    city: "Trondheim",
    title: "Velg regnskapsfører i Trondheim",
    description: "Teknologihovedstaden har mange regnskapsførere som er eksperter på tech-selskaper.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
  },
  {
    city: "Drammen",
    title: "Regnskapsførere i Drammen",
    description: "Finn en lokal regnskapsfører som kjenner næringslivet i Drammen.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e"
  }
];

const norwegianCities = [
  "Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", 
  "Fredrikstad", "Tromsø", "Sandnes", "Kristiansand", "Lillestrøm",
  "Ålesund", "Tønsberg", "Moss", "Haugesund", "Sandefjord",
  "Arendal", "Bodø", "Larvik", "Askøy", "Sarpsborg",
  "Kongsberg", "Molde"
];

const ITEMS_PER_PAGE = 10;
const MAX_ITEMS = 20;

interface Article {
  id: string;
  title: string;
  description: string;
  slug: string;
  image_url: string;
  created_at: string;
}

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

const CompanyCard = ({ company }: { company: CompanyWithReviews }) => {
  const normalizedName = normalizeCompanyName(company.navn);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-8 h-8 text-gray-400" />
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
        <p className="text-gray-600 mb-2">
          {company.forretningsadresse.adresse.join(', ')}<br />
          {company.forretningsadresse.postnummer} {company.forretningsadresse.poststed}
        </p>
      )}
      {company.telefon && (
        <p className="text-gray-600">Tlf: {company.telefon}</p>
      )}
      {company.mobil && (
        <p className="text-gray-600">Mobil: {company.mobil}</p>
      )}
      
      <div className="mt-4 pt-4 border-t">
        <Link 
          to={`/regnskapsforer/${normalizedName}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Les vurderinger →
        </Link>
      </div>
    </div>
  );
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithReviews[]>(() => {
    // Initially show only first MAX_ITEMS companies without reviews
    return getAccountingFirms()
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
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [userLocation, setUserLocation] = useState<IpLocation | null>(null);

  useEffect(() => {
    const fetchCompaniesWithReviews = async () => {
      try {
        const initialCompanies = getAccountingFirms().slice(0, MAX_ITEMS);
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
        console.error('Error fetching reviews:', error);
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
          const nearbyCompanies = getAccountingFirms()
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
      const filtered = getAccountingFirms()
        .filter(company =>
          company.navn.toLowerCase().includes(term.toLowerCase()) ||
          company.forretningsadresse?.kommune.toLowerCase().includes(term.toLowerCase())
        )
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

  // Calculate pagination
  const totalPages = Math.min(Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE), 2);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    const fetchRecentArticles = async () => {
      try {
        const { data: articles, error } = await supabase
          .from('guides')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(9);

        if (error) throw error;
        setRecentArticles(articles || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    fetchRecentArticles();
  }, []);

  const handleFilter = (filtered: Company[]) => {
    // Transform regular companies into CompanyWithReviews
    const companiesWithReviews = filtered.map(company => ({
      ...company,
      reviewScore: 0,
      reviewCount: 0,
      reviews: {
        averageRating: 0,
        totalReviews: 0
      }
    }));
    setFilteredCompanies(companiesWithReviews);
  };

  return (
    <>
      <Helmet>
        <title>Sammenlign og finn en god regnskapsfører i 2025 | Regnskapsførerlisten.no</title>
        <meta 
          name="description" 
          content="Finn og sammenlign regnskapsførere i hele Norge. Få gratis pristilbud fra kvalifiserte regnskapsførere i ditt nærområde. Les kundevurderinger og velg riktig regnskapsfører for din bedrift."
        />
        <meta 
          name="keywords" 
          content="regnskapsfører, autorisert regnskapsfører, regnskapskontor, sammenlign regnskapsførere, regnskapstjenester, bokføring"
        />
        <link rel="canonical" href="https://regnskapsførerlisten.no" />
        <meta property="og:title" content="Sammenlign og finn en god regnskapsfører i 2025" />
        <meta 
          property="og:description" 
          content="Finn og sammenlign regnskapsførere i hele Norge. Få gratis pristilbud og les kundevurderinger."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://regnskapsførerlisten.no" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="relative bg-cover bg-center py-16" style={{ backgroundImage: 'url(/bg.jpg)' }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="text-white lg:col-span-7 lg:pr-16">
                <h1 className="text-4xl font-bold mb-4">
                  {userLocation ? (
                    `Finn regnskapsfører i ${userLocation.city}`
                  ) : (
                    'Finn din regnskapsfører'
                  )}
                </h1>
                <p className="text-lg opacity-90 mb-8">
                  {userLocation ? (
                    `Vi har funnet ${filteredCompanies.length} regnskapsførere i nærheten av ${userLocation.city}`
                  ) : (
                    'Vi hjelper deg med å finne den beste regnskapsføreren for din bedrift'
                  )}
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <FilterSection 
                  onFilter={handleFilter}
                  accountants={getAccountingFirms()}
                />
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {paginatedCompanies.map((company) => (
                  <CompanyCard 
                    key={company.organisasjonsnummer} 
                    company={company as CompanyWithReviews} 
                  />
                ))}
              </div>

              {/* Pagination - simplified for max 2 pages */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    1
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(2)}
                    disabled={currentPage === 2}
                  >
                    2
                  </Button>
                </div>
              )}

              <div className="text-center text-gray-600 mt-4">
                Viser {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredCompanies.length)} av {filteredCompanies.length} regnskapsførere
                {filteredCompanies.length === MAX_ITEMS && (
                  <span className="ml-1">
                    (Søk eller filtrer for mer spesifikke resultater)
                  </span>
                )}
              </div>
            </div>
          </div>

          <section className="mt-16">
            <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">
              Velg regnskapsfører i din by
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cityArticles.map((article) => (
                <Card key={article.city} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.city}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-900">{article.title}</CardTitle>
                    <CardDescription>{article.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link 
                      to={`/${article.city.toLowerCase()}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Les mer →
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">
              Finn regnskapsfører i din by
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {norwegianCities.map((city) => (
                <Link
                  key={city}
                  to={`/${city.toLowerCase()}`}
                  className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-blue-900 hover:text-blue-700"
                >
                  Regnskapsfører {city}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900">
              Siste artikler og guider
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Les våre nyeste artikler om regnskap, økonomi og bedriftsdrift
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentArticles.map((article) => (
              <Link 
                key={article.id} 
                to={`/sporsmal/${article.slug}`}
                className="group"
              >
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50">
                        <Building2 className="w-12 h-12 text-blue-200" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      {format(new Date(article.created_at), 'd. MMMM yyyy', { locale: nb })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3">
                      {article.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/sporsmal"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              Se alle artikler
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;