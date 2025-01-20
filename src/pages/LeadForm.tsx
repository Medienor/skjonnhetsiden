import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { findMunicipalityByPostalCode } from '@/utils/postalCodeUtils';
import confetti from 'canvas-confetti';

const LeadForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [municipality, setMunicipality] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    postnumber: '',
    email: '',
    phone: '',
    acceptTerms: true
  });

  const fireConfetti = () => {
    // Fire confetti from the left
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.6 }
    });

    // Fire confetti from the right
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.9, y: 0.6 }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const webhookUrl = 'https://hook.eu1.make.com/qr6ty7qwlyziu9mrnq982sjcx3odv1s3';
      const webhookData = {
        ...formData,
        source: "Lead page",
        date: new Date().toISOString()
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) throw new Error('Failed to submit form');

      // Fire confetti on success
      fireConfetti();

      toast({
        title: "Forespørsel sendt!",
        description: "Vi tar kontakt med deg innen 24 timer.",
      });

      // Reset form
      setFormData({
        companyName: '',
        postnumber: '',
        email: '',
        phone: '',
        acceptTerms: true
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke sende forespørsel. Prøv igjen senere.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedriftsnavn
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ditt firma AS"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postnummer
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.postnumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setFormData(prev => ({ ...prev, postnumber: value }));
                      if (value.length === 4) {
                        const found = findMunicipalityByPostalCode(value);
                        setMunicipality(found);
                      } else {
                        setMunicipality(null);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    required
                  />
                  {municipality && (
                    <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                      <div className="flex items-center gap-1 text-emerald-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">{municipality}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-post
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="din@epost.no"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Din telefon"
                  required
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                  className="mt-1"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  Jeg godtar vilkårene til tjenesten
                </label>
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                type="submit" 
                disabled={isSubmitting || !formData.acceptTerms}
              >
                {isSubmitting ? "Sender..." : "Få tilbud"}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Tjenesten er gratis og helt uforpliktende!
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeadForm;