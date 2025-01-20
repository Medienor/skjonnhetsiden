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

const CompanyCard = ({ company }: { company: Company }) => {
  // Mock review score - in real app, this would come from your backend
  const reviewScore = (Math.random() * 2 + 3).toFixed(1);
  const reviewCount = Math.floor(Math.random() * 50) + 1;
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
                    i < Math.floor(Number(reviewScore))
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              {reviewScore} ({reviewCount} vurderinger)
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
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(() => {
    // Initially show only first MAX_ITEMS companies
    return getAccountingFirms().slice(0, MAX_ITEMS);
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    postnumber: '',
    email: '',
    phone: '',
    acceptTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [municipality, setMunicipality] = useState<string | null>(null);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    
    // Only filter companies if it's not a postal code search
    // (postal code searches are handled in SearchBar component)
    if (!/^\d{4}$/.test(term)) {
      const filtered = getAccountingFirms()
        .filter(company =>
          company.navn.toLowerCase().includes(term.toLowerCase()) ||
          company.forretningsadresse?.kommune.toLowerCase().includes(term.toLowerCase())
        )
        .slice(0, MAX_ITEMS);
      setFilteredCompanies(filtered);
    }
  };

  // Calculate pagination
  const totalPages = Math.min(Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE), 2);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const webhookUrl = 'https://hook.eu1.make.com/qr6ty7qwlyziu9mrnq982sjcx3odv1s3';
      const webhookData = {
        city: 'Homepage Form',
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
        acceptTerms: false
      });
      setMunicipality(null);
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
                  Finn din regnskapsfører
                </h1>
                <p className="text-lg opacity-90 mb-8">
                  Vi hjelper deg med å finne den beste regnskapsføreren for din bedrift
                </p>
                
                <div className="bg-white/95 p-6 rounded-lg shadow-lg backdrop-blur-sm">
                  <SearchBar 
                    onSearch={handleSearch} 
                    className="mb-4" 
                    inputClassName="bg-white border-2 border-gray-200 text-lg py-3 text-gray-900 placeholder-gray-500"
                    dropdownClassName="bg-white border border-gray-200 shadow-xl max-h-[300px] overflow-y-auto z-50"
                    optionClassName="hover:bg-blue-50 px-4 py-2 cursor-pointer text-gray-900"
                    selectClassName="text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Få gratis tilbud fra regnskapsførere
                  </h2>
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

                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700" 
                      type="submit" 
                      disabled={isSubmitting || !formData.acceptTerms}
                    >
                      {isSubmitting ? "Sender..." : "Få tilbud"}
                    </Button>
                    <p className="text-center text-sm text-gray-500">
                      Tjenesten er gratis og helt uforpliktende!
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <FilterSection 
                  onFilter={setFilteredCompanies} 
                  accountants={getAccountingFirms()}
                />
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {paginatedCompanies.map((company) => (
                  <CompanyCard key={company.organisasjonsnummer} company={company} />
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