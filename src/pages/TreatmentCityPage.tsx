import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from "react-router-dom";
import { TREATMENTS } from "@/types/treatments";
import { Treatment } from "@/types/treatments";
import { Company } from "@/types/Company";
import { denormalizeMunicipalityName } from "@/utils/municipalityData";
import { CompanyCard } from "@/components/CompanyCard";
import { RequestOfferForm } from "@/components/RequestOfferForm";
import { getCompaniesByLocation } from "@/utils/companyData";
import { ChevronRight, Clock, CreditCard, CheckCircle } from "lucide-react";
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { supabase } from '@/utils/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { motion, useDragControls, useMotionValue } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const EXCLUDED_TERMS = ['invest', 'holding', 'group', 'konsern', 'finans'];
const ITEMS_PER_PAGE = 5;

interface TreatmentContent {
  id: string;
  treatment_id: string;
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
}

// Add interface for companies with reviews
interface CompanyWithReviews extends Company {
  averageRating?: number;
  totalReviews?: number;
}

const TreatmentCityPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [content, setContent] = useState<TreatmentContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { treatment: treatmentSlug, city } = useParams<{ treatment: string; city: string }>();
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [companiesWithReviews, setCompaniesWithReviews] = useState<CompanyWithReviews[]>([]);
  
  // Find the treatment
  const treatment = TREATMENTS.find(t => 
    t.id.toLowerCase() === treatmentSlug?.toLowerCase()
  );

  // Get all companies in the city first
  const allCityCompanies = getCompaniesByLocation(city || '');
  
  // Filter out non-relevant companies
  const filteredCompanies = allCityCompanies.filter(company => {
    const companyNameLower = company.navn.toLowerCase();
    
    // Exclude companies with certain terms in their names
    const shouldExclude = EXCLUDED_TERMS.some(term => 
      companyNameLower.includes(term)
    );
    
    return !shouldExclude;
  });

  // Sort companies: prioritize those that offer the treatment
  const sortedCompanies = filteredCompanies.sort((a, b) => {
    const aHasTreatment = hasTreatment(a, treatment);
    const bHasTreatment = hasTreatment(b, treatment);
    
    if (aHasTreatment && !bHasTreatment) return -1;
    if (!aHasTreatment && bHasTreatment) return 1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedCompanies.length / ITEMS_PER_PAGE);
  const paginatedCompanies = sortedCompanies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Add fetchCompanyReviews function
  const fetchCompanyReviews = useCallback(async (companies: Company[]) => {
    try {
      const reviewPromises = companies.map(async (company) => {
        const { data: reviews, error } = await supabase
          .from('reviews')
          .select('rating')
          .eq('org_number', company.organisasjonsnummer);

        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }

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
      setCompaniesWithReviews(companiesWithReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, []);

  // Update useEffect to fetch reviews when companies are loaded
  useEffect(() => {
    if (sortedCompanies.length > 0) {
      fetchCompanyReviews(sortedCompanies);
    }
  }, [sortedCompanies, fetchCompanyReviews]);

  // Update the pagination to use companiesWithReviews
  const paginatedCompaniesWithReviews = useMemo(() => {
    return companiesWithReviews
      .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [currentPage, companiesWithReviews]);

  // Helper function to check if company offers the treatment
  function hasTreatment(company: Company, treatment: Treatment | undefined): boolean {
    if (!treatment) return false;

    // Check treatments array
    return company.treatments?.some(t => 
      t.name.toLowerCase().includes(treatment.title.toLowerCase())
    ) || false;
  }

  // Fetch treatment content from Supabase
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('treatment_content')
          .select('*')
          .eq('treatment_id', treatmentSlug)
          .eq('published', true)
          .single();

        if (error) throw error;
        setContent(data);
      } catch (error) {
        console.error('Error fetching treatment content:', error);
      } finally {
        setLoading(false);
      }
    };

    if (treatmentSlug) {
      fetchContent();
    }
  }, [treatmentSlug]);

  // Function to process content and remove h1 tags
  const processContent = (content: string) => {
    // Remove h1 tags and their content using regex
    return content.replace(/<h1[^>]*>.*?<\/h1>/gi, '')
      // Also remove markdown # headers
      .replace(/^#\s.*$/gm, '');
  };

  // Add new state for categories slider
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // Categories scroll handling
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

  // Get unique categories and set first one as default
  const uniqueCategories = Array.from(
    new Set(TREATMENTS.map(t => t.category))
  ).filter((category): category is string => category !== undefined);

  // Initialize selectedCategory with the first category
  const [selectedCategory, setSelectedCategory] = useState<string | null>(uniqueCategories[0] || null);

  if (!treatment || !city) {
    return <div>Side ikke funnet</div>;
  }

  const pageTitle = `${treatment.title} i ${denormalizeMunicipalityName(city)} - Beste klinikker ${currentYear}`;

  // Add TreatmentCard component
  const TreatmentCard = ({ treatment }: { treatment: Treatment }) => (
    <div 
      onClick={() => navigate(`/behandling/${treatment.id}/${city}`)}
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
    >
      {treatment.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={treatment.image}
            alt={treatment.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">{treatment.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{treatment.shortDescription}</p>
        {treatment.price && (
          <p className="text-sm text-purple-600 font-medium">
            Fra kr {treatment.price.from.toLocaleString('no-NO')},-
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta 
          name="description" 
          content={`Finn de beste klinikkene for ${treatment.title.toLowerCase()} i ${denormalizeMunicipalityName(city)}. Sammenlign priser og les vurderinger.`}
        />
      </Helmet>

      {/* Breadcrumbs */}
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
                <Link to="/behandlinger" className="text-gray-500 hover:text-gray-700">
                  Behandlinger
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li>
                <Link to={`/behandling/${treatment.id}`} className="text-gray-500 hover:text-gray-700">
                  {treatment.title}
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li className="text-blue-600 font-medium">
                {denormalizeMunicipalityName(city)}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-b from-purple-100 to-white"
        style={{ 
          backgroundImage: treatment?.image ? `url(${treatment.image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-purple-100/90 to-white"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {treatment.title} i {denormalizeMunicipalityName(city)}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Finn de beste klinikkene for {treatment.title.toLowerCase()} i {denormalizeMunicipalityName(city)}. 
            Sammenlign priser og få gratis pristilbud.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8">
          {/* Main Content */}
          <div>
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Clock className="w-6 h-6 text-blue-600 mb-3" />
                <h3 className="font-semibold mb-2">Behandlingstid</h3>
                <p className="text-gray-600">
                  {treatment.duration ? (
                    `${treatment.duration.from}-${treatment.duration.to} minutter`
                  ) : (
                    'Varierer'
                  )}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <CreditCard className="w-6 h-6 text-blue-600 mb-3" />
                <h3 className="font-semibold mb-2">Pris fra</h3>
                <p className="text-gray-600">
                  {treatment.price ? (
                    <>kr {treatment.price.from.toLocaleString('no-NO')},-</>
                  ) : (
                    'Varierer'
                  )}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <CheckCircle className="w-6 h-6 text-blue-600 mb-3" />
                <h3 className="font-semibold mb-2">Antall klinikker</h3>
                <p className="text-gray-600">{sortedCompanies.length} i {denormalizeMunicipalityName(city)}</p>
              </div>
            </div>

            {/* Treatment Description */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
              {treatment.image && (
                <img 
                  src={treatment.image} 
                  alt={`${treatment.title} behandling`}
                  className="w-full rounded-md mb-8 object-cover"
                  style={{ maxHeight: '400px' }}
                />
              )}
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Om {treatment.title} behandling
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed mb-8">{treatment.shortDescription}</p>
                
                {treatment.fordeler.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Fordeler med behandlingen</h3>
                    <ul className="space-y-3">
                      {treatment.fordeler.map((fordel, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{fordel}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {treatment.ulemper.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Ting å være oppmerksom på</h3>
                    <ul className="space-y-3">
                      {treatment.ulemper.map((ulempe, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="flex-shrink-0 h-2 w-2 mt-2 rounded-full bg-blue-500 mr-3" />
                          <span className="text-gray-600">{ulempe}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Companies List */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Klinikker i {denormalizeMunicipalityName(city)}
              </h2>

              {sortedCompanies.length > 0 ? (
                <>
                  <div className="space-y-6">
                    {paginatedCompaniesWithReviews.map((company) => (
                      <div key={company.organisasjonsnummer}>
                        <CompanyCard 
                          company={company}
                          highlightedTreatment={treatment.title}
                          isRelevant={hasTreatment(company, treatment)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Pagination info */}
                  <div className="mt-4 text-sm text-gray-600">
                    Viser {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, sortedCompanies.length)} av {sortedCompanies.length} klinikker
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Forrige
                      </Button>
                      <span className="mx-4 flex items-center">
                        Side {currentPage} av {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Neste
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-600">
                  Ingen klinikker funnet i {denormalizeMunicipalityName(city)} enda.
                </p>
              )}
            </div>

            {/* Treatment Content from Supabase */}
            {!loading && content && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  {content.title}
                </h2>
                <article className="prose prose-lg max-w-none 
                  prose-headings:text-blue-900 
                  prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6 prose-h1:mt-8
                  [&_h2]:!text-[2rem] [&_h2]:!font-[600] [&_h2]:mb-4 [&_h2]:mt-12
                  [&_h3]:!text-[2rem] [&_h3]:!font-[600] [&_h3]:mb-4 [&_h3]:mt-8
                  prose-h4:text-xl prose-h4:font-semibold prose-h4:mb-3 prose-h4:mt-6
                  prose-h5:text-lg prose-h5:font-semibold prose-h5:mb-2 prose-h5:mt-4
                  prose-h6:text-base prose-h6:font-semibold prose-h6:mb-2 prose-h6:mt-4
                  prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
                  prose-p:mt-0 prose-p:[&:not(:first-child)]:mt-6
                  prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-blue-900 prose-strong:font-semibold
                  prose-ul:text-gray-600 prose-ul:list-disc prose-ul:ml-4 prose-ul:mb-6
                  prose-ol:text-gray-600 prose-ol:ml-4 prose-ol:mb-6
                  prose-li:marker:text-blue-500 prose-li:mb-2
                  prose-img:rounded-lg prose-img:shadow-md prose-img:my-8
                  prose-hr:border-gray-200 prose-hr:my-8
                  [&_table]:w-full [&_table]:border-collapse [&_table]:my-8
                  [&_th]:bg-blue-50 [&_th]:text-blue-900 [&_th]:font-semibold [&_th]:p-3 [&_th]:text-left [&_th]:border [&_th]:border-gray-200
                  [&_td]:p-3 [&_td]:border [&_td]:border-gray-200 [&_td]:text-gray-600
                  [&_tr:nth-child(even)]:bg-gray-50
                  [&_blockquote]:border-l-4 [&_blockquote]:border-blue-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-6
                  [&_code]:bg-gray-100 [&_code]:text-blue-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded
                  [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:my-6
                  [&_figure]:my-8 [&_figure]:mx-0
                  [&_figcaption]:text-center [&_figcaption]:text-gray-500 [&_figcaption]:mt-2
                  [&>*+*]:mt-6"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={{
                      // Prevent h1 from being rendered
                      h1: () => null,
                      a: ({node, ...props}) => (
                        <a {...props} className="text-blue-600 hover:text-blue-800 no-underline hover:underline" />
                      ),
                      table: ({node, ...props}) => (
                        <div className="overflow-x-auto">
                          <table {...props} />
                        </div>
                      ),
                      th: ({node, ...props}) => (
                        <th {...props} className="bg-blue-50 text-blue-900 font-semibold p-3 text-left border border-gray-200" />
                      ),
                      td: ({node, ...props}) => (
                        <td {...props} className="p-3 border border-gray-200 text-gray-600" />
                      ),
                    }}
                  >
                    {processContent(content.content)}
                  </ReactMarkdown>
                </article>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Request Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <RequestOfferForm 
                defaultTreatment={treatment.title}
                hideHeader={false}
                isTreatmentPage={true}
              />
            </div>

            {/* Similar Treatments */}
            {treatment.category && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Andre {treatment.category.toLowerCase()}
                </h3>
                <ul className="space-y-3">
                  {TREATMENTS
                    .filter(t => 
                      t.category === treatment.category && 
                      t.id !== treatment.id
                    )
                    .map(similarTreatment => (
                      <li key={similarTreatment.id}>
                        <Link 
                          to={`/behandling/${similarTreatment.id}/${city}`}
                          className="flex items-center text-gray-600 hover:text-purple-900"
                        >
                          <ChevronRight className="w-4 h-4 mr-2 text-purple-400" />
                          {similarTreatment.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Other Treatments in City */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Andre behandlinger i {denormalizeMunicipalityName(city)}
              </h3>
              <ul className="space-y-3">
                {TREATMENTS
                  .filter(t => t.id !== treatment.id)
                  .slice(0, 8) // Limit to 8 treatments
                  .map(otherTreatment => (
                    <li key={otherTreatment.id}>
                      <Link 
                        to={`/behandling/${otherTreatment.id}/${city}`}
                        className="flex items-center text-gray-600 hover:text-purple-900"
                      >
                        <ChevronRight className="w-4 h-4 mr-2 text-purple-400" />
                        {otherTreatment.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Treatment Categories Section */}
      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Utforsk flere behandlinger
          </h2>
          
          <div className="relative">
            {/* Improved scroller container */}
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50/50 relative">
              <div
                ref={scrollContainerRef}
                className="overflow-x-auto flex gap-4 p-6 no-scrollbar scroll-smooth"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <motion.div
                  drag="x"
                  dragControls={dragControls}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  dragMomentum={false}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
                  className="flex gap-6"
                >
                  {uniqueCategories.map((category) => {
                    const categoryTreatments = TREATMENTS.filter(t => t.category === category);
                    const firstTreatment = categoryTreatments[0];
                    
                    return (
                      <motion.div
                        key={category}
                        onClick={() => {
                          if (!isDragging) {
                            setSelectedCategory(
                              selectedCategory === category ? null : category
                            );
                          }
                        }}
                        className={cn(
                          "relative flex-shrink-0 cursor-pointer rounded-xl overflow-hidden group",
                          "w-[280px] h-[160px] transition-all duration-300",
                          "hover:ring-2 hover:ring-purple-400",
                          selectedCategory === category ? "ring-2 ring-purple-600 shadow-lg" : "shadow-sm"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {firstTreatment.image && (
                          <img
                            src={firstTreatment.image}
                            alt={category}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}
                        <div 
                          className={cn(
                            "absolute inset-0 p-6 flex flex-col justify-end",
                            "bg-gradient-to-t from-black/70 via-black/40 to-transparent",
                            selectedCategory === category && "from-purple-900/80 via-purple-800/40"
                          )}
                        >
                          <h3 className="text-white font-semibold text-xl mb-1">
                            {category}
                          </h3>
                          <p className="text-white/90 text-sm">
                            {categoryTreatments.length} behandlinger
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>

            {/* Improved scroll buttons */}
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 
                         bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 
                         transition-all duration-200 hover:scale-110 z-10
                         border border-gray-100"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}

            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 
                         bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 
                         transition-all duration-200 hover:scale-110 z-10
                         border border-gray-100"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Selected Category Treatments */}
          {selectedCategory && (
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {TREATMENTS
                .filter(t => t.category === selectedCategory)
                .map((treatment) => (
                  <TreatmentCard key={treatment.id} treatment={treatment} />
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TreatmentCityPage; 