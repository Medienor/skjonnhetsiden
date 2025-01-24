import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { TREATMENTS } from "@/types/treatments";
import { 
  ChevronRight, 
  Syringe, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TreatmentMeta } from "@/components/TreatmentMeta";

export const BehandlingerPage = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <>
      <Helmet>
        <title>Behandlinger - Skjønnhetsklinikkguiden.no</title>
        <meta 
          name="description" 
          content="Utforsk vårt utvalg av skjønnhetsbehandlinger og finn den perfekte behandlingen for deg."
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
                <li className="text-blue-600 font-medium">
                  Behandlinger
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                Utforsk våre behandlinger
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Vi tilbyr et bredt utvalg av skjønnhetsbehandlinger. Finn den perfekte behandlingen for dine behov.
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TREATMENTS.map((treatment) => (
              <div
                key={treatment.id}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {treatment.image && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={treatment.image}
                      alt={treatment.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Syringe className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-medium text-gray-900">
                        {treatment.title}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleCard(treatment.id);
                      }}
                    >
                      {expandedCard === treatment.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>

                  {treatment.shortDescription && (
                    <p className="text-sm text-gray-600 mb-4">
                      {treatment.shortDescription}
                    </p>
                  )}

                  {treatment.price && treatment.duration && (
                    <TreatmentMeta 
                      price={treatment.price} 
                      duration={treatment.duration}
                      className="mb-4"
                    />
                  )}

                  {expandedCard === treatment.id && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Fordeler
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {treatment.fordeler.map((fordel, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              {fordel}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                          Viktig å vite
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {treatment.ulemper.map((ulempe, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              {ulempe}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <Link
                    to={`/behandling/${treatment.id}`}
                    className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Les mer
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}; 