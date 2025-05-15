import { useState, FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Kanskje ikke nødvendig for dette skjemaet, men greit å ha
import { useToast } from "@/components/ui/use-toast"; // For tilbakemelding til brukeren
import { Building, Users, Mail, Phone, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const SamarbeidPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const telegramMessage = `
<b>🤝 Ny Samarbeidshenvendelse!</b>

🏢 Navn (Klinikk/Kontakt): ${formData.name}
📧 E-post: ${formData.email}
📱 Telefon: ${formData.phone}
    `;

    const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatIdForSamarbeid = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (!token || !chatIdForSamarbeid) {
      console.error("Telegram token or chat ID is not configured in .env");
      toast({
        title: "Konfigurasjonsfeil",
        description: "Nødvendig Telegram-konfigurasjon mangler. Kontakt administrator.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatIdForSamarbeid,
          text: telegramMessage,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        let detailedErrorMessage = 'Noe gikk galt under sending av melding til Telegram.';
        try {
          const errorData = await response.json(); // Telegram API usually returns JSON errors
          detailedErrorMessage = errorData.description || `Telegram API feil: ${response.status}`;
        } catch (e) {
          detailedErrorMessage = `Telegram API svarte med status: ${response.status} ${response.statusText}.`;
        }
        throw new Error(detailedErrorMessage);
      }

      // const responseData = await response.json(); // Kan logges hvis du trenger detaljer fra Telegrams suksess-respons
      // console.log("Telegram response:", responseData);

      toast({
        title: "Henvendelse sendt!",
        description: "Takk for din interesse. Vi tar kontakt med deg snart.",
        variant: "default",
      });
      setFormData({ name: '', email: '', phone: '' }); // Tøm skjemaet
    } catch (error) {
      console.error("Feil ved sending av Telegram-melding:", error);
      toast({
        title: "Feil",
        description: `${error instanceof Error ? error.message : 'Kunne ikke sende henvendelsen. Prøv igjen senere.'}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Samarbeid med Oss - Få Flere Kunder | Din Plattform</title>
        <meta
          name="description"
          content="Bli partner med oss og øk synligheten for din klinikk. Nå ut til tusenvis av potensielle kunder som søker etter dine behandlinger."
        />
      </Helmet>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 py-20 sm:py-28 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
          >
            Øk din kundebase – Bli partner med oss!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-purple-100/90 max-w-2xl mx-auto mb-10"
          >
            Nå ut til tusenvis av potensielle kunder som aktivt søker etter dine skjønnhetsbehandlinger. Vi hjelper deg å vokse.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button 
              size="lg" 
              onClick={() => document.getElementById('samarbeid-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-purple-700 hover:bg-purple-50 text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all"
            >
              Meld din interesse nå
              <Send className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Hvorfor samarbeide med oss?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Vi tilbyr en plattform som kobler din klinikk direkte med kunder som leter etter dine tjenester.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Users className="w-10 h-10 text-purple-600 mb-4" />, title: "Økt Synlighet", description: "Din klinikk blir profilert på en ledende plattform, synlig for et stort og relevant publikum." },
              { icon: <Building className="w-10 h-10 text-purple-600 mb-4" />, title: "Kvalifiserte Leads", description: "Motta henvendelser fra kunder som er genuint interessert i de behandlingene du tilbyr." },
              { icon: <Send className="w-10 h-10 text-purple-600 mb-4" />, title: "Enkel Markedsføring", description: "Vi tar oss av markedsføringen slik at du kan fokusere på det du gjør best – å levere fantastiske behandlinger." },
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                {item.icon}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* How it Works Section */}
      <div className="py-16 sm:py-24 bg-purple-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Slik kommer du i gang
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { step: "1", title: "Meld interesse", description: "Fyll ut det enkle skjemaet under med din kontaktinformasjon." },
              { step: "2", title: "Vi tar kontakt", description: "En av våre partnereådgivere vil kontakte deg for en uforpliktende prat." },
              { step: "3", title: "Bli synlig", description: "Etter godkjenning blir din klinikk synlig for tusenvis av nye kunder." },
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="p-6"
              >
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div id="samarbeid-form" className="py-16 sm:py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Klar for å vokse med oss?
            </h2>
            <p className="text-lg text-gray-600">
              Fyll ut skjemaet nedenfor, så tar vi kontakt for en uforpliktende samtale om hvordan vi kan hjelpe din klinikk.
            </p>
          </div>
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6 bg-gray-50 p-8 rounded-xl shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Klinikknavn / Ditt navn
              </label>
              <Input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-white border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                placeholder="F.eks. Skjønnhetssalongen AS eller Ola Nordmann"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-postadresse
              </label>
              <Input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-white border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                placeholder="din.epost@example.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefonnummer
              </label>
              <Input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="bg-white border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                placeholder="E.g., 12345678"
              />
            </div>
            <div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-3"
              >
                {isSubmitting ? 'Sender...' : 'Send henvendelse'}
                {!isSubmitting && <Send className="w-5 h-5 ml-2" />}
              </Button>
            </div>
          </motion.form>
        </div>
      </div>
    </>
  );
};

export default SamarbeidPage; 