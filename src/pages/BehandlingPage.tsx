import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TREATMENTS } from '@/types/treatments';
import { RequestOfferForm } from '@/components/RequestOfferForm';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Loader2, ChevronRight, Clock, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { TreatmentMeta } from '@/components/TreatmentMeta';

interface TreatmentContent {
  id: string;
  treatment_id: string;
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
}

export const BehandlingPage = () => {
  const { id } = useParams<{ id: string }>();
  const treatment = TREATMENTS.find(t => t.id === id);
  const [content, setContent] = useState<TreatmentContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('treatment_content')
          .select('*')
          .eq('treatment_id', id)
          .eq('published', true)
          .single();

        if (error) throw error;
        setContent(data);
      } catch (error) {
        console.error('Error fetching treatment content:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContent();
    }
  }, [id]);

  if (!treatment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-red-600">Behandling ikke funnet</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{content?.meta_title || `${treatment.title} - Skjønnhetsklinikkguiden.no`}</title>
        <meta 
          name="description" 
          content={content?.meta_description || `Les mer om ${treatment.title.toLowerCase()} og finn klinikker som tilbyr denne behandlingen.`}
        />
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
                  <Link to="/behandlinger" className="text-gray-500 hover:text-gray-700">
                    Behandlinger
                  </Link>
                </li>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <li className="text-blue-600 font-medium">
                  {treatment.title}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative bg-cover bg-center py-16" style={{ backgroundImage: `url(${treatment.image})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-[2px]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="text-white lg:col-span-7 lg:pr-16">
                <h1 className="text-4xl font-bold tracking-tight leading-[1.1] mb-4">
                  {treatment.title}
                </h1>
                <p className="text-lg font-light opacity-90 mb-8 leading-relaxed">
                  Finn de beste klinikkene for {treatment.title.toLowerCase()} i Norge. 
                  Sammenlign priser og les vurderinger fra tidligere kunder.
                </p>
              </div>

              <div className="lg:col-span-5">
                <RequestOfferForm defaultTreatment={treatment.title} isTreatmentPage={true} />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section with 70/30 Split */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content Column (70%) */}
            <div className="lg:col-span-8">
              {/* New Treatment Overview Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
                {/* Price and Duration Banner */}
                <div className="bg-gradient-to-r from-purple-900 to-purple-800 p-6">
                  <div className="grid grid-cols-2 gap-6">
                    {treatment.price && (
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-purple-100/80 text-sm">Pris fra</p>
                          <p className="text-white font-semibold">
                            {treatment.price.from.toLocaleString('no-NO')} kr
                          </p>
                        </div>
                      </div>
                    )}
                    {treatment.duration && (
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-purple-100/80 text-sm">Varighet</p>
                          <p className="text-white font-semibold">
                            {treatment.duration.from}-{treatment.duration.to} min
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pros and Cons Grid */}
                <div className="grid md:grid-cols-2 gap-6 p-6">
                  {/* Fordeler */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium text-gray-900">Fordeler</h3>
                    </div>
                    <ul className="space-y-3">
                      {treatment.fordeler.map((fordel, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 h-2 w-2 mt-2 rounded-full bg-green-500 mr-3" />
                          <span className="text-gray-600">{fordel}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ulemper */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium text-gray-900">Viktig å vite</h3>
                    </div>
                    <ul className="space-y-3">
                      {treatment.ulemper.map((ulempe, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 h-2 w-2 mt-2 rounded-full bg-blue-500 mr-3" />
                          <span className="text-gray-600">{ulempe}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Existing Content Section */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : content ? (
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
                    {content.content}
                  </ReactMarkdown>
                </article>
              ) : (
                <p className="text-gray-600 mb-16">Innhold kommer snart...</p>
              )}

              {/* Related Treatments Section */}
              {treatment.category && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Andre {treatment.category.toLowerCase()}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {TREATMENTS
                      .filter(t => 
                        t.category === treatment.category && 
                        t.id !== treatment.id
                      )
                      .map(similarTreatment => (
                        <Link 
                          key={similarTreatment.id}
                          to={`/behandling/${similarTreatment.id}`}
                          className="group"
                        >
                          <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex items-start space-x-4">
                              {similarTreatment.image && (
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                  <img 
                                    src={similarTreatment.image} 
                                    alt={similarTreatment.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {similarTreatment.title}
                                </h4>
                                {similarTreatment.price && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    Fra kr {similarTreatment.price.from.toLocaleString('no-NO')},-
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              )}

              {/* Other Popular Treatments */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Andre populære behandlinger
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {TREATMENTS
                    .filter(t => t.id !== treatment.id)
                    .slice(0, 6) // Show only 6 treatments
                    .map(otherTreatment => (
                      <Link 
                        key={otherTreatment.id}
                        to={`/behandling/${otherTreatment.id}`}
                        className="group"
                      >
                        <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                          <div className="flex items-start space-x-4">
                            {otherTreatment.image && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img 
                                  src={otherTreatment.image} 
                                  alt={otherTreatment.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {otherTreatment.title}
                              </h4>
                              {otherTreatment.price && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Fra kr {otherTreatment.price.from.toLocaleString('no-NO')},-
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </div>

            {/* Sidebar Column (30%) */}
            <aside className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-lg">
                <RequestOfferForm 
                  defaultTreatment={treatment.title}
                  isTreatmentPage={true}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}; 