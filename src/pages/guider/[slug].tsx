import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/utils/supabase';
import { Helmet } from 'react-helmet-async';

interface Guide {
  title: string;
  content: string;
  created_at: string;
}

const GuidePage = () => {
  const { slug } = useParams();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const { data, error } = await supabase
          .from('guides')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setGuide(data);
      } catch (error) {
        console.error('Error fetching guide:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuide();
  }, [slug]);

  if (isLoading) {
    return <div>Laster...</div>;
  }

  if (!guide) {
    return <div>Guide ikke funnet</div>;
  }

  return (
    <>
      <Helmet>
        <title>{guide.title} | Regnskapsførerlisten.no</title>
        <meta name="description" content={`Guide om ${guide.title}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: guide.content }} />
          </article>
        </div>
      </div>
    </>
  );
};

export default GuidePage; 