import { X, Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { useState, useEffect } from "react";
import type { Company } from "@/types/Company";

interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onFilter: (results: Company[]) => void;
  accountants: Company[];
  filteredCount: number;
}

export const FilterPopup = ({
  isOpen,
  onClose,
  onFilter,
  accountants,
  filteredCount
}: FilterPopupProps) => {
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

    // Filter companies immediately
    if (updatedServices.length === 0) {
      onFilter(accountants);
    } else {
      const filtered = accountants.filter(company => 
        company.aktivitet?.some(activity =>
          updatedServices.some(service =>
            activity.toLowerCase().includes(service.toLowerCase())
          )
        )
      );
      onFilter(filtered);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Filter</h2>
          <button onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <h3 className="font-medium">Tjenester</h3>
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={selectedServices.includes(service)}
                    onCheckedChange={() => handleServiceChange(service)}
                  />
                  <label 
                    htmlFor={service} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {service}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t">
          <Button 
            onClick={onClose}
            className="w-full"
          >
            Se {filteredCount} regnskapsførere
          </Button>
        </div>
      </div>
    </div>
  );
}; 