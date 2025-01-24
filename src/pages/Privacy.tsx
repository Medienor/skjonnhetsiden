import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Personvernerklæring | Skjønnhetsklinikkguiden.no</title>
        <meta 
          name="description" 
          content="Les om hvordan vi behandler dine personopplysninger. Vår personvernerklæring forklarer hvordan vi samler inn, bruker og beskytter din informasjon."
        />
        <meta property="og:title" content="Personvernerklæring - Skjønnhetsklinikkguiden.no" />
        <meta 
          property="og:description" 
          content="Vi tar ditt personvern på alvor. Les om hvordan vi beskytter dine personopplysninger."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-purple-900 mb-8">Personvernerklæring</h1>

          <div className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Innsamling av personopplysninger</h2>
                <p className="text-gray-600 mb-4">
                  Skjønnhetsklinikkguiden.no samler inn og behandler personopplysninger i samsvar med gjeldende personvernlovgivning. Vi tar ditt personvern på alvor og er forpliktet til å beskytte dine personopplysninger.
                </p>
                <p className="text-gray-600">
                  Vi samler inn følgende typer personopplysninger:
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                  <li>Navn og kontaktinformasjon</li>
                  <li>E-postadresse</li>
                  <li>Telefonnummer</li>
                  <li>Ønsket behandling</li>
                  <li>Geografisk område</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Bruk av personopplysninger</h2>
                <p className="text-gray-600 mb-4">
                  Vi bruker dine personopplysninger til følgende formål:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Å koble deg med relevante regnskapsførere</li>
                  <li>Å forbedre våre tjenester</li>
                  <li>Å sende deg relevant informasjon og tilbud</li>
                  <li>Å overholde lovpålagte forpliktelser</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Dine rettigheter</h2>
                <p className="text-gray-600 mb-4">
                  Du har følgende rettigheter knyttet til dine personopplysninger:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Rett til innsyn i egne personopplysninger</li>
                  <li>Rett til å korrigere feilaktige opplysninger</li>
                  <li>Rett til å bli glemt (sletting)</li>
                  <li>Rett til å begrense behandlingen</li>
                  <li>Rett til dataportabilitet</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Informasjonskapsler (cookies)</h2>
                <p className="text-gray-600 mb-4">
                  Vi bruker informasjonskapsler for å forbedre din brukeropplevelse på våre nettsider. 
                  Du kan lese mer om vår bruk av cookies på vår <Link to="/cookies" className="text-purple-600 hover:text-purple-700 underline">cookies-side</Link>.
                  Du kan når som helst endre dine innstillinger for informasjonskapsler i din nettleser.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Kontakt oss</h2>
                <p className="text-gray-600">
                  Har du spørsmål om vår behandling av personopplysninger eller ønsker å utøve dine rettigheter? Kontakt oss på:
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

export default Privacy;