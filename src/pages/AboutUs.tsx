import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";

const AboutUs = () => {
  return (
    <>
      <Helmet>
        <title>Om oss | Regnskapsførerlisten.no</title>
        <meta 
          name="description" 
          content="Les om hvordan Regnskapsførerlisten.no hjelper norske bedrifter med å finne den perfekte regnskapsføreren. Vår misjon, verdier og historie."
        />
        <meta property="og:title" content="Om Regnskapsførerlisten.no - Din guide til regnskapsførere" />
        <meta 
          property="og:description" 
          content="Vi forenkler prosessen med å finne kvalifiserte regnskapsførere for norske bedrifter."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-blue-900 mb-8">Om Regnskapsførerlisten.no</h1>
        
        <div className="grid gap-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-blue-800 mb-4">Vår Historie</h2>
              <p className="text-gray-600 mb-4">
                Regnskapsførerlisten.no ble etablert med en klar visjon: å forenkle prosessen med å finne den perfekte regnskapsføreren for norske bedrifter. Vi forstår at valg av regnskapsfører er en viktig beslutning som kan ha stor innvirkning på din bedrifts suksess.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-blue-800 mb-4">Vår Misjon</h2>
              <p className="text-gray-600 mb-4">
                Vår misjon er å skape en transparent og effektiv plattform som kobler bedrifter med kvalifiserte regnskapsførere. Vi jobber kontinuerlig for å:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Forenkle søkeprosessen etter regnskapsfører</li>
                <li>Sikre høy kvalitet på tjenestene som tilbys</li>
                <li>Tilby relevant informasjon og ressurser</li>
                <li>Spare tid og ressurser for både bedrifter og regnskapsførere</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-blue-800 mb-4">Våre Verdier</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-blue-700 mb-2">Kvalitet</h3>
                  <p className="text-gray-600">Vi setter høye standarder for regnskapsførerne på vår plattform.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-blue-700 mb-2">Tillit</h3>
                  <p className="text-gray-600">Vi bygger sterke relasjoner basert på ærlighet og transparens.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-blue-700 mb-2">Innovasjon</h3>
                  <p className="text-gray-600">Vi utvikler kontinuerlig nye løsninger for å møte kundenes behov.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AboutUs;