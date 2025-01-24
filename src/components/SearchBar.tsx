import { useState, useRef } from "react";
import { Search, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { findMunicipalityByPostalCode, denormalizeMunicipalityName } from "@/utils/municipalityData";
import { Button } from "./ui/button";

interface SearchBarProps {
  onSearch: (term: string) => void;
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  optionClassName?: string;
  selectClassName?: string;
}

export const SearchBar = ({
  onSearch,
  className = '',
  inputClassName = '',
  dropdownClassName = '',
  optionClassName = '',
  selectClassName = ''
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [municipality, setMunicipality] = useState<string | null>(null);
  const [isPostalCode, setIsPostalCode] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;

    if (isPostalCode && municipality) {
      navigate(`/${municipality.toLowerCase()}`);
    } else {
      navigate(`/${searchTerm.toLowerCase()}`);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    
    // Check if input is a postal code (4 digits)
    const isPostal = /^\d{4}$/.test(value);
    setIsPostalCode(isPostal);

    if (isPostal) {
      const found = findMunicipalityByPostalCode(value);
      setMunicipality(found ? found.name : null);
    } else {
      setMunicipality(null);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`w-full max-w-xl mx-auto ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            className={`w-full h-[55px] px-4 py-3 pl-12 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 text-gray-900 ${
              isPostalCode
                ? municipality
                  ? 'border-green-500 focus:ring-green-500 pr-40'
                  : 'border-red-300 focus:ring-red-500'
                : 'border border-gray-200 focus:ring-blue-500'
            } ${inputClassName}`}
            placeholder="Søk etter by eller postnummer..."
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          
          {isPostalCode && searchTerm.length === 4 && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
              {municipality ? (
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {denormalizeMunicipalityName(municipality)}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-red-600">Ikke gyldig</span>
              )}
            </div>
          )}
        </div>
        
        <Button 
          type="submit"
          className="bg-purple-950 hover:bg-purple-900 text-white px-8 h-[55px]"
        >
          Søk
        </Button>
      </div>
    </form>
  );
};