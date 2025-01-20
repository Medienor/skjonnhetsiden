import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import { 
  CalendarClock, 
  AlertCircle, 
  ArrowLeft, 
  List, 
  Calendar as CalendarIcon,
  FileText,
  DollarSign,
  FileCheck,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/utils/supabase';

interface Deadline {
  date: string;
  title: string;
  description: string;
  icon: JSX.Element;
}

const deadlines: Record<string, Deadline[]> = {
  "Månedlige frister": [
    {
      date: "5. hver måned",
      title: "A-melding",
      description: "Frist for levering av a-melding",
      icon: <FileText className="h-5 w-5 text-blue-600" />
    }
  ],
  "Annenhver måned": [
    {
      date: "10. februar, april, juni, august, oktober, desember",
      title: "MVA-melding",
      description: "Frist for levering av MVA-melding (for de fleste bedrifter)",
      icon: <FileCheck className="h-5 w-5 text-blue-600" />
    }
  ],
  "Kvartalsvise frister": [
    {
      date: "15. mars, juni, september, desember",
      title: "Forskuddsskatt",
      description: "Betaling av forskuddsskatt for enkeltpersonforetak",
      icon: <DollarSign className="h-5 w-5 text-blue-600" />
    }
  ],
  "Årlige frister": [
    {
      date: "15. januar",
      title: "Arbeidsgiveravgift og skattetrekk",
      description: "Betaling av arbeidsgiveravgift og skattetrekk",
      icon: <DollarSign className="h-5 w-5 text-blue-600" />
    },
    {
      date: "31. januar",
      title: "Aksjonærregisteroppgaven",
      description: "Frist for levering av aksjonærregisteroppgaven",
      icon: <FileText className="h-5 w-5 text-blue-600" />
    },
    // Add more annual deadlines...
  ]
};

const deadlinesByMonth: Record<number, Deadline[]> = {
  1: [
    {
      date: "15. januar",
      title: "Arbeidsgiveravgift og skattetrekk",
      description: "Frist for betaling av arbeidsgiveravgift og skattetrekk",
      icon: <DollarSign className="h-5 w-5 text-blue-600" />
    },
    {
      date: "31. januar",
      title: "Aksjonærregisteroppgaven",
      description: "Frist for levering av aksjonærregisteroppgaven",
      icon: <FileText className="h-5 w-5 text-blue-600" />
    }
  ],
  2: [
    {
      date: "3. februar",
      title: "Årlig MVA-søknad",
      description: "Frist for å søke om årlig innlevering av MVA-melding",
      icon: <FileCheck className="h-5 w-5 text-blue-600" />
    },
    {
      date: "10. februar",
      title: "MVA-melding",
      description: "Frist for levering av MVA-melding (termin 6)",
      icon: <FileText className="h-5 w-5 text-blue-600" />
    },
    {
      date: "15. februar",
      title: "Forskuddsskatt AS",
      description: "Betaling av forskuddsskatt for aksjeselskaper (1. termin)",
      icon: <DollarSign className="h-5 w-5 text-blue-600" />
    }
  ],
  3: [
    {
      date: "10. mars",
      title: "Årlig MVA-melding",
      description: "Frist for levering av årlig MVA-melding (hvis godkjent)",
      icon: <FileCheck className="h-5 w-5 text-blue-600" />
    },
    {
      date: "17. mars",
      title: "Arbeidsgiveravgift og skattetrekk",
      description: "Frist for betaling av arbeidsgiveravgift og skattetrekk",
      icon: <DollarSign className="h-5 w-5 text-blue-600" />
    }
  ],
  4: [
    {
      date: "10. april",
      title: "MVA-melding primærnæringer",
      description: "Frist for levering av årlig MVA-melding for primærnæringer",
      icon: <FileText className="h-5 w-5 text-blue-600" />
    },
    {
      date: "15. april",
      title: "Forskuddsskatt AS",
      description: "Betaling av forskuddsskatt for aksjeselskaper (2. termin)",
      icon: <DollarSign className="h-5 w-5 text-blue-600" />
    }
  ],
  5: [
    {
      date: "15. mai",
      title: "Arbeidsgiveravgift og skattetrekk",
      description: "Frist for betaling av arbeidsgiveravgift og skattetrekk",
      icon: <DollarSign className="h-5 w-5 text-blue-600" />
    },
    {
      date: "31. mai",
      title: "Skattemelding og årsregnskap",
      description: "Frist for levering av skattemelding, næringsoppgave og årsregnskap",
      icon: <FileText className="h-5 w-5 text-blue-600" />
    }
  ],
  6: [
    {
      date: "2. juni",
      title: "Tilleggsforskudd",
      description: "Frist for betaling av tilleggsforskudd på skatt",
      icon: <DollarSign className="h-5 w-5 text-blue-600" />
    },
    {
      date: "30. juni",
      title: "Signering årsregnskap",
      description: "Frist for signering og datering av årsregnskap",
      icon: <FileCheck className="h-5 w-5 text-blue-600" />
    }
  ],
  7: [
    {
      date: "15. juli",
      title: "Arbeidsgiveravgift og skattetrekk",
      description: "Frist for betaling av arbeidsgiveravgift og skattetrekk",
      icon: <DollarSign className="h-5 w-5 text-blue-600" />
    },
    {
      date: "31. juli",
      title: "Årsregnskap",
      description: "Frist for levering av årsregnskap",
      icon: <FileText className="h-5 w-5 text-blue-600" />
    }
  ],
  9: [
    {
      date: "1. september",
      title: "MVA-melding termin 3",
      description: "Frist for levering av MVA-melding for 3. termin (mai-juni)",
      icon: <FileCheck className="h-5 w-5 text-blue-600" />
    },
    {
      date: "15. september",
      title: "Arbeidsgiveravgift og skattetrekk",
      description: "Frist for betaling av arbeidsgiveravgift og skattetrekk",
      icon: <DollarSign className="h-5 w-5 text-blue-600" />
    }
  ],
  11: [
    {
      date: "17. november",
      title: "Arbeidsgiveravgift og skattetrekk",
      description: "Frist for betaling av arbeidsgiveravgift og skattetrekk",
      icon: <DollarSign className="h-5 w-5 text-blue-600" />
    }
  ]
};

const monthNames = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember"
];

interface FormData {
  companyName: string;
  email: string;
  phone: string;
  acceptTerms: boolean;
}

const Kalender = () => {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-based
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    email: "",
    phone: "",
    acceptTerms: false
  });

  // Function to check if a deadline is approaching (within 7 days)
  const isDeadlineApproaching = (month: number) => {
    const today = new Date();
    const deadlines = deadlinesByMonth[month] || [];
    
    return deadlines.some(deadline => {
      const [day] = deadline.date.split('.').map(Number);
      const deadlineDate = new Date(today.getFullYear(), month - 1, day);
      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const webhookUrl = 'https://hook.eu1.make.com/qr6ty7qwlyziu9mrnq982sjcx3odv1s3';
      const webhookData = {
        source: 'calendar',
        ...formData,
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

      toast({
        title: "Forespørsel sendt!",
        description: "Vi tar kontakt med deg innen 24 timer.",
      });

      // Reset form
      setFormData({
        companyName: '',
        email: '',
        phone: '',
        acceptTerms: false
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

  const handleMonthClick = (month: number) => {
    setSelectedMonth(month);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Regnskapskalender 2025 - Viktige frister | Regnskapsførerlisten.no</title>
        <meta 
          name="description" 
          content="Oversikt over viktige regnskapsfrister i 2025. Hold orden på MVA, skattemelding, årsregnskap og andre viktige frister for din bedrift."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <div className="relative bg-cover bg-center py-16" style={{ backgroundImage: 'url(/bg.jpg)' }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/">
              <Button variant="outline" className="mb-8 bg-white hover:bg-gray-100">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tilbake til forsiden
              </Button>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column */}
              <div className="text-white lg:col-span-7 lg:pr-16">
                <h1 className="text-4xl font-bold mb-4">
                  Regnskapskalender {new Date().getFullYear()}
                </h1>
                <p className="text-lg opacity-90 mb-4">
                  Hold oversikt over alle viktige frister for din bedrift. 
                  Vår kalender hjelper deg å holde orden på MVA, skattemeldinger, 
                  og andre viktige regnskapsmessige deadlines.
                </p>
              </div>

              {/* Right Column - Form */}
              <div className="lg:col-span-5">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Få påminnelser om viktige frister!
                  </h2>
                  <form className="space-y-4" onSubmit={handleSubmitForm}>
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
                        placeholder="123 45 678"
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
                    >
                      Få påminnelser
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* View Toggle */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-blue-900">
              Viktige frister og datoer
            </h2>
            <div className="flex gap-2">
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                onClick={() => setView('list')}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                Liste
              </Button>
              <Button
                variant={view === 'calendar' ? 'default' : 'outline'}
                onClick={() => setView('calendar')}
                className="flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                Kalender
              </Button>
            </div>
          </div>

          {view === 'calendar' ? (
            <div className="grid grid-cols-3 gap-6">
              {monthNames.map((month, index) => {
                const monthNumber = index + 1;
                const isCurrentMonth = monthNumber === currentMonth;
                const hasApproachingDeadline = isDeadlineApproaching(monthNumber);
                
                return (
                  <Card 
                    key={month} 
                    className={`cursor-pointer hover:shadow-lg transition-shadow relative
                      ${deadlinesByMonth[monthNumber]?.length ? 'border-blue-200' : ''}
                      ${isCurrentMonth ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
                    onClick={() => handleMonthClick(monthNumber)}
                  >
                    {hasApproachingDeadline && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Frist nærmer seg!
                        </span>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <h3 className={`text-xl font-semibold ${isCurrentMonth ? 'text-blue-600' : 'text-blue-900'}`}>
                          {month}
                        </h3>
                        {deadlinesByMonth[monthNumber]?.length > 0 && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            {deadlinesByMonth[monthNumber].length} frister
                          </span>
                        )}
                      </div>
                      {deadlinesByMonth[monthNumber]?.length > 0 && (
                        <div className="mt-4 flex gap-2">
                          {deadlinesByMonth[monthNumber].slice(0, 3).map((deadline, i) => (
                            <span key={i} className="text-blue-600">
                              {deadline.icon}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-8">
              {/* Existing deadline cards */}
              {Object.entries(deadlines).map(([category, items]) => (
                <Card key={category}>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold text-blue-800 mb-6 flex items-center gap-2">
                      <CalendarClock className="w-6 h-6" />
                      {category}
                    </h2>
                    <div className="space-y-6">
                      {items.map((deadline, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <h3 className="font-semibold text-lg text-blue-900 mb-1">
                            {deadline.title}
                          </h3>
                          <p className="text-gray-600 mb-2">{deadline.description}</p>
                          <p className="text-sm text-blue-600 font-medium">
                            Frist: {deadline.date}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Warning note */}
          <div className="mt-8 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Viktig merknad</h3>
                <p className="text-sm text-yellow-700">
                  Datoer kan variere hvis de faller på helger eller helligdager. 
                  Sjekk alltid med Skatteetaten for de mest oppdaterte fristene.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Month Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-900">
              {selectedMonth && monthNames[selectedMonth - 1]} - Viktige frister
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedMonth && deadlinesByMonth[selectedMonth]?.map((deadline, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="mt-1">{deadline.icon}</div>
                <div>
                  <h4 className="font-semibold text-blue-900">{deadline.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{deadline.description}</p>
                  <p className="text-sm font-medium text-blue-600 mt-2">{deadline.date}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Kalender; 