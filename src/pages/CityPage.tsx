import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Star, Building2, Search, Info, Check, ChevronRight } from "lucide-react";
import { FilterSection } from "@/components/FilterSection";
import { useState, useEffect, useMemo, useRef } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CityLinks } from "@/components/CityLinks";
import { RecentArticles } from "@/components/RecentArticles";
import { getAccountingFirmsByLocation, normalizeCityName, getCompaniesByLocation, normalizeCompanyName } from '@/utils/companyData';
import { denormalizeMunicipalityName, getNearbyMunicipalities } from '@/utils/municipalityData';
import type { Company } from '@/types/Company';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Helmet } from "react-helmet-async";
import { supabase } from '../utils/supabase';
import { useToast } from "@/components/ui/use-toast";
import { findMunicipalityByPostalCode } from '@/utils/postalCodeUtils';
import { AccountantsMap } from '@/components/AccountantsMap';
import { convertCompaniesToAccountants } from "@/utils/accountantConverter";
import { RequestOfferForm } from "@/components/RequestOfferForm";

type CompanyWithReviews = Company & {
  reviewScore: number;
  reviewCount: number;
  reviews: {
    averageRating: number;
    totalReviews: number;
  };
};

const ITEMS_PER_PAGE = 10;

const CompanyCard = ({ company }: { company: Company }) => {
  const normalizedName = normalizeCompanyName(company.navn);
  const [reviews, setReviews] = useState<{ averageRating: number; totalReviews: number }>({
    averageRating: 0,
    totalReviews: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data: reviewsData, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('org_number', company.organisasjonsnummer);

        if (error) throw error;

        const totalReviews = reviewsData?.length || 0;
        const averageRating = totalReviews > 0
          ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          : 0;

        setReviews({
          averageRating,
          totalReviews
        });
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [company.organisasjonsnummer]);
  
  const getPremiumStyle = (rating: number) => {
    if (rating >= 4.8) {
      return "bg-gradient-to-br from-white to-amber-50 border-2 border-amber-200 shadow-xl hover:shadow-2xl hover:border-amber-300";
    }
    if (rating >= 4.5) {
      return "bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg hover:shadow-xl";
    }
    return "bg-white shadow-md hover:shadow-lg";
  };

  return (
    <div className={`p-6 rounded-lg transition-all duration-200 ${getPremiumStyle(reviews.averageRating)}`}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-16 h-16 rounded-lg flex items-center justify-center
          ${reviews.averageRating >= 4.8 ? 'bg-amber-100' : 
            reviews.averageRating >= 4.5 ? 'bg-blue-50' : 'bg-gray-100'}`}>
          <Building2 className={`w-8 h-8 
            ${reviews.averageRating >= 4.8 ? 'text-amber-600' : 
              reviews.averageRating >= 4.5 ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-blue-900">{company.navn}</h3>
            {reviews.averageRating >= 4.8 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                Premium
              </span>
            )}
            {reviews.averageRating >= 4.5 && reviews.averageRating < 4.8 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Anbefalt
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {isLoading ? (
              <span className="text-sm text-gray-400">Laster vurderinger...</span>
            ) : (
              <>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(reviews.averageRating)
                          ? reviews.averageRating >= 4.8 
                            ? "text-amber-400 fill-current"
                            : reviews.averageRating >= 4.5
                              ? "text-blue-500 fill-current"
                              : "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  {reviews.averageRating > 0 
                    ? `${reviews.averageRating.toFixed(1)} (${reviews.totalReviews} ${
                        reviews.totalReviews === 1 ? 'vurdering' : 'vurderinger'
                      })`
                    : 'Ingen vurderinger ennå'}
                </span>
              </>
            )}
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
      
      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <Link 
          to={`/regnskapsforer/${normalizedName}`}
          className={`font-medium ${
            reviews.averageRating >= 4.8 
              ? "text-amber-600 hover:text-amber-800" 
              : reviews.averageRating >= 4.5
                ? "text-blue-600 hover:text-blue-800"
                : "text-blue-600 hover:text-blue-800"
          }`}
        >
          {reviews.totalReviews > 0 ? 'Les vurderinger' : 'Mer om firma'} →
        </Link>
        <Link 
          to="/tilbud"
          className={`inline-flex items-center justify-center px-4 py-2 text-white font-medium rounded-md transition-colors ${
            reviews.averageRating >= 4.8 
              ? "bg-amber-600 hover:bg-amber-700" 
              : reviews.averageRating >= 4.5
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Få tilbud
        </Link>
      </div>
    </div>
  );
};

const CityPage = () => {
  const { city } = useParams<{ city: string }>();
  const capitalizedCity = city ? city.charAt(0).toUpperCase() + city.slice(1) : '';
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithReviews[]>([]);
  const [originalCityName, setOriginalCityName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'highest' | 'lowest'>('highest');
  const [formData, setFormData] = useState({
    companyName: '',
    postnumber: '',
    email: '',
    phone: '',
    acceptTerms: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [municipality, setMunicipality] = useState<string | null>(null);
  const [initialCompanies, setInitialCompanies] = useState<Company[]>([]);
  const [isFilterSticky, setIsFilterSticky] = useState(false);
  const companiesListRef = useRef<HTMLDivElement>(null);
  const filterSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (city) {
      const properCityName = denormalizeMunicipalityName(capitalizedCity);
      console.log('City changed:', properCityName);
      setOriginalCityName(properCityName);
      
      const foundCompanies = getAccountingFirmsByLocation(properCityName)
        .filter(company => company.naeringskode1?.kode === "69.201");
      console.log('Initial companies found:', foundCompanies.length);
      setInitialCompanies(foundCompanies);
      setCompanies(foundCompanies);

      const fetchAllReviews = async () => {
        try {
          const orgNumbers = foundCompanies.map(company => company.organisasjonsnummer);
          
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

          const companiesWithReviews: CompanyWithReviews[] = foundCompanies.map(company => {
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

          const sortedCompanies = [...companiesWithReviews].sort((a, b) => {
            if (a.reviewCount > 0 && b.reviewCount > 0) {
              return b.reviewScore - a.reviewScore;
            }
            if (a.reviewCount > 0) return -1;
            if (b.reviewCount > 0) return 1;
            return a.navn.localeCompare(b.navn, 'nb');
          });

          setFilteredCompanies(sortedCompanies);
        } catch (error) {
          console.error('Error fetching reviews:', error);
          const companiesWithoutReviews: CompanyWithReviews[] = foundCompanies.map(company => ({
            ...company,
            reviewScore: 0,
            reviewCount: 0,
            reviews: {
              averageRating: 0,
              totalReviews: 0
            }
          }));
          setFilteredCompanies(companiesWithoutReviews);
        }
      };

      fetchAllReviews();
      setCurrentPage(1);
    }
  }, [city, capitalizedCity]);

  useEffect(() => {
    const fetchAndSortCompanies = async () => {
      try {
        const orgNumbers = companies.map(company => company.organisasjonsnummer);
        
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

        let result: CompanyWithReviews[] = companies.map(company => {
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

        if (searchTerm) {
          result = result.filter(company => 
            company.navn.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.forretningsadresse?.adresse.some(addr => 
              addr.toLowerCase().includes(searchTerm.toLowerCase())
            )
          );
        }
        
        result.sort((a, b) => {
          if (a.reviewCount > 0 && b.reviewCount > 0) {
            return sortOrder === 'highest' 
              ? b.reviewScore - a.reviewScore
              : a.reviewScore - b.reviewScore;
          }
          if (a.reviewCount > 0) return -1;
          if (b.reviewCount > 0) return 1;
          return a.navn.localeCompare(b.navn, 'nb');
        });
        
        setFilteredCompanies(result);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchAndSortCompanies();
  }, [searchTerm, sortOrder, companies]);

  const accountingFirms = city ? getAccountingFirmsByLocation(city) : [];
  const normalizedCity = city ? normalizeCityName(city) : "";

  const nearbyMunicipalities = useMemo(() => {
    return getNearbyMunicipalities(originalCityName);
  }, [originalCityName]);

  // Convert filtered companies to Accountant type
  const accountants = useMemo(() => 
    convertCompaniesToAccountants(filteredCompanies),
    [filteredCompanies]
  );

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const webhookUrl = 'https://hook.eu1.make.com/qr6ty7qwlyziu9mrnq982sjcx3odv1s3';
      const webhookData = {
        city: originalCityName,
        ...formData,
        date: new Date().toISOString()
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) throw new Error('Failed to submit form');

      toast({
        title: "Forespørsel sendt!",
        description: "Vi tar kontakt med deg innen 24 timer.",
      });

      // Reset form
      setFormData({
        companyName: '',
        postnumber: '',
        email: '',
        phone: '',
        acceptTerms: true
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke sende forespørsel. Prøv igjen senere.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log('Companies state updated:', {
      length: companies.length,
      hasCompanies: companies.length > 0
    });
  }, [companies]);

  useEffect(() => {
    console.log('Filtered companies updated:', {
      length: filteredCompanies.length,
      hasFiltered: filteredCompanies.length > 0
    });
  }, [filteredCompanies]);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (companiesListRef.current && filterSectionRef.current) {
        const companiesRect = companiesListRef.current.getBoundingClientRect();
        const filterRect = filterSectionRef.current.getBoundingClientRect();
        
        // Check if we've scrolled past the original filter position
        const hasScrolledPastFilter = filterRect.top <= 0;
        // Check if companies list is still in view
        const isCompaniesVisible = companiesRect.top < window.innerHeight && companiesRect.bottom > 0;
        
        setIsFilterSticky(hasScrolledPastFilter && isCompaniesVisible);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!city) {
    return <div>By ikke funnet</div>;
  }

  if (initialCompanies.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/">
            <Button variant="outline" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tilbake til forsiden
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Ingen regnskapsførere funnet i {originalCityName}
          </h1>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <>
      <Helmet>
        <title>Regnskapsfører {originalCityName}: Anbefalte bedrifter i 2025</title>
        <meta 
          name="description" 
          content={`Finn den beste regnskapsføreren i ${originalCityName}. Sammenlign priser og les vurderinger fra andre bedrifter.`}
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <div className="relative bg-cover bg-center py-16" style={{ backgroundImage: 'url(/bg.jpg)' }}>
          <div className="absolute inset-0 bg-black/40" /> {/* Overlay */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumbs - replaces the back button */}
            <nav className="hidden md:flex items-center space-x-2 text-sm mb-6">
              <Link 
                to="/" 
                className="text-white hover:text-blue-200 transition-colors"
              >
                Hjem
              </Link>
              <ChevronRight className="w-4 h-4 text-white/60" />
              <span className="text-white/80">
                {originalCityName}
              </span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column - wider, with right padding on desktop */}
              <div className="text-white lg:col-span-7 lg:pr-16">
                <h1 className="text-4xl font-bold mb-4">
                  Regnskapsfører {originalCityName}: Anbefalte bedrifter i {new Date().getFullYear()}
                </h1>
                <p className="text-lg opacity-90 mb-4 hidden md:block">
                  Ikke gå glipp av de beste regnskapsførerne i {originalCityName}! 
                  Vi har samlet alle autoriserte regnskapsførere i området på ett sted, 
                  slik at du enkelt kan sammenligne tjenester og priser.
                </p>
                <p className="text-lg mb-6">
                  I <span className="font-semibold">{originalCityName}</span> finnes det{' '}
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-md font-bold">
                    {filteredCompanies.length}
                  </span>{' '}
                  <span className="text-blue-100">
                    regnskapsførere som står klar for å hjelpe deg
                  </span>
                </p>
              </div>

              {/* Right Column - narrower */}
              <div className="lg:col-span-5">
                <RequestOfferForm />
              </div>
            </div>
          </div>
        </div>

        {/* Rest of the content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search and sort controls */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Søk etter regnskapsfører..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full sm:w-[300px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="w-full sm:w-auto">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'highest' | 'lowest')}
                className="w-full sm:w-[200px] px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="highest">Høyest vurdert først</option>
                <option value="lowest">Lavest vurdert først</option>
              </select>
            </div>
          </div>
          
          {/* Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16" ref={companiesListRef}>
            <div className="lg:col-span-1" ref={filterSectionRef}>
              <div className={`
                lg:block
                ${isFilterSticky ? 
                  'fixed top-0 left-0 right-0 z-50 p-4 bg-white shadow-lg lg:relative lg:p-0 lg:shadow-none lg:bg-transparent' : 
                  'relative'
                }
              `}>
                <FilterSection 
                  onFilter={(filteredResults) => {
                    if (Array.isArray(filteredResults)) {
                      setCompanies(filteredResults);
                    }
                  }}
                  accountants={initialCompanies}
                />
              </div>
            </div>
            
            <div className="lg:col-span-3">
              {companies.length > 0 ? (
                filteredCompanies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paginatedCompanies.map((company) => (
                      <CompanyCard 
                        key={company.organisasjonsnummer} 
                        company={company}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Ingen treff på dette søket
                    </h3>
                    <p className="text-gray-600">
                      Prøv å justere filtrene dine for å se flere resultater
                    </p>
                  </div>
                )
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ingen regnskapsførere funnet
                  </h3>
                  <p className="text-gray-600">
                    Vi fant ingen regnskapsførere i {originalCityName}
                  </p>
                </div>
              )}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Forrige
              </Button>
              <span className="text-sm text-gray-600">
                Side {currentPage} av {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2"
              >
                Neste
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="text-center text-gray-600 mt-4">
            Viser {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, companies.length)} av {companies.length} regnskapsførere
          </div>

          <section className="mt-16 mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-[70%]">
                <h2 className="text-2xl font-semibold text-blue-900 mb-4">
                  Regnskapsfører i {originalCityName}
                </h2>
                <AccountantsMap 
                  accountants={accountants} 
                  city={originalCityName} 
                />
                <div className="prose prose-blue max-w-none">
                  <p className="text-gray-700 mb-6">
                    Å sammenligne regnskapsførere i {originalCityName} har aldri vært enklere. Vi har samlet alle autoriserte regnskapsførere 
                    i området på ett sted, slik at du enkelt kan sammenligne tjenester, priser og vurderinger fra andre bedrifter. Dette gjør 
                    det mulig å finne den regnskapsføreren som best matcher dine behov og budsjett.
                  </p>
                  <p className="text-gray-700 mb-8">
                    Vårt mål er å gjøre prosessen med å finne ny regnskapsfører i {originalCityName} så enkel som mulig. Med detaljerte 
                    profiler, genuine vurderinger og direkte kontaktmuligheter, kan du ta et informert valg for din bedrift. Vi viser også 
                    tilgjengelighet og spesialkompetanse for hver regnskapsfører.
                  </p>

                  <h2 className="text-2xl font-semibold text-blue-900 mt-8 mb-4">
                    Regnskapsfører pris i {originalCityName}
                  </h2>
                  <p className="text-gray-700 mb-6">
                    Prisene for regnskapsførertjenester i {originalCityName} varierer basert på bedriftens størrelse, kompleksitet og behov. 
                    De fleste regnskapsførere tilbyr både timepris og fastpris-avtaler. Her er en oversikt over typiske priser i markedet:
                  </p>

                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 mb-8">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tjeneste</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pris (eks. mva)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-700">Timepris regnskapsføring</td>
                          <td className="px-4 py-3 text-sm text-gray-700">900-1000 kr</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-700">Timepris rådgivning</td>
                          <td className="px-4 py-3 text-sm text-gray-700">945-1785 kr</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-700">Enkeltpersonforetak (årlig)</td>
                          <td className="px-4 py-3 text-sm text-gray-700">15 000-35 000 kr</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-700">AS med én ansatt (årlig)</td>
                          <td className="px-4 py-3 text-sm text-gray-700">36 000-55 000 kr</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-700">Lønnskjøring (per ansatt)</td>
                          <td className="px-4 py-3 text-sm text-gray-700">200-500 kr</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-700">MVA-oppgave</td>
                          <td className="px-4 py-3 text-sm text-gray-700">525-1050 kr</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-700">Årsoppgjør AS</td>
                          <td className="px-4 py-3 text-sm text-gray-700">6300-9450 kr</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-700">Årsoppgjør ENK</td>
                          <td className="px-4 py-3 text-sm text-gray-700">4200-6300 kr</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-sm text-gray-500 italic mb-8">
                    * Prisene er veiledende og kan variere mellom ulike regnskapsførere i {originalCityName}. 
                    Faktisk pris vil avhenge av bedriftens størrelse, kompleksitet og spesifikke behov.
                  </p>

                  <h2 className="text-2xl font-semibold text-blue-900 mt-12 mb-4">
                    Forskjell mellom regnskapsfører som driver AS og ENK?
                  </h2>
                  <div className="prose prose-blue max-w-none">
                    <p className="text-gray-700 mb-4">
                      Det er flere viktige forskjeller mellom regnskapsføring for AS (aksjeselskap) og ENK (enkeltpersonforetak):
                    </p>
                    
                    <h3 className="text-lg font-semibold text-blue-800 mt-6 mb-2">Juridisk status</h3>
                    <p className="text-gray-700 mb-4">
                      Den største forskjellen er at et AS er et eget juridisk objekt, mens et ENK ikke er det. Dette påvirker regnskapsføringen på flere måter:
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-6">
                      <li>I et AS må det være et klart skille mellom selskapets og eierens økonomi</li>
                      <li>For et ENK er eieren og foretaket samme juridiske enhet</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-blue-800 mt-6 mb-2">Regnskapskrav</h3>
                    <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-6">
                      <li>AS har alltid full regnskapsplikt</li>
                      <li>ENK har som regel kun bokføringsplikt, med mindre de har eiendeler verdt over 20 millioner kroner eller mer enn 20 årsverk</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-blue-800 mt-6 mb-2">Rapportering</h3>
                    <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-6">
                      <li>AS må levere årsregnskap til Brønnøysundregistrene årlig</li>
                      <li>ENK med omsetning over 50 000 kr må levere næringsoppgave med skattemeldingen, men trenger ikke sende årsregnskap til Brønnøysundregistrene</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-blue-800 mt-6 mb-2">Kompleksitet</h3>
                    <p className="text-gray-700 mb-2">
                      Regnskapsføring for AS er generelt mer komplisert enn for ENK. Dette skyldes blant annet:
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-6">
                      <li>Strengere krav til dokumentasjon</li>
                      <li>Mer omfattende rapporteringsplikt</li>
                      <li>Behov for å holde personlig og bedriftens økonomi adskilt</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-blue-800 mt-6 mb-2">Kostnader</h3>
                    <p className="text-gray-700 mb-6">
                      Regnskapsføring for AS er ofte dyrere enn for ENK på grunn av den økte kompleksiteten og arbeidsmengden.
                    </p>
                  </div>

                  <h2 className="text-2xl font-semibold text-blue-900 mt-12 mb-4">
                    Beste omtalte regnskapsfører {originalCityName}
                  </h2>
                  <p className="text-gray-700 mb-6">
                    Vi sammenligner og lar data og statistikk drive vår sortering av regnskapsførere. 
                    Under ser du de beste regnskapsførere i {new Date().toLocaleDateString('nb-NO', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })} basert på omtaler.
                  </p>

                  {filteredCompanies.some(company => (company.reviews?.averageRating || 0) > 0) ? (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                      {filteredCompanies
                        .filter(company => (company.reviews?.averageRating || 0) > 0)
                        .sort((a, b) => (b.reviews?.averageRating || 0) - (a.reviews?.averageRating || 0))
                        .slice(0, 5)
                        .map((company, index) => (
                          <div key={company.organisasjonsnummer} className="mb-4 last:mb-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-medium text-blue-900">
                                  {index + 1}.
                                </span>
                                <span className="text-gray-900">{company.navn}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < Math.round(company.reviews?.averageRating || 0)
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                  ({company.reviews?.totalReviews} {company.reviews?.totalReviews === 1 ? 'vurdering' : 'vurderinger'})
                                </span>
                              </div>
                            </div>
                            <div className="relative w-full h-2 bg-gray-100 rounded">
                              <div 
                                className="absolute left-0 top-0 h-full bg-blue-600 rounded"
                                style={{ width: `${((company.reviews?.averageRating || 0) / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <Info className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-medium text-blue-900">
                          Ingen vurderinger ennå
                        </h3>
                      </div>
                      <p className="text-gray-700">
                        Det er foreløpig ingen regnskapsførere i {originalCityName} som har mottatt vurderinger. 
                        Bli den første til å dele dine erfaringer og hjelp andre med å finne den beste regnskapsføreren.
                      </p>
                      <div className="mt-4">
                        <Link 
                          to={`/regnskapsforer/${normalizeCompanyName(companies[0]?.navn || '')}`}
                          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-2"
                          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                          Gi første vurdering
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}

                  <h3 className="text-xl text-blue-800 mt-6 mb-3">
                    Hvorfor velge en lokal regnskapsfører i {originalCityName}?
                  </h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li>Lokalkunnskap om næringslivet i {originalCityName}</li>
                    <li>Mulighet for personlige møter og tett oppfølging</li>
                    <li>God forståelse av lokale forskrifter og reguleringer</li>
                    <li>Nettverk med andre lokale bedrifter og næringsliv</li>
                  </ul>
                  <h3 className="text-xl text-blue-800 mt-6 mb-3">
                    Tjenester fra regnskapsførere i {originalCityName}
                  </h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li>Løpende regnskapsføring og årsoppgjør</li>
                    <li>Lønnskjøring og personaladministrasjon</li>
                    <li>Fakturering og betalingsoppfølging</li>
                    <li>Økonomisk rådgivning og budsjettplanlegging</li>
                    <li>MVA-rapportering og skatteberegning</li>
                  </ul>
                </div>
              </div>

              <div className="lg:w-[30%]">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">
                    Få tilbud fra regnskapsfører
                  </h3>
                  <form className="space-y-4" onSubmit={handleSubmitForm}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bedriftsnavn
                      </label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ditt firma AS"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postnummer
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.postnumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setFormData(prev => ({ ...prev, postnumber: value }));
                            
                            if (value.length === 4) {
                              const found = findMunicipalityByPostalCode(value);
                              setMunicipality(found);
                            } else {
                              setMunicipality(null);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="1234"
                          maxLength={4}
                          pattern="[0-9]{4}"
                          required
                        />
                        {municipality && (
                          <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                            <div className="flex items-center gap-1 text-emerald-600">
                              <Check className="w-4 h-4" />
                              <span className="text-sm font-medium">{municipality}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-post
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="din@epost.no"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Din telefon"
                        required
                      />
                    </div>
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={formData.acceptTerms}
                        onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                        className="mt-1"
                        required
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700">
                        Jeg godtar vilkårene til tjenesten
                      </label>
                    </div>
                    <Button className="w-full" type="submit" disabled={isSubmitting || !formData.acceptTerms}>
                      {isSubmitting ? "Sender..." : "Få tilbud"}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {nearbyMunicipalities.length > 0 && (
            <section className="mt-16 mb-8">
              <h2 className="text-2xl font-semibold text-blue-900 mb-8">
                Regnskapsfører i nærliggende kommuner
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {nearbyMunicipalities.map((municipality) => (
                  <Link
                    key={municipality}
                    to={`/${municipality.toLowerCase()}`}
                    className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-blue-900 hover:text-blue-700"
                  >
                    Regnskapsfører {municipality}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-16 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* ... existing city links ... */}
            </div>
          </section>

          <CityLinks />
          
          <div className="mt-16">
            <RecentArticles />
          </div>
        </div>
      </div>
    </>
  );
};

export default CityPage;