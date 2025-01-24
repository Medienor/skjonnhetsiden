import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";

const Cookies = () => {
  return (
    <>
      <Helmet>
        <title>Informasjonskapsler (cookies) | Skjønnhetsklinikkguiden.no</title>
        <meta 
          name="description" 
          content="Les om hvordan vi bruker informasjonskapsler (cookies) på Skjønnhetsklinikkguiden.no for å forbedre din brukeropplevelse."
        />
        <meta property="og:title" content="Informasjonskapsler - Skjønnhetsklinikkguiden.no" />
        <meta 
          property="og:description" 
          content="Lær mer om hvordan vi bruker cookies for å gi deg en bedre opplevelse på våre nettsider."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        {/* Hero Section */}
        <div className="bg-purple-900 py-16 mb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Informasjonskapsler (cookies)
            </h1>
            <p className="text-xl text-purple-100">
              Slik bruker vi cookies for å forbedre din opplevelse
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Hva er informasjonskapsler?</h2>
                <p className="text-gray-600 mb-4">
                  Informasjonskapsler (cookies) er små tekstfiler som lagres på din enhet når du besøker våre nettsider. 
                  Disse filene hjelper oss å huske dine preferanser og forbedre din brukeropplevelse.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Hvorfor bruker vi cookies?</h2>
                <p className="text-gray-600 mb-4">Vi bruker informasjonskapsler for å:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Forbedre nettsidens funksjonalitet og ytelse</li>
                  <li>Analysere hvordan nettsiden brukes</li>
                  <li>Huske dine preferanser og innstillinger</li>
                  <li>Tilby relevant innhold basert på dine interesser</li>
                  <li>Sikre en trygg og sikker brukeropplevelse</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Typer cookies vi bruker</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-purple-700 mb-2">Nødvendige cookies</h3>
                    <p className="text-gray-600">
                      Disse er essensielle for at nettsiden skal fungere korrekt og kan ikke deaktiveres.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-purple-700 mb-2">Analytiske cookies</h3>
                    <p className="text-gray-600">
                      Hjelper oss å forstå hvordan besøkende bruker nettsiden, slik at vi kan forbedre brukeropplevelsen.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-purple-700 mb-2">Funksjonelle cookies</h3>
                    <p className="text-gray-600">
                      Husker dine valg og preferanser for å gi deg en mer personlig opplevelse.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Administrere cookies</h2>
                <p className="text-gray-600 mb-4">
                  Du kan når som helst endre dine innstillinger for informasjonskapsler ved å justere innstillingene i din nettleser. 
                  Vær oppmerksom på at deaktivering av enkelte cookies kan påvirke nettsidens funksjonalitet.
                </p>
                <p className="text-gray-600">
                  For mer informasjon om hvordan du administrerer cookies, besøk din nettlesers hjelpesider:
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                  <li>Google Chrome</li>
                  <li>Mozilla Firefox</li>
                  <li>Safari</li>
                  <li>Microsoft Edge</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Kontakt oss</h2>
                <p className="text-gray-600">
                  Har du spørsmål om vår bruk av cookies? Kontakt oss på:
                </p>
                <div className="mt-4 text-gray-600">
                  <p>E-post: omar@netsure.ai</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cookies; 