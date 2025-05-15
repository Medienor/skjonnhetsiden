import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";

const AboutUs = () => {
  return (
    <>
      <Helmet>
        <title>Om oss | Skjønnhetsklinikker.no</title>
        <meta 
          name="description" 
          content="Les om hvordan Skjønnhetsklinikker.no hjelper deg med å finne den perfekte klinikken for dine behandlinger. Vår misjon, verdier og historie."
        />
        <meta property="og:title" content="Om Skjønnhetsklinikker.no - Din guide til skjønnhetsbehandlinger" />
        <meta 
          property="og:description" 
          content="Vi forenkler prosessen med å finne kvalifiserte klinikker for dine skjønnhetsbehandlinger."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        {/* Hero Section */}
        <div className="bg-purple-900 py-16 mb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Om Skjønnhetsklinikker.no
            </h1>
            <p className="text-xl text-purple-100">
              Din guide til profesjonelle skjønnhetsbehandlinger
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid gap-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Vår Historie</h2>
                <p className="text-gray-600 mb-4">
                  Skjønnhetsklinikker.no ble etablert med en klar visjon: å forenkle prosessen med å finne den perfekte klinikken for dine skjønnhetsbehandlinger. Vi forstår at valg av klinikk er en viktig og personlig beslutning som krever grundig research og sammenligning.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Vår Misjon</h2>
                <p className="text-gray-600 mb-4">
                  Vår misjon er å skape en transparent og brukervennlig plattform som kobler kunder med kvalifiserte klinikker. Vi jobber kontinuerlig for å:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Forenkle prosessen med å finne riktig behandling</li>
                  <li>Sikre høy kvalitet på alle anbefalte klinikker</li>
                  <li>Tilby omfattende informasjon om behandlinger</li>
                  <li>Gjøre det enkelt å sammenligne priser og tjenester</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Våre Verdier</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-purple-700 mb-2">Kvalitet</h3>
                    <p className="text-gray-600">Vi samarbeider kun med sertifiserte og erfarne klinikker.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-purple-700 mb-2">Trygghet</h3>
                    <p className="text-gray-600">Din sikkerhet og tilfredshet er vår høyeste prioritet.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-purple-700 mb-2">Transparens</h3>
                    <p className="text-gray-600">Vi gir deg all informasjon du trenger for å ta et informert valg.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;