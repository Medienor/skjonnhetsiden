import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Company } from "@/types/Company";

interface FilterSectionProps {
  onFilter: (filtered: Company[]) => void;
  accountants: Company[];
  className?: string;
}

export const FilterSection = ({ onFilter, accountants, className = '' }: FilterSectionProps) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const services = [
    "Regnskap",
    "Lønn",
    "Fakturering",
    "Årsoppgjør",
    "Rådgivning",
    "Bokføring"
  ];

  const handleServiceChange = (service: string) => {
    const updatedServices = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];

    setSelectedServices(updatedServices);

    if (updatedServices.length === 0) {
      onFilter(accountants);
    } else {
      const filtered = accountants.filter(company => 
        // Check if company's activities match any of the selected services
        company.aktivitet?.some(activity =>
          updatedServices.some(service =>
            activity.toLowerCase().includes(service.toLowerCase())
          )
        )
      );
      onFilter(filtered);
    }
  };

  return (
    <div className={className}>
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Tjenester</h3>
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service} className="flex items-center">
                  <Checkbox
                    id={service}
                    checked={selectedServices.includes(service)}
                    onCheckedChange={() => handleServiceChange(service)}
                  />
                  <label
                    htmlFor={service}
                    className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {service}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};