import { X, Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { useState, useEffect } from "react";
import type { Company } from "@/types/Company";

interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onFilter: (results: Company[]) => void;
  companies: Company[];
  filteredCount: number;
}

export const FilterPopup = ({
  isOpen,
  onClose,
  onFilter,
  companies,
  filteredCount
}: FilterPopupProps) => {
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);

  const treatments = [
    "Botox",
    "Fillers",
    "Ansiktsbehandling",
    "Laser",
    "Hudpleie",
    "Massasje"
  ];

  const handleTreatmentChange = (treatment: string) => {
    const updatedTreatments = selectedTreatments.includes(treatment)
      ? selectedTreatments.filter(t => t !== treatment)
      : [...selectedTreatments, treatment];

    setSelectedTreatments(updatedTreatments);

    // Filter companies immediately
    if (updatedTreatments.length === 0) {
      onFilter(companies);
    } else {
      const filtered = companies.filter(company => 
        company.treatments?.some(treatment =>
          updatedTreatments.some(selectedTreatment =>
            treatment.name.toLowerCase().includes(selectedTreatment.toLowerCase())
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
            <h3 className="font-medium">Behandlinger</h3>
            <div className="space-y-2">
              {treatments.map((treatment) => (
                <div key={treatment} className="flex items-center space-x-2">
                  <Checkbox
                    id={treatment}
                    checked={selectedTreatments.includes(treatment)}
                    onCheckedChange={() => handleTreatmentChange(treatment)}
                  />
                  <label 
                    htmlFor={treatment} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {treatment}
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
            Se {filteredCount} klinikker
          </Button>
        </div>
      </div>
    </div>
  );
}; 