import { useState, useMemo, useEffect } from "react";
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
  const [filters, setFilters] = useState({
    treatments: new Set<string>(),
    certifications: new Set<string>(),
    payments: new Set<string>(),
  });

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

  // Memoize the filtered companies
  const filteredCompanies = useMemo(() => {
    if (!filters.treatments.size && !filters.certifications.size && !filters.payments.size) {
      return companies;
    }

    return companies.filter(company => {
      const hasTreatment = filters.treatments.size === 0 || 
        (company.treatments?.some(t => filters.treatments.has(t.toString())) ?? false);
      
      const hasCertification = filters.certifications.size === 0 || 
        (company.certifications?.some(c => filters.certifications.has(c.toString())) ?? false);
      const hasPayment = filters.payments.size === 0 || 
        (company.paymentMethods?.some(p => filters.payments.has(p)) ?? false);

      return hasTreatment && hasCertification && hasPayment;
    });
  }, [companies, filters]);

  // Update filters
  const handleFilterChange = (type: 'treatments' | 'certifications' | 'payments', value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      const set = new Set(prev[type]);
      
      if (set.has(value)) {
        set.delete(value);
      } else {
        set.add(value);
      }
      
      newFilters[type] = set;
      return newFilters;
    });
  };

  // Effect to trigger parent update when filters change
  useEffect(() => {
    onFilter(filteredCompanies);
  }, [filteredCompanies, onFilter]);

  return (
    <Card className="bg-white border-0 shadow-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-8">Filtrer klinikker</h2>
        
        {/* Treatments Section */}
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
              >
                <Checkbox
                  id={service.id}
                  checked={filters.treatments.has(service.id)}
                  onCheckedChange={() => handleFilterChange('treatments', service.id)}
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
              >
                <Checkbox
                  id={cert.id}
                  checked={filters.certifications.has(cert.id)}
                  onCheckedChange={() => handleFilterChange('certifications', cert.id)}
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
              >
                <Checkbox
                  id={payment.id}
                  checked={filters.payments.has(payment.id)}
                  onCheckedChange={() => handleFilterChange('payments', payment.id)}
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