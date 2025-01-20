import { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { findMunicipalityByPostalCode } from '@/utils/municipalityData';
import confetti from 'canvas-confetti';

interface FormData {
  hasCompany: boolean | null;
  companyName: string;
  companyType: string;
  employeeCount: string;
  monthlyReceipts: string;
  hasVatLiability: boolean | null;
  isVatRegistered: boolean;
  isAuditRequired: boolean;
  hasAccountant: boolean;
  hasAccountingSystem: boolean;
  accountingSystem: string;
  contactName: string;
  postalCode: string;
  municipality: string | null;
  email: string;
  phone: string;
  acceptTerms: boolean;
  willHireEmployees: boolean | null;
  knowsExpectedVolume: boolean | null;
  willSellWithVat: boolean | null;
}

type Step = {
  title: string;
  isCompleted: boolean;
};

export const RequestOfferForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    hasCompany: null,
    companyName: '',
    companyType: '',
    employeeCount: '',
    monthlyReceipts: '',
    hasVatLiability: null,
    isVatRegistered: false,
    isAuditRequired: false,
    hasAccountant: false,
    hasAccountingSystem: false,
    accountingSystem: '',
    contactName: '',
    postalCode: '',
    municipality: null,
    email: '',
    phone: '',
    acceptTerms: false,
    willHireEmployees: null,
    knowsExpectedVolume: null,
    willSellWithVat: null,
  });
  const [municipality, setMunicipality] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const steps: Step[] = useMemo(() => {
    if (formData.hasCompany === false) {
      return [
        { title: 'Selskap', isCompleted: formData.hasCompany !== null },
        { title: 'Planer', isCompleted: formData.willHireEmployees !== null && formData.knowsExpectedVolume !== null && formData.willSellWithVat !== null },
        { title: 'Kontakt', isCompleted: formData.contactName !== '' && formData.email !== '' && formData.phone !== '' }
      ];
    }
    return [
      { title: 'Selskap', isCompleted: formData.hasCompany !== null },
      { title: 'Informasjon', isCompleted: formData.companyName !== '' && formData.companyType !== '' },
      { title: 'Detaljer', isCompleted: !formData.hasAccountingSystem || (formData.hasAccountingSystem && formData.accountingSystem !== '') },
      { title: 'Kontakt', isCompleted: formData.contactName !== '' && formData.email !== '' && formData.phone !== '' }
    ];
  }, [
    formData.hasCompany,
    formData.willHireEmployees,
    formData.knowsExpectedVolume,
    formData.willSellWithVat,
    formData.companyName,
    formData.companyType,
    formData.hasAccountingSystem,
    formData.accountingSystem,
    formData.contactName,
    formData.email,
    formData.phone
  ]);

  const renderStepIndicators = () => (
    <div className="flex justify-center gap-2 mt-4">
      {steps.map((step, index) => {
        let backgroundColor;
        if (index === currentStep) {
          backgroundColor = 'bg-blue-600';
        } else if (index < currentStep) {
          backgroundColor = 'bg-green-500';  // Only past steps can be green
        } else {
          backgroundColor = 'bg-gray-300';   // Future steps are gray
        }

        return (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${backgroundColor}`}
          />
        );
      })}
    </div>
  );

  // Helper function to determine if a field is valid
  const isFieldValid = (fieldName: keyof FormData, value: FormData[keyof FormData]): boolean => {
    switch (fieldName) {
      case 'companyName':
        return typeof value === 'string' && value.length > 0;
      case 'companyType':
        return typeof value === 'string' && value.length > 0;
      case 'employeeCount':
        return typeof value === 'string' && value.length > 0;
      case 'contactName':
        return typeof value === 'string' && value.length > 0;
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'phone':
        return typeof value === 'string' && value.length >= 8;
      case 'postalCode':
        return typeof value === 'string' && value.length === 4 && formData.municipality !== null;
      default:
        return false;
    }
  };

  // Update input field classes based on validation
  const getInputClasses = (fieldName: keyof FormData) => {
    const baseClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2";
    
    if (!formData[fieldName]) return `${baseClasses} border-gray-300 focus:ring-blue-500`;
    
    return isFieldValid(fieldName, formData[fieldName])
      ? `${baseClasses} border-green-500 focus:ring-green-500`
      : `${baseClasses} border-gray-300 focus:ring-blue-500`;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">
        Er firmaet ditt allerede opprettet?
      </h3>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, hasCompany: true }))}
          className={`w-full p-4 text-left border rounded-lg ${
            formData.hasCompany === true 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-300'
          }`}
        >
          Ja
        </button>
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, hasCompany: false }))}
          className={`w-full p-4 text-left border rounded-lg ${
            formData.hasCompany === false 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-300'
          }`}
        >
          Nei
        </button>
      </div>
    </div>
  );

  const renderPlanningStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Firmaplaner
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Regnskapsførerne trenger litt informasjon om planene for firmaet ditt.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Regner du med å ansette noen?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, willHireEmployees: true }))}
              className={`px-4 py-2 border rounded-lg ${
                formData.willHireEmployees === true
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              Ja
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, willHireEmployees: false }))}
              className={`px-4 py-2 border rounded-lg ${
                formData.willHireEmployees === false
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              Nei
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Kjenner du forventet bilagsmengde?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, knowsExpectedVolume: true }))}
              className={`px-4 py-2 border rounded-lg ${
                formData.knowsExpectedVolume === true
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              Ja
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, knowsExpectedVolume: false }))}
              className={`px-4 py-2 border rounded-lg ${
                formData.knowsExpectedVolume === false
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              Nei
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Salg av momspliktige varer/tjenester?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, willSellWithVat: true }))}
              className={`px-4 py-2 border rounded-lg ${
                formData.willSellWithVat === true
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              Ja
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, willSellWithVat: false }))}
              className={`px-4 py-2 border rounded-lg ${
                formData.willSellWithVat === false
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              Nei
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Firmanavn
        </label>
        <input
          type="text"
          value={formData.companyName}
          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
          className={getInputClasses('companyName')}
          placeholder="Skriv inn firmanavn"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Firmaets organisasjonsform
        </label>
        <select
          value={formData.companyType}
          onChange={(e) => setFormData(prev => ({ ...prev, companyType: e.target.value }))}
          className={getInputClasses('companyType')}
          required
        >
          <option value="">Velg organisasjonsform</option>
          <option value="AS">AS (Aksjeselskap)</option>
          <option value="ENK">ENK (Enkeltpersonforetak)</option>
          <option value="ANS">ANS (Ansvarlig selskap)</option>
          <option value="DA">DA (Delt ansvar)</option>
          <option value="NUF">NUF (Norskregistrert utenlandsk foretak)</option>
          <option value="SA">SA (Samvirkeforetak)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hvor mange ansatte har firmaet?
        </label>
        <select
          value={formData.employeeCount}
          onChange={(e) => setFormData(prev => ({ ...prev, employeeCount: e.target.value }))}
          className={getInputClasses('employeeCount')}
          required
        >
          <option value="">Velg antall ansatte</option>
          <option value="0-1">0-1 ansatte (i tillegg til meg)</option>
          <option value="2-5">2-5 ansatte</option>
          <option value="6-10">6-10 ansatte</option>
          <option value="11-20">11-20 ansatte</option>
          <option value="21+">21+ ansatte</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hvor mange bilag lages per måned?
        </label>
        <div className="flex flex-wrap gap-2">
          {["0-10", "10-50", "50-100", "Mer enn 200"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, monthlyReceipts: option }))}
              className={`px-4 py-2 border rounded-lg ${
                formData.monthlyReceipts === option
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Selges momspliktige varer/tjenester?
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, hasVatLiability: true }))}
            className={`px-4 py-2 border rounded-lg ${
              formData.hasVatLiability === true
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-blue-300'
            }`}
          >
            Ja
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, hasVatLiability: false }))}
            className={`px-4 py-2 border rounded-lg ${
              formData.hasVatLiability === false
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-blue-300'
            }`}
          >
            Nei
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Er momsregistrert
          </label>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, isVatRegistered: !prev.isVatRegistered }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.isVatRegistered ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.isVatRegistered ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Er revisjonspliktig
          </label>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, isAuditRequired: !prev.isAuditRequired }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.isAuditRequired ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.isAuditRequired ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Har regnskapsfører
          </label>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, hasAccountant: !prev.hasAccountant }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.hasAccountant ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.hasAccountant ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Har regnskapsprogram
            </label>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                hasAccountingSystem: !prev.hasAccountingSystem,
                accountingSystem: !prev.hasAccountingSystem ? '' : prev.accountingSystem
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.hasAccountingSystem ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.hasAccountingSystem ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {formData.hasAccountingSystem && (
            <select
              value={formData.accountingSystem}
              onChange={(e) => setFormData(prev => ({ ...prev, accountingSystem: e.target.value }))}
              className={getInputClasses('accountingSystem')}
              required
            >
              <option value="">Hvilket regnskapsprogram brukes i dag?</option>
              <option value="Tripletex">Tripletex</option>
              <option value="Poweroffice">Poweroffice</option>
              <option value="Fiken">Fiken</option>
              <option value="Visma">Visma</option>
              <option value="Xledger">Xledger</option>
              <option value="Uni Economy">Uni Economy</option>
              <option value="Andre">Andre</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Din kontaktinfo
        </h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Navn kontaktperson
        </label>
        <input
          type="text"
          value={formData.contactName}
          onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
          className={getInputClasses('contactName')}
          placeholder="Navn kontaktperson"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Postnummer hvor du ønsker bistand
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
                setFormData(prev => ({ ...prev, municipality: municipality || null }));
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
            placeholder="Postnummer"
            maxLength={4}
            pattern="[0-9]{4}"
            required
          />
          {formData.postalCode.length === 4 && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {formData.municipality ? (
                <>
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{formData.municipality}</span>
                </>
              ) : (
                <span className="text-sm text-red-600">Ikke gyldig</span>
              )}
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
          className={getInputClasses('email')}
          placeholder="E-post"
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
          placeholder="Telefonnummer"
          pattern="[0-9]*"
          inputMode="numeric"
          required
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
            Jeg godkjenner vilkårene til Regnskapsførerlisten.no
          </label>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 p-3 animate-bounce">
          <Check className="h-12 w-12 text-green-600" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-900">
          Takk for din henvendelse!
        </h3>
        
        <p className="text-gray-600 max-w-sm mx-auto">
          Du vil bli kontaktet fortløpende av dyktige regnskapsførere som kan hjelpe deg.
        </p>
      </div>

      <div className="pt-4">
        <div className="inline-flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
          <Check className="h-4 w-4" />
          <span>Vi tar kontakt innen 24 timer</span>
        </div>
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 0 && formData.hasCompany !== null) {
      setCurrentStep(1);
    } 
    else if (currentStep === 1 && formData.hasCompany === false && formData.willHireEmployees !== null && formData.knowsExpectedVolume !== null && formData.willSellWithVat !== null) {
      setCurrentStep(2);
    }
    else if (currentStep === 1 && formData.hasCompany === true && formData.companyName && formData.companyType && formData.employeeCount && formData.monthlyReceipts && formData.hasVatLiability !== null) {
      setCurrentStep(2);
    }
    else if (currentStep === 2) {
      setCurrentStep(3);
    }
    else if (currentStep === 3) {
      setIsSubmitting(true);
      try {
        const webhookUrl = 'https://hook.eu1.make.com/qr6ty7qwlyziu9mrnq982sjcx3odv1s3';
        const webhookData = {
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

        // Trigger confetti effect
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8']
        });

        setCurrentStep(4); // Show success step
        
        // Remove the setTimeout and form reset
        // The success step will stay until page refresh

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
    }
  };

  const canProceed = () => {
    if (formData.hasCompany === false) {
      switch (currentStep) {
        case 0:
          return formData.hasCompany !== null;
        case 1:
          return formData.willHireEmployees !== null && 
                 formData.knowsExpectedVolume !== null && 
                 formData.willSellWithVat !== null;
        case 2:
          return formData.contactName !== '' && 
                 formData.email !== '' && 
                 formData.phone !== '' && 
                 formData.postalCode.length === 4 &&
                 formData.municipality !== null &&
                 formData.acceptTerms;
        default:
          return false;
      }
    }
    switch (currentStep) {
      case 0:
        return formData.hasCompany !== null;
      case 1:
        return formData.companyName !== '' && 
               formData.companyType !== '' && 
               formData.employeeCount !== '' &&
               formData.monthlyReceipts !== '' &&
               formData.hasVatLiability !== null;
      case 2:
        return !formData.hasAccountingSystem || 
               (formData.hasAccountingSystem && formData.accountingSystem !== '');
      case 3:
        return formData.contactName !== '' && 
               formData.email !== '' && 
               formData.phone !== '' && 
               formData.postalCode.length === 4 &&
               formData.municipality !== null &&
               formData.acceptTerms;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-b from-white via-white to-blue-50 p-8 rounded-3xl shadow-lg">
        <div className="mb-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-6">
            Gratis og uforpliktende
          </span>
          
          <h2 className="text-2xl font-semibold text-gray-900">
            {currentStep === 4 ? '' : 'Få hjelp med regnskapet ditt nå'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="min-h-[400px]">
            {currentStep === 0 && renderStep1()}
            {currentStep === 1 && formData.hasCompany === false && renderPlanningStep()}
            {currentStep === 1 && formData.hasCompany === true && renderStep2()}
            {currentStep === 2 && formData.hasCompany === true && renderStep3()}
            {((currentStep === 2 && formData.hasCompany === false) || 
              (currentStep === 3 && formData.hasCompany === true)) && renderStep4()}
            {currentStep === 4 && renderSuccessStep()}
          </div>

          {currentStep !== 4 && (
            <>
              <Button 
                className="w-full bg-blue-500 hover:bg-blue-600 transition-colors" 
                type="submit"
                disabled={!canProceed()}
              >
                {currentStep === steps.length - 1 ? "Send forespørsel" : "Neste"}
              </Button>

              {renderStepIndicators()}

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                {currentStep > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="hover:text-gray-700"
                    >
                      Tilbake
                    </button>
                    <span>•</span>
                  </>
                )}
                <p>Tjenesten er gratis og helt uforpliktende!</p>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}; 