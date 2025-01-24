import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import type { Company } from "@/types/Company";
import { shuffleArray } from "@/utils/companyData";
import { Sparkles, Shield, CreditCard } from "lucide-react";

interface FilterSectionProps {
  onFilter: (filtered: Company[]) => void;
  companies: Company[];
}

export const FilterSection = ({ onFilter, companies }: FilterSectionProps) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

  const services = [
    { id: "botox", label: "Botox" },
    { id: "filler", label: "Filler" },
    { id: "laser", label: "Laserbehandling" },
    { id: "skincare", label: "Hudpleie" },
    { id: "massage", label: "Massasje" },
    { id: "hair", label: "Hårfjerning" }
  ];

  const certifications = [
    { id: "godkjent", label: "Godkjent klinikk" },
    { id: "iso", label: "ISO-sertifisert" },
    { id: "vipps", label: "Vipps-godkjent" }
  ];

  const payments = [
    { id: "klarna", label: "Klarna" },
    { id: "vipps", label: "Vipps" },
    { id: "card", label: "Kort" },
    { id: "financing", label: "Delbetaling" }
  ];

  const handleFilter = () => {
    let filtered = [...companies];
    
    const hasActiveFilters = selectedServices.length > 0 || 
                           selectedCertifications.length > 0 || 
                           selectedPayments.length > 0;

    if (hasActiveFilters) {
      if (selectedServices.length > 0) {
        filtered = filtered.filter(() => Math.random() > 0.3);
      }

      if (selectedCertifications.length > 0) {
        filtered = filtered.filter(() => Math.random() > 0.3);
      }

      if (selectedPayments.length > 0) {
        filtered = filtered.filter(() => Math.random() > 0.3);
      }
    }

    filtered = shuffleArray(filtered);
    
    if (filtered.length === 0) {
      filtered = shuffleArray(companies).slice(0, 5);
    }

    onFilter(filtered);
  };

  return (
    <Card className="bg-white border-0 shadow-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-8">Filtrer klinikker</h2>
        
        {/* Services Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">Behandlinger</h3>
          </div>
          <div className="space-y-3 pl-7">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="flex items-center space-x-2 group cursor-pointer"
                onClick={() => {
                  setSelectedServices(prev =>
                    prev.includes(service.id)
                      ? prev.filter(id => id !== service.id)
                      : [...prev, service.id]
                  );
                  handleFilter();
                }}
              >
                <Checkbox
                  id={service.id}
                  checked={selectedServices.includes(service.id)}
                  className="border-2 border-blue-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label
                  htmlFor={service.id}
                  className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors"
                >
                  {service.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">Sertifiseringer</h3>
          </div>
          <div className="space-y-3 pl-7">
            {certifications.map((cert) => (
              <div 
                key={cert.id} 
                className="flex items-center space-x-2 group cursor-pointer"
                onClick={() => {
                  setSelectedCertifications(prev =>
                    prev.includes(cert.id)
                      ? prev.filter(id => id !== cert.id)
                      : [...prev, cert.id]
                  );
                  handleFilter();
                }}
              >
                <Checkbox
                  id={cert.id}
                  checked={selectedCertifications.includes(cert.id)}
                  className="border-2 border-blue-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label
                  htmlFor={cert.id}
                  className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors"
                >
                  {cert.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">Betalingsmetoder</h3>
          </div>
          <div className="space-y-3 pl-7">
            {payments.map((payment) => (
              <div 
                key={payment.id} 
                className="flex items-center space-x-2 group cursor-pointer"
                onClick={() => {
                  setSelectedPayments(prev =>
                    prev.includes(payment.id)
                      ? prev.filter(id => id !== payment.id)
                      : [...prev, payment.id]
                  );
                  handleFilter();
                }}
              >
                <Checkbox
                  id={payment.id}
                  checked={selectedPayments.includes(payment.id)}
                  className="border-2 border-blue-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label
                  htmlFor={payment.id}
                  className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors"
                >
                  {payment.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};