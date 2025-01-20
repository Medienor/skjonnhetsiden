import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  findMunicipalityByPostalCode, 
  normalizeMunicipalityName,
  getAllMunicipalities 
} from "@/utils/municipalityData";
import { getCompaniesByLocation } from '@/utils/companyData';
import { MapPin, Search, ChevronDown } from "lucide-react";

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
  const [postalCode, setPostalCode] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const municipalities = getAllMunicipalities();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePostalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postalCode.trim()) return;

    if (/^\d{4}$/.test(postalCode)) {
      const municipality = findMunicipalityByPostalCode(postalCode);
      
      if (municipality) {
        const companies = getCompaniesByLocation(postalCode);
        console.log(`Found ${companies.length} companies in ${municipality}`);
        
        if (companies.length > 0) {
          // Take only the first part before any separator and convert to lowercase
          const normalizedName = municipality.split(/[-\s]+/)[0].toLowerCase();
          navigate(`/${normalizedName}`);
        }
      }
    }
  };

  const handleMunicipalitySelect = (municipality: string) => {
    setSelectedMunicipality(municipality);
    setIsDropdownOpen(false);
    const normalizedName = normalizeMunicipalityName(municipality);
    navigate(`/${normalizedName}`);
  };

  const filteredMunicipalities = municipalities
    .filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}>
      <div className="relative flex items-center w-full sm:w-auto">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Søk på postnummer..."
            value={postalCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 4) {
                setPostalCode(value);
              }
            }}
            className={`pl-9 w-[200px] h-10 border border-gray-200 rounded-lg ${inputClassName}`}
            maxLength={4}
          />
        </div>
        <Button 
          onClick={handlePostalSearch}
          className="ml-2 h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Søk
        </Button>
      </div>

      <span className="text-sm text-gray-500">eller</span>

      <div className="relative w-full sm:w-auto" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-between w-[200px] h-10 px-3 border border-gray-200 rounded-lg bg-white hover:border-gray-300"
        >
          <span className="text-gray-700">
            {selectedMunicipality || "Velg kommune"}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        {isDropdownOpen && (
          <div className={`absolute z-10 w-[200px] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg ${dropdownClassName}`}>
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Søk etter kommune..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-8 pr-2 py-1 text-sm border border-gray-200 rounded ${optionClassName}`}
                />
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {filteredMunicipalities.length === 0 ? (
                <div className="p-2 text-sm text-gray-500 text-center">
                  Ingen kommune funnet
                </div>
              ) : (
                filteredMunicipalities.map((municipality) => (
                  <button
                    key={municipality.number}
                    onClick={() => handleMunicipalitySelect(municipality.name)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${optionClassName}`}
                  >
                    {municipality.name}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};