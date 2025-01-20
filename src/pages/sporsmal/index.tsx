import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/utils/supabase';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Search } from 'lucide-react';

interface Guide {
  id: string;
  title: string;
  slug: string;
}

const QuestionsPage = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const { data, error } = await supabase
          .from('guides')
          .select('id, title, slug')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGuides(data || []);
        setFilteredGuides(data || []);
      } catch (error) {
        console.error('Error fetching guides:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuides();
  }, []);

  useEffect(() => {
    const filtered = guides.filter(guide =>
      guide.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGuides(filtered);
  }, [searchTerm, guides]);

  return (
    <>
      <Helmet>
        <title>Spørsmål og svar om regnskap | Regnskapsførerlisten.no</title>
        <meta 
          name="description" 
          content="Finn svar på vanlige spørsmål om regnskap, bokføring, og økonomistyring for bedrifter" 
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Spørsmål og svar
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Alt du trenger å vite om regnskap, bokføring og økonomistyring for din bedrift
            </p>

            {/* Search Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Søk i spørsmål..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
          </div>

          {isLoading ? (
            <div>Laster innhold...</div>
          ) : (
            <div className="space-y-4">
              {filteredGuides.map((guide) => (
                <Link 
                  key={guide.id} 
                  to={`/sporsmal/${guide.slug}`}
                  className="block bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-blue-900 group-hover:text-blue-700">
                      {guide.title}
                    </h2>
                    <ArrowRight className="w-5 h-5 text-blue-500" />
                  </div>
                </Link>
              ))}

              {filteredGuides.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Ingen spørsmål funnet for "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuestionsPage; 