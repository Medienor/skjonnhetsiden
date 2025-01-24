import { Helmet } from "react-helmet-async";
import { RequestOfferForm } from "@/components/RequestOfferForm";

const LeadForm = () => {
  return (
    <>
      <Helmet>
        <title>Få tilbud på behandlinger | Skjønnhetsklinikkguiden.no</title>
        <meta 
          name="description" 
          content="Få uforpliktende pristilbud fra kvalifiserte klinikker i ditt område. Sammenlign priser og behandlinger enkelt."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        {/* Hero Section - Changed to solid dark purple */}
        <div className="bg-purple-900 py-16">  {/* Removed gradient, using solid purple-900 */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Finn den beste klinikken for din behandling
            </h1>
            <p className="text-xl text-purple-100">
              Vi hjelper deg å sammenligne priser og finne kvalifiserte klinikker i ditt område
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">100% Gratis</h3>
                  <p className="text-sm text-gray-600">Ingen forpliktelser</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Rask respons</h3>
                  <p className="text-sm text-gray-600">Svar innen 24 timer</p>
                </div>
              </div>
            </div>

            <RequestOfferForm />
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Vi samarbeider kun med sertifiserte og kvalitetssikrede klinikker
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeadForm;