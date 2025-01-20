import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/utils/supabase';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, Building2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { shuffle } from 'lodash';

interface Guide {
  id: string;
  title: string;
  content: string;
  created_at: string;
  slug: string;
  image_url?: string;
}

interface MinimalGuide {
  id: string;
  title: string;
  slug: string;
  image_url?: string;
}

const MAJOR_CITIES = [
  "Oslo",
  "Bergen",
  "Trondheim",
  "Stavanger",
  "Drammen",
  "Kristiansand",
  "Tromsø",
  "Fredrikstad",
  "Sandnes",
  "Ålesund"
];

const QuestionPage = () => {
  const { slug } = useParams();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [relatedGuides, setRelatedGuides] = useState<Guide[]>([]);
  const [randomGuides, setRandomGuides] = useState<MinimalGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    acceptTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchGuideAndRelated = async () => {
      try {
        const { data: guideData, error: guideError } = await supabase
          .from('guides')
          .select('id, title, content, created_at, slug')
          .eq('slug', slug)
          .single();

        if (guideError) throw guideError;
        setGuide(guideData);

        if (guideData) {
          const { data: relatedData, error: relatedError } = await supabase
            .from('guides')
            .select('id, title, content, created_at, slug, image_url')
            .neq('id', guideData.id)
            .limit(5);

          if (relatedError) throw relatedError;
          setRelatedGuides(relatedData || []);
        }

        // Fetch all guides for random selection
        const { data: allGuides, error: guidesError } = await supabase
          .from('guides')
          .select('id, title, content, created_at, slug, image_url')
          .neq('slug', slug)
          .limit(10);

        if (guidesError) throw guidesError;
        // Randomly select 2 guides
        setRandomGuides(shuffle(allGuides || []).slice(0, 2));
        
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchGuideAndRelated();
    }
  }, [slug]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Add your form submission logic here
    setTimeout(() => setIsSubmitting(false), 1000);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">Laster...</div>;
  }

  if (!guide) {
    return <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">Artikkelen ble ikke funnet</div>;
  }

  return (
    <>
      <Helmet>
        <title>{guide.title} | Regnskapsførerlisten.no</title>
        <meta name="description" content={`Les mer om ${guide.title}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <div className="relative bg-cover bg-center py-16" style={{ backgroundImage: 'url(/bg.jpg)' }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumbs */}
            <nav className="hidden md:flex items-center space-x-2 text-sm mb-6">
              <Link 
                to="/" 
                className="text-white hover:text-blue-200 transition-colors"
              >
                Hjem
              </Link>
              <ChevronRight className="w-4 h-4 text-white/60" />
              <Link 
                to="/sporsmal" 
                className="text-white hover:text-blue-200 transition-colors"
              >
                Spørsmål
              </Link>
              <ChevronRight className="w-4 h-4 text-white/60" />
              <span className="text-white/80">
                {guide?.title}
              </span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column - Content */}
              <div className="text-white lg:col-span-7 lg:pr-16">
                <h2 className="text-4xl font-bold mb-4">
                  {guide.title}
                </h2>
                <p className="text-lg opacity-90">
                  Få svar på dine spørsmål om regnskap og økonomistyring
                </p>
              </div>

              {/* Right Column - Form */}
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

        {/* Article Content with Sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <article className="lg:w-[70%]">
              <div className="prose prose-lg max-w-none">
                <style>{`
                  .prose h2 {
                    color: #1e3a8a;
                    font-size: 1.875rem;
                    margin-top: 2.5rem;
                    margin-bottom: 1.25rem;
                    font-weight: 600;
                    line-height: 1.3;
                  }
                  .prose h3 {
                    color: #1e3a8a;
                    font-size: 1.5rem;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    font-weight: 600;
                    line-height: 1.3;
                  }
                  .prose p {
                    margin-top: 1.25rem;
                    margin-bottom: 1.25rem;
                    line-height: 1.8;
                    color: #374151;
                  }
                  .prose ul {
                    margin-top: 1.25rem;
                    margin-bottom: 1.25rem;
                    list-style-type: disc;
                    padding-left: 1.5rem;
                  }
                  .prose ul li {
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                    padding-left: 0.5rem;
                    color: #374151;
                  }
                  .prose ul li::marker {
                    color: #2563eb;
                  }
                  .prose ul ul {
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                    list-style-type: circle;
                  }
                  .prose ul ul li::marker {
                    color: #6b7280;
                  }
                  .prose strong {
                    color: #1e3a8a;
                    font-weight: 600;
                  }
                  .prose img {
                    width: 100%;
                    min-height: 300px;
                    max-height: 300px;
                    object-fit: cover;
                    border-radius: 0.5rem;
                    margin-top: 2rem;
                    margin-bottom: 2rem;
                  }
                  .prose a {
                    color: #2563eb;
                    text-decoration: none;
                  }
                  .prose a:hover {
                    text-decoration: underline;
                  }
                  .prose table {
                    width: 100%;
                    margin-top: 2rem;
                    margin-bottom: 2rem;
                    border-collapse: collapse;
                    font-size: 0.95rem;
                    line-height: 1.5;
                  }
                  .prose thead {
                    background-color: #f8fafc;
                    border-bottom: 2px solid #e2e8f0;
                  }
                  .prose th {
                    color: #1e3a8a;
                    font-weight: 600;
                    padding: 0.75rem 1rem;
                    text-align: left;
                  }
                  .prose td {
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid #e2e8f0;
                    color: #374151;
                  }
                  .prose tr:hover {
                    background-color: #f8fafc;
                  }
                  @media (max-width: 640px) {
                    .prose table {
                      display: block;
                      overflow-x: auto;
                      -webkit-overflow-scrolling: touch;
                    }
                    .prose td, 
                    .prose th {
                      white-space: nowrap;
                      min-width: 120px;
                    }
                  }
                  .prose .image-container {
                    width: 100%;
                    min-height: 300px;
                    max-height: 300px;
                    margin: 2rem 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    border-radius: 0.5rem;
                  }
                `}</style>
                <div dangerouslySetInnerHTML={{ 
                  __html: guide.content.replace(
                    /<h1>(.*?)<\/h1>/,
                    '<h2>$1</h2>'
                  )
                }} />

                {/* Read More Section */}
                <div className="mt-12 space-y-6">
                  <h2 className="text-2xl font-bold text-blue-900 mb-6">Les også</h2>
                  {randomGuides.map((randomGuide) => (
                    <Link
                      key={randomGuide.id}
                      to={`/sporsmal/${randomGuide.slug}`}
                      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      <div className="flex items-center">
                        <div className="flex-1 p-6">
                          <h3 className="text-lg font-medium text-blue-900 group-hover:text-blue-700 transition-colors">
                            {randomGuide.title}
                          </h3>
                        </div>
                        {randomGuide.image_url && (
                          <div className="w-48 h-32 flex-shrink-0">
                            <img
                              src={randomGuide.image_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:w-[30%]">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">
                  Relaterte spørsmål
                </h2>
                <div className="space-y-4">
                  {relatedGuides.map((relatedGuide) => (
                    <Link
                      key={relatedGuide.id}
                      to={`/sporsmal/${relatedGuide.slug}`}
                      className="block group"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-gray-700 group-hover:text-blue-700 transition-colors">
                          {relatedGuide.title}
                        </h3>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-700 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          {/* New City Section */}
          <div className="mt-16 border-t pt-16">
            <h2 className="text-3xl font-bold text-blue-900 mb-8">
              Finn en regnskapsfører i din by
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {MAJOR_CITIES.map((city) => (
                <Link
                  key={city}
                  to={`/${city.toLowerCase()}`}
                  className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group"
                >
                  <Building2 className="w-5 h-5 text-blue-500 mr-2 group-hover:text-blue-700" />
                  <span className="text-gray-700 group-hover:text-blue-700">
                    {city}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionPage; 