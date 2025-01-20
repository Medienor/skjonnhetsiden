import { Helmet } from "react-helmet-async";
import { RequestOfferForm } from "@/components/RequestOfferForm";

const LeadForm = () => {
  return (
    <>
      <Helmet>
        <title>Få tilbud fra regnskapsførere | Regnskapsførerlisten.no</title>
        <meta 
          name="description" 
          content="Få uforpliktende tilbud fra kvalifiserte regnskapsførere i ditt område. Sammenlign priser og tjenester enkelt."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Få tilbud fra regnskapsførere
            </h1>
            <p className="text-xl text-gray-600">
              Vi hjelper deg å finne den beste regnskapsføreren for din bedrift
            </p>
          </div>

          <RequestOfferForm />
        </div>
      </div>
    </>
  );
};

export default LeadForm;