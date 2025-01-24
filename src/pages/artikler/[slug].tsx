import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/utils/supabase';
import { Button } from '@/components/ui/button';
import { RequestOfferForm } from '@/components/RequestOfferForm';
import { ArrowLeft, ChevronRight, Clock, User, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { TREATMENTS } from '@/types/treatments';
import { motion } from 'framer-motion';
import { TreatmentCard } from '@/components/TreatmentCard';
import { cn } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  image_url: string;
  category: string;
  meta_title: string;
  meta_description: string;
  created_at: string;
  treatment_id: string;
}

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const categories = Array.from(
    new Set(TREATMENTS.map(t => t.category).filter((c): c is string => c !== undefined))
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0] || 'injections' // provide a default category
  );
  const [isDragging, setIsDragging] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from('treatment_guides')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        console.error('Error fetching article:', error);
        return;
      }

      setArticle(data);
      setLoading(false);
    };

    fetchArticle();
  }, [slug]);

  const treatment = article?.treatment_id ? TREATMENTS.find(t => t.id === article.treatment_id) : null;

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left'
        ? containerRef.current.scrollLeft - scrollAmount
        : containerRef.current.scrollLeft + scrollAmount;
      
      containerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Artikkel ikke funnet</h1>
        <p className="mt-2 text-gray-600">Beklager, vi kunne ikke finne artikkelen du leter etter.</p>
        <Button asChild className="mt-4">
          <Link to="/artikler">← Tilbake til artikler</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.meta_title}</title>
        <meta name="description" content={article.meta_description} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Breadcrumbs */}
        <div className="bg-white/50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link to="/" className="text-gray-500 hover:text-gray-700">
                    Hjem
                  </Link>
                </li>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <li>
                  <Link to="/artikler" className="text-gray-500 hover:text-gray-700">
                    Artikler
                  </Link>
                </li>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <li className="text-blue-600 font-medium">
                  {article.title}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative bg-cover bg-center py-16" 
             style={{ backgroundImage: `url(${treatment?.image || article.image_url})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-[2px]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="text-white lg:col-span-7 lg:pr-16">
                <h1 className="text-4xl font-bold tracking-tight leading-[1.1] mb-4">
                  {article.title}
                </h1>
                <p className="text-lg font-light opacity-90 mb-8 leading-relaxed">
                  {article.description}
                </p>
              </div>

              <div className="lg:col-span-5">
                <RequestOfferForm />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section with 70/30 Split */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content Column (70%) */}
            <div className="lg:col-span-8">
              <article className="prose prose-lg max-w-none 
                prose-headings:text-blue-900 
                prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6 prose-h1:mt-8
                [&_h2]:!text-[2rem] [&_h2]:!font-[600] [&_h2]:mb-4 [&_h2]:mt-12
                [&_h3]:!text-[2rem] [&_h3]:!font-[600] [&_h3]:mb-4 [&_h3]:mt-8
                prose-h4:text-xl prose-h4:font-semibold prose-h4:mb-3 prose-h4:mt-6
                prose-h5:text-lg prose-h5:font-semibold prose-h5:mb-2 prose-h5:mt-4
                prose-h6:text-base prose-h6:font-semibold prose-h6:mb-2 prose-h6:mt-4
                prose-p:text-gray-600 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-8
                [&_p]:leading-[1.8] [&_p]:text-[1.125rem]
                prose-p:mt-0 prose-p:[&:not(:first-child)]:mt-6
                prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-blue-900 prose-strong:font-semibold
                prose-ul:text-gray-600 prose-ul:list-disc prose-ul:ml-4 prose-ul:mb-6
                prose-ol:text-gray-600 prose-ol:ml-4 prose-ol:mb-6
                prose-li:marker:text-blue-500 prose-li:mb-2
                prose-img:rounded-lg prose-img:shadow-md prose-img:my-8
                prose-hr:border-gray-200 prose-hr:my-8
                [&_table]:w-full [&_table]:border-collapse [&_table]:my-8
                [&_th]:bg-blue-50 [&_th]:text-blue-900 [&_th]:font-semibold [&_th]:p-3 [&_th]:text-left [&_th]:border [&_th]:border-gray-200
                [&_td]:p-3 [&_td]:border [&_td]:border-gray-200 [&_td]:text-gray-600
                [&_tr:nth-child(even)]:bg-gray-50
                [&_blockquote]:border-l-4 [&_blockquote]:border-blue-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-6
                [&_code]:bg-gray-100 [&_code]:text-blue-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded
                [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:my-6
                [&_figure]:my-8 [&_figure]:mx-0
                [&_figcaption]:text-center [&_figcaption]:text-gray-500 [&_figcaption]:mt-2
                [&>*+*]:mt-6
                mb-16"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    a: ({node, ...props}) => (
                      <a {...props} className="text-blue-600 hover:text-blue-800 no-underline hover:underline" />
                    ),
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto">
                        <table {...props} />
                      </div>
                    ),
                    th: ({node, ...props}) => (
                      <th {...props} className="bg-blue-50 text-blue-900 font-semibold p-3 text-left border border-gray-200" />
                    ),
                    td: ({node, ...props}) => (
                      <td {...props} className="p-3 border border-gray-200 text-gray-600" />
                    ),
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </article>

              {/* Related Articles Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Relaterte artikler
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* We'll need to implement this once we have more articles */}
                </div>
              </div>
            </div>

            {/* Sidebar Column (30%) */}
            <aside className="lg:col-span-4">
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-lg">
                  <RequestOfferForm />
                </div>

                {treatment && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-900 to-purple-800 p-6">
                      <h3 className="text-xl font-semibold text-white mb-1">
                        Om {treatment.title}
                      </h3>
                      <p className="text-purple-100/80 text-sm">
                        Kort om behandlingen
                      </p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        {treatment.price && (
                          <div className="space-y-1">
                            <span className="text-sm text-gray-500">Pris fra</span>
                            <p className="text-lg font-semibold text-gray-900">
                              {treatment.price.from.toLocaleString('no-NO')} kr
                            </p>
                          </div>
                        )}
                        {treatment.duration && (
                          <div className="space-y-1">
                            <span className="text-sm text-gray-500">Varighet</span>
                            <p className="text-lg font-semibold text-gray-900">
                              {treatment.duration.from}-{treatment.duration.to} min
                            </p>
                          </div>
                        )}
                      </div>

                      <Button 
                        asChild
                        className="w-full bg-purple-900 hover:bg-purple-800 text-white"
                      >
                        <Link to={`/behandling/${treatment.id}`}>
                          Les mer om behandlingen
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        {/* Treatment Categories Section */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Utforsk behandlinger
            </h2>
            
            <div className="relative">
              <div className="overflow-hidden rounded-lg border relative">
                <div
                  ref={containerRef}
                  onScroll={handleScroll}
                  className="overflow-x-auto flex gap-4 p-4 scrollbar-hide"
                >
                  <motion.div
                    className="flex gap-4"
                    drag="x"
                    dragConstraints={{ right: 0, left: -1000 }}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                  >
                    {categories.map((category) => {
                      const categoryTreatments = TREATMENTS.filter(t => t.category === category);
                      const firstTreatment = categoryTreatments[0];
                      
                      if (!firstTreatment) return null;
                      
                      return (
                        <motion.div
                          key={category}
                          onClick={() => !isDragging && setSelectedCategory(category)}
                          className={cn(
                            "relative flex-shrink-0 cursor-pointer rounded-lg overflow-hidden group",
                            "w-[200px] h-[120px] transition-all duration-300",
                            selectedCategory === category 
                              ? "ring-2 ring-purple-600" 
                              : "hover:ring-2 hover:ring-purple-400"
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {firstTreatment.image && (
                            <img
                              src={firstTreatment.image}
                              alt={category}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 p-4 flex flex-col justify-end">
                            <h3 className="text-white font-semibold text-lg">
                              {category}
                            </h3>
                            <p className="text-white/80 text-sm">
                              {categoryTreatments.length} behandlinger
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </div>

              {showLeftArrow && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-10"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}

              {showRightArrow && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-10"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>

            {/* Selected Category Treatments */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {TREATMENTS.filter(t => t.category === selectedCategory).map((treatment) => (
                <TreatmentCard key={treatment.id} treatment={treatment} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticlePage; 