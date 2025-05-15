import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Building2, ChevronRight, List, ChevronDown } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Guide {
  id: string;
  title: string;
  content: string;
  slug: string;
  created_at: string;
  description: string;
  image_url: string | null;
}

interface RelatedGuide {
  id: string;
  title: string;
  slug: string;
  description: string;
}

interface Heading {
  title: string;
  id: string;
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

const getOptimizedImageUrl = (url: string | null, size: 'tiny' | 'full' = 'full'): string | undefined => {
  if (!url) return undefined;
  
  if (url.includes('storage.googleapis.com')) {
    if (size === 'tiny') {
      return `${url}?width=20&height=12&resize=cover&format=webp&quality=10`;
    }
    return `${url}?width=400&height=225&resize=cover&format=webp&quality=75`;
  }
  return url;
};

const extractHeadings = (content: string) => {
  const headings: { title: string; id: string }[] = [];
  const lines = content.split('\n');
  
  lines.forEach(line => {
    // Match h2 and h3 headings from markdown
    const match = line.match(/^##?\s+(.+)$/);
    if (match) {
      const title = match[1];
      // Create URL-friendly id
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      headings.push({ title, id });
    }
  });
  
  return headings;
};

const TableOfContents = ({ headings }: { headings: Heading[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xl font-semibold text-purple-900 hover:text-purple-700"
      >
        <div className="flex items-center">
          <List className="w-5 h-5 mr-2" />
          Innholdsfortegnelse
        </div>
        <ChevronDown 
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>
      
      {isOpen && (
        <nav className="mt-4 space-y-2 border-t pt-4">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className="block py-1 px-2 text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: 'smooth'
                });
              }}
            >
              {heading.title}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
};

const PrisguidePage = () => {
  const { slug } = useParams();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [relatedGuides, setRelatedGuides] = useState<RelatedGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const [guideResult, relatedResult] = await Promise.all([
          supabase
            .from('skjonnhet_prisguider')
            .select('*')
            .eq('slug', slug)
            .single(),
          supabase
            .from('skjonnhet_prisguider')
            .select('id, title, slug, description')
            .neq('slug', slug)
            .limit(3)
            .order('created_at', { ascending: false })
        ]);

        if (guideResult.error) throw guideResult.error;

        // Extract headings from the raw markdown content
        const rawContent = guideResult.data.content || '';
        const headings: Heading[] = rawContent
          .split('\n')
          .filter((line: string) => line.startsWith('##'))
          .map((line: string) => {
            const title = line.replace(/^##\s+/, '');
            const id = title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
            return { title, id };
          });

        console.log('Found headings:', headings);
        
        // Add IDs to the content
        let content = rawContent;
        headings.forEach(({ title, id }: Heading) => {
          content = content.replace(
            `## ${title}`,
            `<h2 id="${id}">${title}</h2>`
          );
        });
        
        const htmlContent = await marked(content);
        
        setGuide({
          ...guideResult.data,
          content: htmlContent
        });
        
        setHeadings(headings);
        setRelatedGuides(relatedResult.data || []);
      } catch (error) {
        console.error('Error fetching guide:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [slug]);

  useEffect(() => {
    // Apply lazy loading to all images in the article content
    const articleImages = document.querySelectorAll('.prose img');
    articleImages.forEach(img => {
      if (img instanceof HTMLImageElement) {
        img.loading = 'lazy';
        img.decoding = 'async';
      }
    });
  }, [guide]); // Run when guide content changes

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
      Laster inn...
    </div>;
  }

  if (!guide) {
    return <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-gray-500">
          <h1 className="text-2xl font-semibold mb-2">Prisguide ikke funnet</h1>
          <p>Beklager, men denne prisguiden eksisterer ikke eller har blitt flyttet.</p>
        </div>
      </div>
    </div>;
  }

  return (
    <>
      <Helmet>
        <title>{guide.title}</title>
        <meta name="description" content={guide.description} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        {/* Hero Section */}
        <div className="relative bg-cover bg-center py-16" 
             style={{ backgroundImage: guide.image_url ? `url(${getOptimizedImageUrl(guide.image_url)})` : 'url(/bg.jpg)' }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumbs */}
            <nav className="hidden md:flex items-center space-x-2 text-sm mb-6">
              <Link to="/" className="text-white hover:text-purple-200 transition-colors">
                Hjem
              </Link>
              <ChevronRight className="w-4 h-4 text-white/60" />
              <Link to="/prisguider" className="text-white hover:text-purple-200 transition-colors">
                Prisguider
              </Link>
              <ChevronRight className="w-4 h-4 text-white/60" />
              <span className="text-white/80">{guide.title}</span>
            </nav>

            <div className="text-white max-w-3xl">
              <h1 className="text-4xl font-bold mb-4">{guide.title}</h1>
              <p className="text-lg opacity-90">{guide.description}</p>
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

                  /* Ordered Lists Styling */
                  .prose ol {
                    margin-top: 1.25rem;
                    margin-bottom: 1.25rem;
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                  }

                  .prose ol li {
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                    padding-left: 0.5rem;
                    color: #374151;
                  }

                  .prose ol li::marker {
                    color: #2563eb;
                    font-weight: 600;
                  }

                  /* Nested ordered lists */
                  .prose ol ol {
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                    list-style-type: lower-alpha;
                  }

                  .prose ol ol li::marker {
                    color: #6b7280;
                  }

                  /* Third level */
                  .prose ol ol ol {
                    list-style-type: lower-roman;
                  }

                  /* Spacing between list items with mixed content */
                  .prose li > :first-child {
                    margin-top: 0;
                  }

                  .prose li > :last-child {
                    margin-bottom: 0;
                  }

                  /* Spacing when lists are next to each other */
                  .prose ol + ul,
                  .prose ul + ol {
                    margin-top: 1.5rem;
                  }
                `}</style>
                <div dangerouslySetInnerHTML={{ __html: guide.content }} />
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:w-[30%]">
              <div className="space-y-6">
                {/* Table of Contents */}
                <TableOfContents headings={headings} />

                {/* Related Guides */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-purple-900 mb-4">
                    Relaterte prisguider
                  </h2>
                  <div className="space-y-3">
                    {relatedGuides.map((relatedGuide) => (
                      <Link
                        key={relatedGuide.id}
                        to={`/prisguider/${relatedGuide.slug}`}
                        className="block hover:bg-purple-50 p-4 rounded-lg transition-all duration-200 group"
                      >
                        <h3 className="text-purple-900 font-medium group-hover:text-purple-700 transition-colors mb-1">
                          {relatedGuide.title}
                        </h3>
                        {relatedGuide.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {relatedGuide.description}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Cities Section */}
          <div className="mt-16 border-t pt-16">
            <h2 className="text-3xl font-bold text-purple-900 mb-8">
              Finn en skjønnhetsklinikk i din by
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {MAJOR_CITIES.map((city) => (
                <Link
                  key={city}
                  to={`/${city.toLowerCase()}`}
                  className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group"
                >
                  <Building2 className="w-5 h-5 text-purple-500 mr-2 group-hover:text-purple-700" />
                  <span className="text-gray-700 group-hover:text-purple-700">
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

export default PrisguidePage; 