import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet-async";
import { supabase } from '../utils/supabase';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send to webhook with the correct URL
      const webhookUrl = 'https://hook.eu1.make.com/qr6ty7qwlyziu9mrnq982sjcx3odv1s3';
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: "Contact page",
          timestamp: new Date().toISOString(),
        }),
      });

      // Store in Supabase
      await supabase
        .from('contacts')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            source: "Contact page"
          }
        ]);

      toast({
        title: "Melding sendt!",
        description: "Vi vil svare deg så snart som mulig.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Noe gikk galt",
        description: "Vennligst prøv igjen senere.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Kontakt oss | Skjønnhetsklinikkguiden.no</title>
        <meta 
          name="description" 
          content="Ta kontakt med Skjønnhetsklinikkguiden.no. Vi hjelper deg med å finne den rette klinikken for din behandling. Kontakt oss i dag!"
        />
        <meta property="og:title" content="Kontakt Skjønnhetsklinikkguiden.no" />
        <meta 
          property="og:description" 
          content="Har du spørsmål? Ta kontakt med oss i dag for hjelp med å finne den perfekte klinikken for din behandling."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        {/* Hero Section */}
        <div className="bg-purple-900 py-16 mb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Kontakt Oss
            </h1>
            <p className="text-xl text-purple-100">
              Vi er her for å hjelpe deg med å finne den perfekte behandlingen
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Send oss en melding</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Navn
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-post
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Emne
                    </label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Melding
                    </label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-900 hover:bg-purple-800"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sender..." : "Send melding"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">Kontaktinformasjon</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-700 mb-2">E-post</h3>
                    <p className="text-gray-600">omar@netsure.ai</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-700 mb-2">Åpningstider</h3>
                    <p className="text-gray-600">
                      Mandag - Fredag: 09:00 - 16:00<br />
                      Lørdag - Søndag: Stengt
                    </p>
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

export default Contact;