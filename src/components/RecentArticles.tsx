import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowRight } from "lucide-react";
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { supabase } from "@/utils/supabase";

interface Guide {
  id: string;
  title: string;
  description: string;
  slug: string;
  image_url: string;
  created_at: string;
}

interface RecentArticlesProps {
  showAll?: boolean;
}

export const RecentArticles: React.FC<RecentArticlesProps> = ({ showAll = false }) => {
  const [articles, setArticles] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('guides')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setArticles(data || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Laster artikler...</div>;
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-blue-900">
          Siste artikler og guider
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Les våre nyeste artikler om regnskap, økonomi og bedriftsdrift
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
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
  );
};