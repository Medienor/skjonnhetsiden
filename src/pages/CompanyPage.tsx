import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Star, Calendar, Users, Building, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { RelatedCompanies } from "@/components/RelatedCompanies";
import { CityLinks } from "@/components/CityLinks";
import { RecentArticles } from "@/components/RecentArticles";
import type { Accountant, Review } from "@/types/accountant";
import { getCompanyByNormalizedName, getAccountingFirms } from "@/utils/companyData";
import { convertCompanyToAccountant, convertCompaniesToAccountants } from "@/utils/accountantConverter";
import { Helmet } from "react-helmet-async";
import { supabase } from '../utils/supabase';
import { findMunicipalityByPostalCode } from '@/utils/postalCodeUtils';

interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

const CompanyPage = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // States with proper initialization
  const [reviews, setReviews] = useState<Review[]>([]);  // Initialize as empty array
  const [isLoading, setIsLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Add form state
  const [formData, setFormData] = useState({
    companyName: '',
    postnumber: '',
    email: '',
    phone: '',
    acceptTerms: false
  });
  const [municipality, setMunicipality] = useState<string | null>(null);

  // Find company first
  const company = useMemo(() => 
    name ? getCompanyByNormalizedName(name) : undefined,
    [name]
  );

  // Then convert to accountant
  const accountant = useMemo(() => 
    company ? convertCompanyToAccountant(company) : undefined,
    [company]
  );

  // Convert all companies for related companies component
  const allAccountants = useMemo(() => 
    convertCompaniesToAccountants(getAccountingFirms()),
    []
  );

  const fetchReviews = useCallback(async () => {
    if (!accountant) return;
    setIsLoading(true);
    
    try {
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('org_number', accountant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate average rating
      const totalReviews = reviewsData?.length || 0;
      const averageRating = totalReviews > 0
        ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

      setReviews(reviewsData || []);
      setAverageRating(averageRating);
      setTotalReviews(totalReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke hente anmeldelser. Prøv igjen senere.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [accountant, toast]);

  const handleSubmitReview = async () => {
    if (!accountant) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([
          {
            org_number: accountant.id,
            rating: newReview.rating,
            reviewer_name: authorName,
            comment: newReview.comment,
          }
        ]);

      if (error) throw error;

      // Show success message
      toast({
        title: "Takk for din anmeldelse!",
        description: "Din tilbakemelding er viktig for oss.",
      });

      // Reset form and close dialog
      setNewReview({ rating: 5, comment: "" });
      setAuthorName("");
      setIsReviewDialogOpen(false);

      // Refresh reviews
      await fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke legge til anmeldelse. Prøv igjen senere.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initial fetch of reviews
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Redirect if company not found
  useEffect(() => {
    if (name && !company) {
      navigate('/');
    }
  }, [name, company, navigate]);

  // If no accountant, show error page
  if (!accountant) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-red-600">Firma ikke funnet</h1>
        </div>
      </div>
    );
  }

  // Create SEO description with key information
  const seoDescription = `${accountant.name} er et regnskapskontor i ${accountant.location}. ` +
    `Etablert ${accountant.establishedYear}. ${accountant.fullDescription} ` +
    `Les omtaler og vurderinger fra andre bedrifter.`;

  // Add form handler
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Add your form submission logic here
    setTimeout(() => {
      setIsSubmitting(false);
      // Add success handling
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Regnskapsfører: {accountant.name} - Les omtaler</title>
        <meta name="description" content={seoDescription} />
        
        {/* Additional SEO meta tags */}
        <meta property="og:title" content={`Regnskapsfører: ${accountant.name} - Les omtaler`} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="nb_NO" />
        
        {/* Schema.org markup for rich snippets */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AccountingService",
            "name": accountant.name,
            "description": accountant.fullDescription,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": accountant.location,
              "addressCountry": "NO"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": averageRating,
              "reviewCount": totalReviews
            },
            "foundingDate": accountant.establishedYear,
            "numberOfEmployees": accountant.employees,
            "priceRange": accountant.priceRange
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Grid layout for main content and form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main content - 70% */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-blue-900">{accountant.name}</h1>
                    <p className="text-lg text-gray-600 mt-2">{accountant.location}</p>
                  </div>
                  <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                    <span className="ml-2 text-xl font-bold">{Number(averageRating).toFixed(1)}</span>
                    <span className="ml-2 text-sm text-gray-600">({totalReviews})</span>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                    <Calendar className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Etablert</p>
                      <p className="font-semibold">{accountant.establishedYear}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                    <Users className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Ansatte</p>
                      <p className="font-semibold">{accountant.employees}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                    <Building className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Timepris</p>
                      <p className="font-semibold">{accountant.priceRange}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-2xl font-semibold text-blue-900 mb-4">Om oss</h2>
                  <p className="text-gray-700 leading-relaxed">{accountant.fullDescription}</p>
                </div>
                
                <div className="mt-8">
                  <h2 className="text-2xl font-semibold text-blue-900 mb-4">Tjenester</h2>
                  <div className="flex flex-wrap gap-2">
                    {accountant.services.map((service) => (
                      <Badge key={service} variant="secondary" className="text-sm">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-12">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-blue-900">Anmeldelser</h2>
                    <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>Skriv en anmeldelse</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Skriv din anmeldelse</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Ditt navn</label>
                            <input
                              type="text"
                              value={authorName}
                              onChange={(e) => setAuthorName(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                              placeholder="Skriv ditt navn"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Vurdering</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-6 h-6 cursor-pointer ${
                                    star <= newReview.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                  onClick={() => setNewReview({ ...newReview, rating: star })}
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Din kommentar</label>
                            <Textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              placeholder="Fortell om din erfaring..."
                              className="min-h-[100px]"
                            />
                          </div>
                          <Button 
                            onClick={handleSubmitReview} 
                            className="w-full"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Sender..." : "Send inn anmeldelse"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-6">
                    {isLoading ? (
                      <p className="text-center text-gray-600">Laster anmeldelser...</p>
                    ) : reviews && reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="bg-gray-50 p-6 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{review.reviewer_name || 'Anonym'}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(review.created_at).toLocaleDateString('nb-NO')}
                              </p>
                            </div>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mt-3 text-gray-700">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-8">
                        Ingen anmeldelser ennå. Vær den første til å anmelde {accountant.name}!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form section - 30% */}
            <div className="lg:col-span-4">
              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-lg shadow-xl border-2 border-blue-100 sticky top-4">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-blue-900 mb-2">
                    Få tilbud fra inntil 3 regnskapsførere!
                  </h2>
                  <p className="text-blue-700">
                    Gratis og uforpliktende sammenligning av priser
                  </p>
                </div>
                
                <form className="space-y-4" onSubmit={handleSubmitForm}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Bedriftsnavn
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ditt firma AS"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      E-post
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="din@epost.no"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Din telefon"
                      required
                    />
                  </div>
                  <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-md">
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
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6" 
                    type="submit" 
                    disabled={isSubmitting || !formData.acceptTerms}
                  >
                    {isSubmitting ? "Sender..." : "Få tilbud nå"}
                  </Button>
                  <div className="text-center space-y-2 mt-4">
                    <p className="text-sm font-medium text-gray-600">
                      ✓ 100% gratis og uforpliktende
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      ✓ Svar innen 24 timer
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Rest of the content */}
          <RelatedCompanies currentCompany={accountant} allCompanies={allAccountants} />
          <CityLinks />
          <RecentArticles />
        </div>
      </div>
    </>
  );
};

export default CompanyPage;
