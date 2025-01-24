import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Star, Building2, Search, Info, Check, ChevronRight, ChevronLeft, Plus, Minus, MapPin } from "lucide-react";
import { FilterSection } from "@/components/FilterSection";
import { useState, useEffect, useMemo, useRef, MouseEvent, useCallback } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CityLinks } from "@/components/CityLinks";
import { RecentArticles } from "@/components/RecentArticles";
import { 
  getAccountingFirmsByLocation, 
  normalizeCityName, 
  getCompaniesByLocation, 
  normalizeCompanyName,
  getBeautyClinicsByLocation
} from '@/utils/companyData';
import { denormalizeMunicipalityName, getNearbyMunicipalities, isMunicipalityValid, getAllMunicipalities, findMunicipalityByName } from '@/utils/municipalityData';
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
import { useNavigate } from "react-router-dom";
import { TREATMENTS, Treatment } from "@/types/treatments";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, useDragControls, useMotionValue } from "framer-motion";

interface CompanyWithReviews extends Company {
  averageRating?: number;
  totalReviews?: number;
}

const ITEMS_PER_PAGE = 10;

const CompanyCard = ({ company }: { company: CompanyWithReviews }) => {
  const navigate = useNavigate();
  const normalizedName = normalizeCompanyName(company.navn);
  const isPremium = useMemo(() => {
    if (!company.averageRating || !company.totalReviews) return false;
    return company.averageRating > 4.8 && company.totalReviews > 0;
  }, [company.averageRating, company.totalReviews]);

  const ratingDisplay = useMemo(() => {
    if (!company.averageRating || !company.totalReviews) {
      return 'Ingen vurderinger ennå';
    }
    return `(${company.totalReviews} vurderinger)`;
  }, [company.averageRating, company.totalReviews]);

  return (
    <div className={cn(
      "relative rounded-lg transition-all duration-200",
      isPremium 
        ? "bg-gradient-to-br from-white via-purple-50/30 to-purple-100/20 border-2 border-purple-200/80 p-8 shadow-xl shadow-purple-100/50"
        : "bg-white p-6 border border-gray-200",
      "hover:shadow-md"
    )}>
      {isPremium && (
        <div className="absolute -top-4 left-6 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg shadow-purple-200/50">
          <Star className="w-4 h-4" />
          Topp-rangert klinikk
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className={cn(
          "w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0",
          isPremium 
            ? "bg-gradient-to-br from-purple-100 to-purple-50 ring-2 ring-purple-200 shadow-inner"
            : "bg-gray-100"
        )}>
          <Building2 className={cn(
            "w-8 h-8",
            isPremium ? "text-purple-600" : "text-gray-400"
          )} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{company.navn}</h3>
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    company.averageRating && i < Math.floor(company.averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              {ratingDisplay}
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
      {company.naeringskode1 && (
        <p className="text-gray-500 text-sm mb-4">
          {company.naeringskode1.beskrivelse}
        </p>
      )}
      
      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <Link 
          to={`/klinikk/${normalizedName}`}
          className={cn(
            "font-medium flex items-center",
            isPremium ? "text-purple-700 hover:text-purple-900" : "text-blue-600 hover:text-blue-800"
          )}
        >
          Se full profil →
        </Link>
        <Button 
          variant={isPremium ? "default" : "outline"} 
          size="sm"
          onClick={() => navigate('/tilbud')}
          className={cn(
            isPremium && "bg-purple-900 hover:bg-purple-800 text-white shadow-lg shadow-purple-100/50"
          )}
        >
          Be om tilbud
        </Button>
      </div>
    </div>
  );
};

// Update the FilterSection props interface
interface FilterSectionProps {
  onFilter: (filteredResults: CompanyWithReviews[]) => void;
  companies: Company[];
}

// Get unique categories and filter out undefined values
const categories = Array.from(
  new Set(TREATMENTS.map(t => t.category).filter((c): c is string => c !== undefined))
);

const TreatmentCard = ({ treatment }: { treatment: Treatment }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-[16/9] relative bg-gray-100">
        {treatment.image && (
          <>
            <div className={cn(
              "absolute inset-0 bg-gray-200 animate-pulse",
              imageLoaded && "hidden"
            )} />
            <img
              src={treatment.image}
              alt={treatment.title}
              loading="lazy"
              className={cn(
                "w-full h-full object-cover transition-all duration-300",
                !imageLoaded && "opacity-0",
                imageLoaded && "opacity-100"
              )}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900">
          {treatment.title}
        </h3>
        {treatment.shortDescription && (
          <p className="text-gray-600 text-sm mt-1">
            {treatment.shortDescription}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          {treatment.price && (
            <div className="text-sm text-gray-500">
              Fra kr {treatment.price.from},-
            </div>
          )}
          {treatment.duration && (
            <div className="text-sm text-gray-500">
              {treatment.duration.from} min
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <Link 
            to={`/behandling/${treatment.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Les mer →
          </Link>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showDetails ? <Minus size={20} /> : <Plus size={20} />}
          </button>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {treatment.fordeler.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Fordeler:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {treatment.fordeler.map((fordel, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {fordel}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {treatment.ulemper.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Ulemper:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {treatment.ulemper.map((ulempe, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {ulempe}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Create a separate component for the category card
const CategoryCard = ({ 
  category, 
  treatment, 
  isSelected, 
  isDragging, 
  onSelect 
}: { 
  category: string;
  treatment: Treatment;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const categoryTreatments = TREATMENTS.filter(t => t.category === category);

  return (
    <motion.div
      onClick={() => !isDragging && onSelect()}
      className={cn(
        "relative flex-shrink-0 cursor-pointer rounded-lg overflow-hidden group",
        "w-[200px] h-[120px] transition-all duration-300",
        isSelected 
          ? "ring-2 ring-purple-600" 
          : "hover:ring-2 hover:ring-purple-400"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn(
        "absolute inset-0 bg-gray-200 animate-pulse",
        imageLoaded && "hidden"
      )} />
      
      {treatment.image && (
        <img
          src={treatment.image}
          alt={category}
          loading="lazy"
          className={cn(
            "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
            !imageLoaded && "opacity-0",
            imageLoaded && "opacity-100"
          )}
          onLoad={() => setImageLoaded(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 p-4 flex flex-col justify-end">
        <h3 className="text-white font-semibold text-lg">
          {category}
        </h3>
        <p className="text-white/80 text-sm">
          {categoryTreatments.length} behandlinger
        </p>
      </div>
    </motion.div>
  );
};

const NearbyCities = ({ currentCity }: { currentCity: string }) => {
  const municipalities = getAllMunicipalities();
  const currentMunicipality = findMunicipalityByName(currentCity);
  
  // If we can't find the current municipality, try to find nearby cities by name matching
  if (!currentMunicipality) {
    // Get all major cities as fallback
    const majorCities = municipalities
      .filter(m => getCompaniesByLocation(m.name).length > 5)
      .slice(0, 6);
    
    if (majorCities.length === 0) return null;

    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Andre populære byer med skjønnhetsklinikker
        </h2>
        {/* Rest of the rendering code */}
      </section>
    );
  }

  // First try to get cities from the same county
  let nearbyCities = municipalities.filter(m => 
    m.countyNumber === currentMunicipality.countyNumber && 
    m.name !== currentMunicipality.name &&
    getCompaniesByLocation(m.name).length > 0 // Only include cities with clinics
  );

  // If we don't have enough cities from the same county, add nearby counties
  if (nearbyCities.length < 3) {
    const nearbyCounties = [
      currentMunicipality.countyNumber - 1,
      currentMunicipality.countyNumber + 1
    ];

    const additionalCities = municipalities.filter(m => 
      nearbyCounties.includes(m.countyNumber) &&
      getCompaniesByLocation(m.name).length > 0
    );

    nearbyCities = [...nearbyCities, ...additionalCities];
  }

  // Sort by number of clinics and take top 6
  nearbyCities = nearbyCities
    .sort((a, b) => 
      getCompaniesByLocation(b.name).length - getCompaniesByLocation(a.name).length
    )
    .slice(0, 6);

  if (nearbyCities.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Andre skjønnhetsklinikker i nærheten av {denormalizeMunicipalityName(currentCity)}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {nearbyCities.map((city) => {
          const clinicCount = getCompaniesByLocation(city.name).length;
          
          return (
            <Link
              key={city.name}
              to={`/klinikk/${normalizeCompanyName(city.name)}`}
              className="group bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                    Skjønnhetsklinikker i {denormalizeMunicipalityName(city.name)}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {clinicCount} {clinicCount === 1 ? 'klinikk' : 'klinikker'}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-purple-600 font-medium group-hover:translate-x-1 transition-transform">
                Se alle klinikker →
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

const TreatmentLinks = ({ city }: { city: string }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">
        Populære behandlinger i {denormalizeMunicipalityName(city)}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {TREATMENTS.map((treatment) => (
          <div 
            key={treatment.id}
            className="pb-3 border-b border-gray-100 hover:border-purple-200 transition-colors"
          >
            <Link
              to={`/behandling/${treatment.id}/${city.toLowerCase()}`}
              className="text-purple-900 hover:text-purple-700 font-medium block transition-colors"
            >
              {treatment.title} i {denormalizeMunicipalityName(city)}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

const CityPage = () => {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] || '');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const currentYear = new Date().getFullYear();
  const [companiesWithReviews, setCompaniesWithReviews] = useState<CompanyWithReviews[]>([]);
  
  useEffect(() => {
    if (!city) return;
    const properCityName = denormalizeMunicipalityName(city);
    const allCompanies = getCompaniesByLocation(properCityName);
    console.log(`Found ${allCompanies.length} companies in ${properCityName}`);
    setCompanies(allCompanies);
    setFilteredCompanies(allCompanies);
  }, [city]);

  const handleFilter = (filtered: Company[]) => {
    setCurrentPage(1);
    setFilteredCompanies(filtered);
  };

  // Simple pagination
  const currentCompanies = filteredCompanies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial state
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Create the title string first
  const pageTitle = `Skjønnhetsklinikk ${denormalizeMunicipalityName(city || '')}: Beste klinikker i ${currentYear}`;

  // Add this function to fetch reviews for all companies
  const fetchCompanyReviews = useCallback(async (companies: Company[]) => {
    try {
      const reviewPromises = companies.map(async (company) => {
        // Add console.log to debug
        console.log('Fetching reviews for:', company.organisasjonsnummer);
        
        const { data: reviews, error } = await supabase
          .from('reviews')
          .select('rating')
          .eq('org_number', company.organisasjonsnummer);

        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }

        console.log('Reviews found:', reviews?.length || 0);

        const totalReviews = reviews?.length || 0;
        const averageRating = totalReviews > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          : 0;

        return {
          ...company,
          averageRating,
          totalReviews
        };
      });

      const companiesWithReviews = await Promise.all(reviewPromises);
      console.log('Companies with reviews:', companiesWithReviews);
      setCompaniesWithReviews(companiesWithReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, []);

  // Update useEffect to fetch reviews when companies change
  useEffect(() => {
    if (companies.length > 0) {
      fetchCompanyReviews(companies);
    }
  }, [companies, fetchCompanyReviews]);

  // Update the companies list to use companiesWithReviews
  const currentCompaniesWithReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return companiesWithReviews
      .slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, companiesWithReviews]);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta 
          name="description" 
          content={`Finn de beste skjønnhetsklinikkene i ${denormalizeMunicipalityName(city || '')}. Sammenlign priser og les vurderinger av klinikker i ${denormalizeMunicipalityName(city || '')} ${currentYear}.`}
        />
      </Helmet>

      {/* Add Breadcrumbs */}
      <div className="bg-white/50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-700">
                  Hjem
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li>
                <Link to="/klinikker" className="text-gray-500 hover:text-gray-700">
                  Klinikker
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li className="text-blue-600 font-medium">
                {denormalizeMunicipalityName(city || '')}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section with dark background */}
      <div className="relative bg-cover bg-center py-16" style={{ backgroundImage: 'url(/bg.jpg)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-[2px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="text-white lg:col-span-7 lg:pr-16">
              <Link 
                to="/"
                className="inline-flex items-center text-white/80 hover:text-white mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tilbake til forsiden
              </Link>

              <h1 className="text-4xl font-bold tracking-tight leading-[1.1] mb-4">
                Skjønnhetsklinikker i {denormalizeMunicipalityName(city || '')}
              </h1>
              <p className="text-lg font-light opacity-90 mb-8 leading-relaxed">
                Vi har funnet {companies.length} skjønnhetsklinikker i {denormalizeMunicipalityName(city || '')}. 
                Sammenlign behandlinger, priser og les vurderinger fra tidligere kunder.
              </p>
              
              <SearchBar 
                onSearch={() => {}} 
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

      {/* Main content with white background */}
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Treatment Categories Section - Reduced width */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Behandlinger i {denormalizeMunicipalityName(city || '')}
          </h2>
          
          <div className="relative">
            <div className="overflow-hidden rounded-lg border relative">
              <div 
                ref={scrollContainerRef}
                className="overflow-x-auto scrollbar-hide touch-pan-x cursor-grab active:cursor-grabbing"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                <motion.div 
                  className="flex space-x-4 p-4 w-max"
                  drag="x"
                  dragControls={dragControls}
                  dragConstraints={scrollContainerRef}
                  dragElastic={0.2}
                  dragMomentum={false}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                  style={{ x }}
                >
                  {categories.map((category) => {
                    const categoryTreatments = TREATMENTS.filter(t => t.category === category);
                    const firstTreatment = categoryTreatments[0];
                    
                    if (!firstTreatment) return null;
                    
                    return (
                      <CategoryCard
                        key={category}
                        category={category}
                        treatment={firstTreatment}
                        isSelected={selectedCategory === category}
                        isDragging={isDragging}
                        onSelect={() => setSelectedCategory(category)}
                      />
                    );
                  })}
                </motion.div>
              </div>
            </div>

            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-10"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            
            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-10"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Selected Category Treatments */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {TREATMENTS.filter(t => t.category === selectedCategory).map((treatment) => (
              <TreatmentCard key={treatment.id} treatment={treatment} />
            ))}
          </div>
        </div>

        {/* Companies List Section - Fixed layout */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <FilterSection 
                onFilter={handleFilter}
                companies={companies}
              />
            </div>

            {/* Companies List */}
            <div>
              {filteredCompanies.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {currentCompaniesWithReviews.map((company) => (
                      <CompanyCard 
                        key={company.navn} 
                        company={company}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <span className="py-2 px-4 text-sm">
                        Side {currentPage} av {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <div className="text-center text-gray-600 mt-4">
                    Viser {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredCompanies.length)} av {filteredCompanies.length} bedrifter
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Ingen bedrifter funnet i {denormalizeMunicipalityName(city || '')}
                    </h2>
                    <p className="mt-2 text-gray-600">
                      Prøv å søke i nærliggende områder eller justere filtrene.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add the new TreatmentLinks section */}
        <div className="border-t border-gray-100">
          <TreatmentLinks city={city || ''} />
        </div>

        {/* Existing NearbyCities section */}
        <div className="border-t border-gray-100">
          <NearbyCities currentCity={city || ''} />
        </div>
      </div>
    </>
  );
};

export default CityPage;