import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, Search } from "lucide-react";
import { findMunicipalityByPostalCode, denormalizeMunicipalityName } from "@/utils/municipalityData";
import confetti from 'canvas-confetti';

const TREATMENTS = [
  "Botox",
  "HIFU",
  "Leppefiller", 
  "Fjerning av fillers",
  "Muskelavslappende behandling",
  "Hudforbedrende laserbehandlinger",
  "EM-Muskelbygging",
  "Profhilo og Biosculpture",
  "Ansiktsskulpturering",
  "Tear Trough",
  "Fettfjerning",
  "Nesekorreksjón",
  "HydraFacial",
  "PRP-behandling",
  "Biostimulatorer",
  "Medisinsk hudpleie",
  "Dermapen",
  "VanityShape Cellulittreduksjon",
  "Tatoveringsfjerning",
  "Pluryal ELIXIR og Mesoterapi",
  "Hårfjerning med laser",
  "Visia hudskanner",
  "IPL-behandling",
  "Tannbleking",
  "Green Peel",
  "Akne og aknearr"
].sort();

interface FormData {
  treatment: string;
  contactName: string;
  email: string;
  phone: string;
  postalCode: string;
  municipality: string | null;
  message: string;
  acceptTerms: boolean;
}

interface RequestOfferFormProps {
  defaultTreatment?: string;
  hideHeader?: boolean;
  isTreatmentPage?: boolean;
}

export const RequestOfferForm = ({ 
  defaultTreatment, 
  hideHeader = false,
  isTreatmentPage = false 
}: RequestOfferFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    treatment: defaultTreatment || "",
    contactName: "",
    email: "",
    phone: "",
    postalCode: "",
    municipality: null,
    message: "",
    acceptTerms: false
  });
  
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const filteredTreatments = TREATMENTS.filter(treatment =>
    treatment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && formData.treatment && searchTerm === formData.treatment) {
      e.preventDefault();
      setFormData(prev => ({ ...prev, treatment: '' }));
      setSearchTerm('');
    }
  };

  const getInputClasses = (field: keyof FormData) => {
    return "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500";
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
    
    const telegramMessage = `
<b>🎉 Ny behandlingsforespørsel!</b>

📋 Behandling: ${formData.treatment}
👤 Navn: ${formData.contactName}
📧 E-post: ${formData.email}
📱 Telefon: ${formData.phone}
📍 Postnummer: ${formData.postalCode}
🏙 Kommune: ${formData.municipality || 'Ikke spesifisert'}

${formData.message ? `💬 Melding: ${formData.message}` : ''}
`;

    try {
      // Send directly to Telegram API
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Continue with existing success logic
      console.log("Form submitted:", formData);
      setIsSubmitted(true);
      triggerConfetti();
    } catch (error) {
      console.error('Error submitting form:', error);
      // You might want to show an error message to the user here
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-gradient-to-b from-white via-white to-blue-50 p-8 rounded-3xl shadow-lg">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Forespørsel sendt!
            </h2>
            <p className="text-gray-600">
              Takk for din henvendelse. Vi vil kontakte deg så snart som mulig.
            </p>
            <div className="pt-4">
              <Button
                onClick={() => window.location.reload()}
                className="bg-purple-950 hover:bg-purple-900 transition-colors text-white font-medium px-6 py-2"
              >
                Send ny forespørsel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-b from-white via-white to-blue-50 p-8 rounded-3xl shadow-lg">
        {!hideHeader && (
          <div className="mb-8 text-center">
            {isTreatmentPage ? (
              <>
                <h2 className="text-xl font-semibold text-blue-900 mb-4">
                  Ønsker du denne behandlingen?
                </h2>
                <p className="text-gray-600 mb-6">
                  Fyll ut skjemaet under, så hjelper vi deg med å finne den beste klinikken for dine behov.
                </p>
              </>
            ) : (
              <>
                <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-6">
                  Gratis og uforpliktende
                </span>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Få tilbud fra skjønnhetsklinikker
                </h2>
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <div className="relative" ref={selectRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Velg behandling
              </label>
              <div className="relative">
                <input
                  type="text"
                  className={getInputClasses('treatment')}
                  value={formData.treatment || searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (formData.treatment) {
                      setFormData(prev => ({ ...prev, treatment: '' }));
                    }
                    setIsSelectOpen(true);
                  }}
                  onKeyDown={handleKeyDown}
                  onClick={() => setIsSelectOpen(true)}
                  placeholder="Søk etter behandling..."
                  required
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              
              {isSelectOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredTreatments.map((treatment) => (
                    <div
                      key={treatment}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, treatment }));
                        setSearchTerm(treatment);
                        setIsSelectOpen(false);
                      }}
                    >
                      {treatment}
                    </div>
                  ))}
                  {filteredTreatments.length === 0 && (
                    <div className="px-4 py-2 text-gray-500">
                      Ingen behandlinger funnet
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-post
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={getInputClasses('email')}
                  placeholder="Din e-post"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefonnummer
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, phone: value }));
                  }}
                  className={getInputClasses('phone')}
                  placeholder="Ditt telefonnummer"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Navn
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  className={getInputClasses('contactName')}
                  placeholder="Ditt navn"
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
                    value={formData.postalCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setFormData(prev => ({ ...prev, postalCode: value }));
                      if (value.length === 4) {
                        const municipality = findMunicipalityByPostalCode(value);
                        setFormData(prev => ({ 
                          ...prev, 
                          municipality: municipality ? municipality.name : null 
                        }));
                      } else {
                        setFormData(prev => ({ ...prev, municipality: null }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formData.postalCode.length === 4
                        ? formData.municipality
                          ? 'border-green-500 focus:ring-green-500 pr-32'
                          : 'border-red-300 focus:ring-red-500 pr-24'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Ditt postnummer"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    required
                  />
                  {formData.postalCode.length === 4 && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {formData.municipality ? (
                        <>
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600">
                            {denormalizeMunicipalityName(formData.municipality)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-red-600">Ikke gyldig</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Melding (valgfritt)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className={getInputClasses('message')}
                placeholder="Fortell oss hva du er interessert i"
                rows={4}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  required
                />
                <label 
                  htmlFor="acceptTerms" 
                  className="text-sm text-gray-700"
                >
                  Jeg godtar vilkårene til Skjønnhetsklinikker.no
                </label>
              </div>
            </div>
          </div>

          <Button 
            className="w-full bg-purple-950 hover:bg-purple-900 transition-colors text-white font-medium text-lg h-[55px]" 
            type="submit"
          >
            Send forespørsel
          </Button>

          <p className="text-center text-sm text-gray-500">
            Tjenesten er gratis og helt uforpliktende!
          </p>
        </form>
      </div>
    </div>
  );
}; 