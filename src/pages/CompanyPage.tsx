import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, Users, Clock, CheckCircle, MapPin, ArrowRight } from "lucide-react";
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
import { RequestOfferForm } from "@/components/RequestOfferForm";
import { Helmet } from "react-helmet-async";
import { supabase } from '../utils/supabase';
import { TREATMENTS } from '@/types/treatments';
import { Treatment } from '@/types/treatments';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { getCompanyByNormalizedName, normalizeCompanyName } from '@/utils/companyData';
import type { Company } from '@/types/Company';

interface Review {
  id: string;
  org_number: string;
  rating: number;
  reviewer_name: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

const RelevantTreatments = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Populære behandlinger</h3>
      <div className="space-y-3">
        {TREATMENTS.slice(0, 8).map((treatment) => (
          <Link
            key={treatment.id}
            to={`/behandling/${treatment.id}`}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md group transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-purple-50 flex items-center justify-center">
                <img 
                  src={treatment.image} 
                  alt="" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-purple-600">
                  {treatment.title}
                </h4>
                {treatment.price && (
                  <p className="text-xs text-gray-500">
                    Fra kr {treatment.price.from},-
                  </p>
                )}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
          </Link>
        ))}
      </div>
    </div>
  );
};

const CompanyPage = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [location, setLocation] = useState({ lat: 59.9139, lng: 10.7522 }); // Oslo default coordinates
  const [company, setCompany] = useState<Company | undefined>(undefined);
  const [address, setAddress] = useState<string>('');
  
  const formattedName = name?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '0.75rem'
  };

  useEffect(() => {
    if (name) {
      const company = getCompanyByNormalizedName(name);
      setCompany(company);
      
      if (company?.forretningsadresse) {
        const { adresse, poststed, postnummer, kommune } = company.forretningsadresse;
        const fullAddress = `${adresse[0]}, ${postnummer} ${poststed}, ${kommune}, Norway`;
        setAddress(fullAddress);
      }
    }
  }, [name]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    if (address) {
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results?.[0]?.geometry?.location) {
          const { lat, lng } = results[0].geometry.location;
          setLocation({ 
            lat: lat(), 
            lng: lng() 
          });
        }
      });
    }
  }, [address]);

  const handleSubmitReview = async () => {
    if (!authorName || !newReview.comment || !company) {
      toast({
        title: "Feil",
        description: "Vennligst fyll ut alle feltene",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([
          {
            org_number: company.organisasjonsnummer, // Use actual org number
            rating: newReview.rating,
            reviewer_name: authorName,
            comment: newReview.comment,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Suksess!",
        description: "Takk for din anmeldelse",
      });

      // Reset form and close dialog
      setNewReview({ rating: 5, comment: "" });
      setAuthorName("");
      setIsReviewDialogOpen(false);
      
      // Refresh reviews
      fetchReviews();

    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke sende anmeldelsen. Prøv igjen senere.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchReviews = useCallback(async () => {
    if (!company) return;
    setIsLoading(true);
    
    try {
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('org_number', company.organisasjonsnummer) // Use actual org number
        .order('created_at', { ascending: false });

      if (error) throw error;

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
  }, [company, toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
          <div className="animate-spin text-purple-600">
            <Star className="w-8 h-8" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{formattedName} | Priser og behandlinger | Skjønnhetsklinikkguiden</title>
        <meta 
          name="description" 
          content={`Se priser og book time hos ${formattedName}. Vi tilbyr Botox, fillers, og andre skjønnhetsbehandlinger. Les kundeomtaler og sammenlign priser.`}
        />
        <meta 
          property="og:title" 
          content={`${formattedName} | Priser og behandlinger | Skjønnhetsklinikkguiden`} 
        />
        <meta 
          property="og:description" 
          content={`Utforsk behandlinger og priser hos ${formattedName}. Book time for konsultasjon og få personlig veiledning for dine skjønnhetsbehandlinger.`}
        />
        <meta property="og:type" content="website" />
        <meta 
          name="keywords" 
          content={`${formattedName}, skjønnhetsklinikk, botox, fillers, hudpleie, Oslo, skjønnhetsbehandlinger, priser`} 
        />
        <link rel="canonical" href={`https://skjonnhetsklinikkguiden.no/klinikk/${name}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        {/* Hero Section */}
        <div className="bg-[#2D1760] text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {formattedName}
                </h1>
                <div className="flex items-center text-purple-100">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{company?.forretningsadresse?.poststed}</span>
                </div>
              </div>
              <div className="flex items-center bg-[#3D2175]/50 px-4 py-2 rounded-full">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="ml-2 font-bold">{averageRating.toFixed(1)}</span>
                <span className="ml-1 text-purple-200">({totalReviews})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
                {/* Location Map */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-purple-900 mb-4">
                    Hvor du finner oss
                  </h2>
                  <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={location}
                      zoom={15}
                      onLoad={onMapLoad}
                    >
                      <Marker position={location} />
                    </GoogleMap>
                  </LoadScript>
                  <div className="mt-4 flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                    <span>
                      {company?.forretningsadresse?.adresse[0]}, {company?.forretningsadresse?.postnummer} {company?.forretningsadresse?.poststed}
                    </span>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-600 mb-2" />
                    <h3 className="font-semibold">Åpningstider</h3>
                    <p className="text-sm text-gray-600">Man-Fre: 09-17</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-purple-600 mb-2" />
                    <h3 className="font-semibold">Sertifiseringer</h3>
                    <p className="text-sm text-gray-600">Godkjent klinikk</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600 mb-2" />
                    <h3 className="font-semibold">Behandlere</h3>
                    <p className="text-sm text-gray-600">5 ansatte</p>
                  </div>
                </div>

                {/* Disclaimer Box */}
                <div className="bg-gray-100 p-4 rounded-lg mb-8 text-center">
                  <p className="text-sm text-gray-700">
                    Ingen samarbeid med denne klinikken - Besøk nettsiden til klinikken for prisoversikt over tjenester
                  </p>
                </div>

                {/* Reviews Section */}
                <div className="mt-12">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-purple-900">Kundeomtaler</h2>
                    <Button
                      onClick={() => setIsReviewDialogOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Skriv en omtale
                    </Button>
                  </div>
                  
                  {/* Reviews List */}
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-gray-600">{review.reviewer_name}</span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <RequestOfferForm />
              <RelevantTreatments />
            </div>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skriv en omtale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ditt navn
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Din omtale
              </label>
              <Textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => setIsReviewDialogOpen(false)} 
                variant="outline" 
                className="mr-2"
              >
                Avbryt
              </Button>
              <Button 
                onClick={handleSubmitReview} 
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? "Sender..." : "Send omtale"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompanyPage;
