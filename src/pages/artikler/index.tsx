import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/utils/supabase';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Newspaper } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  category: string;
  created_at: string;
}

const ArtiklerPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from('treatment_guides')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
        return;
      }

      setArticles(data);
      setLoading(false);
    };

    fetchArticles();
  }, []);

  return (
    <>
      <Helmet>
        <title>Artikler og guider om skjønnhetsbehandlinger | Skjønnhetsklinikkguiden</title>
        <meta 
          name="description" 
          content="Les våre artikler og guider om ulike skjønnhetsbehandlinger. Få innsikt i prosedyrer, etterbehandling og resultater."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Artikler og guider
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Få innsikt i ulike skjønnhetsbehandlinger gjennom våre informative artikler og guider
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link 
                key={article.id} 
                to={`/artikler/${article.slug}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow p-6">
                  <div className="uppercase tracking-wide text-sm text-purple-600 font-semibold mb-2">
                    {article.category}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {article.description}
                  </p>
                  <div className="flex items-center text-purple-600">
                    <span className="text-sm font-medium">Les mer</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && articles.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ingen artikler ennå
            </h3>
            <p className="text-gray-600">
              Kom tilbake senere for spennende artikler og guider
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ArtiklerPage; 