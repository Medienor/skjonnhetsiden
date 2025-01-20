import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";
import { Button } from "./ui/button";
import { FilterPopup } from "./FilterPopup";
import type { Company } from "@/types/Company";

interface FilterSectionProps {
  onFilter: (results: Company[]) => void;
  accountants: Company[];
}

export const FilterSection = ({ onFilter, accountants }: FilterSectionProps) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [filteredCount, setFilteredCount] = useState(accountants.length);
  const [isMobile, setIsMobile] = useState(false);

  const services = [
    "Regnskap",
    "Lønn",
    "Fakturering",
    "Årsoppgjør",
    "Rådgivning",
    "Bokføring"
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px is typically tablet breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setFilteredCount(accountants.length);
  }, [accountants]);

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

  if (isMobile) {
    return (
      <>
        <Button
          onClick={() => setIsPopupOpen(true)}
          variant="outline"
          className="flex items-center gap-2 w-full"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>

        <FilterPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          onFilter={onFilter}
          accountants={accountants}
          filteredCount={filteredCount}
        />
      </>
    );
  }

  // Original desktop filter UI
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Tjenester</h2>
      <div className="space-y-6">
        <div>
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
    </div>
  );
};