import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/utils/supabase';
import { Helmet } from 'react-helmet-async';
import { Calendar, ArrowRight } from 'lucide-react';

interface Guide {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  image_url: string | null;
}

const GuidesPage = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const { data, error } = await supabase
          .from('guides')
          .select('id, title, slug, created_at, image_url')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGuides(data || []);
      } catch (error) {
        console.error('Error fetching guides:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuides();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Laster guider...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Guider og Artikler | Regnskapsførerlisten.no</title>
        <meta 
          name="description" 
          content="Utforsk våre guider og artikler om regnskap, økonomi og bedriftsdrift" 
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Guider og Artikler
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Utforsk våre guider og artikler om regnskap, økonomi og bedriftsdrift
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide) => (
              <Link 
                key={guide.id} 
                to={`/guider/${guide.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  {guide.image_url ? (
                    <img
                      src={guide.image_url}
                      alt={guide.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-blue-50">
                      <span className="text-blue-300 text-4xl">📝</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-blue-900 mb-3 line-clamp-2">
                    {guide.title}
                  </h2>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(guide.created_at).toLocaleDateString('nb-NO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {guides.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              Ingen guider funnet
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GuidesPage; 