import { Link } from "react-router-dom";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

const benefits = [
  {
    title: "Øk synligheten din på nett",
    description: "Få bedre synlighet i søkeresultater og nå ut til flere potensielle kunder."
  },
  {
    title: "Få nye kunder direkte til din bedrift",
    description: "Motta kvalifiserte leads fra bedrifter som aktivt søker regnskapstjenester."
  },
  {
    title: "Bygg tillit gjennom kundevurderinger",
    description: "La fornøyde kunder dele sine erfaringer og styrk din troverdighet."
  },
  {
    title: "Vis frem deres ekspertise",
    description: "Fremhev deres spesialkompetanse og bransjeerfaring."
  },
  {
    title: "Konkurransefortrinn i ditt område",
    description: "Stå ut i mengden og bli mer synlig i ditt lokale marked."
  }
];

const SamarbeidPage = () => {
  return (
    <>
      <Helmet>
        <title>Samarbeid med oss | Regnskapsførerlisten.no</title>
        <meta 
          name="description" 
          content="Bli med på Regnskapsførerlisten.no og nå ut til flere potensielle kunder. Vi hjelper regnskapsførere med å vokse." 
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Voks med Regnskapsførerlisten.no
            </h1>
            <p className="text-xl text-gray-600">
              Nå ut til bedrifter som aktivt leter etter regnskapstjenester
            </p>
          </div>

          {/* Benefits Section - Updated styling */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-blue-900 text-center mb-12">
              Hvorfor velge oss?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-start gap-2 bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold text-blue-900">{benefit.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Cards Container */}
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Pricing Cards Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-2xl font-semibold text-blue-900 mb-4">Basis</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">Gratis</span>
                  <span className="text-gray-500 ml-2">/ mnd</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Grunnleggende firmaprofil</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Vær synlig i søkeresultater</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Kundevurderinger</span>
                  </li>
                </ul>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link to="/kontakt">Kom i gang</Link>
                </Button>
              </div>

              {/* Premium Plan */}
              <div className="bg-gradient-to-br from-white to-amber-50 rounded-lg shadow-xl border-2 border-amber-200 p-8">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-2xl font-semibold text-blue-900">Premium</h3>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                    Anbefalt
                  </span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">499 kr</span>
                  <span className="text-gray-500 ml-2">/ mnd</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-amber-500 fill-current" />
                    <span>Alt i Basis-pakken</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-amber-500 fill-current" />
                    <span>Fremhevet plassering i søk</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-amber-500 fill-current" />
                    <span>Premium-merking av profil</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-amber-500 fill-current" />
                    <span>Detaljert statistikk og innsikt</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-amber-500 fill-current" />
                    <span>Prioritert kundeservice</span>
                  </li>
                </ul>
                <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                  <Link to="/kontakt">Bli Premium-partner</Link>
                </Button>
              </div>
            </div>

            {/* Disclaimer Text */}
            <p className="text-sm text-gray-500 text-center italic mt-4">
              Leads er ikke inkludert i noen avtaler, dette selges separat - {" "}
              <Link to="/kontakt" className="text-blue-600 hover:text-blue-700 hover:underline">
                Kontakt oss
              </Link>
              {" "}for mer informasjon
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">
              Kom i gang i dag
            </h2>
            <p className="text-gray-600 mb-8">
              Join over 500 regnskapsførere som allerede bruker Regnskapsførerlisten.no 
              for å vokse sin virksomhet. Vi hjelper deg med å nå ut til bedrifter 
              som aktivt søker etter regnskapstjenester.
            </p>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/kontakt">Kontakt oss for mer informasjon</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SamarbeidPage; 