import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/utils/supabase';
import { Helmet } from 'react-helmet-async';
import { Calendar, ArrowRight, PiggyBank } from 'lucide-react';

interface Guide {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  description: string;
  treatment_id: string;
  content: string;
  image_url: string | null;
}

const PrisguiderPage = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const { data, error } = await supabase
          .from('skjonnhet_prisguider')
          .select('id, title, slug, created_at, description, treatment_id, content, image_url')
          .order('created_at', { ascending: false });

        console.log('Guides data:', data); // Debug log
        console.log('Error if any:', error); // Debug log

        if (error) throw error;
        setGuides(data || []);
      } catch (error) {
        console.error('Detailed guides error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuides();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Laster prisguider...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Prisguider for Skjønnhetsbehandlinger | Skjønnhetsklinikkguiden.no</title>
        <meta 
          name="description" 
          content="Utforsk våre detaljerte prisguider for populære skjønnhetsbehandlinger. Få oversikt over gjennomsnittspriser, prisforskjeller og hva som påvirker kostnadene." 
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-purple-900 mb-4">
              Prisguider for Skjønnhetsbehandlinger
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Få innsikt i priser på populære behandlinger. Våre prisguider hjelper deg å forstå 
              kostnader, prisforskjeller og hva som påvirker prisene på ulike skjønnhetsbehandlinger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide) => (
              <Link 
                key={guide.id} 
                to={`/prisguider/${guide.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  {guide.image_url ? (
                    <img
                      src={guide.image_url}
                      alt={guide.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-48 bg-purple-50">
                      <PiggyBank className="w-12 h-12 text-purple-300" />
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-purple-900 mb-3 line-clamp-2 group-hover:text-purple-700">
                    {guide.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {guide.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(guide.created_at).toLocaleDateString('nb-NO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <ArrowRight className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {guides.length === 0 && (
            <div className="text-center text-gray-500 mt-8 p-8 bg-white rounded-lg shadow">
              <PiggyBank className="w-12 h-12 mx-auto text-purple-200 mb-4" />
              <p className="text-lg">Ingen prisguider er publisert ennå.</p>
              <p className="text-sm mt-2">Kom tilbake senere for oppdaterte prisguider for skjønnhetsbehandlinger.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PrisguiderPage; 