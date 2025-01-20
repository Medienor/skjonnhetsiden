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
import { MapPin, Search, ChevronDown, Check } from "lucide-react";

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
  const [municipality, setMunicipality] = useState<string | null>(null);
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
    <div className={`flex flex-col w-full max-w-[600px] mx-auto gap-3 ${className}`}>
      {/* Search by postal code section */}
      <div className="relative flex flex-col sm:flex-row w-full gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Søk på postnummer..."
            value={postalCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 4) {
                setPostalCode(value);
                if (value.length === 4) {
                  const found = findMunicipalityByPostalCode(value);
                  setMunicipality(found);
                } else {
                  setMunicipality(null);
                }
              }
            }}
            className={`pl-9 w-full h-11 bg-white/90 shadow-lg backdrop-blur-sm ${inputClassName}`}
            maxLength={4}
          />
          {municipality && (
            <div className="absolute right-0 top-0 h-full flex items-center pr-3">
              <div className="flex items-center gap-1 text-emerald-600">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">{municipality}</span>
              </div>
            </div>
          )}
        </div>
        <Button 
          onClick={handlePostalSearch}
          className="h-11 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto shadow-lg"
        >
          Søk
        </Button>
      </div>

      {/* Divider with larger text */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-white/20"></div>
        <span className="text-xl text-white whitespace-nowrap font-medium">eller</span>
        <div className="flex-1 h-px bg-white/20"></div>
      </div>

      {/* Municipality dropdown section */}
      <div className="relative w-full" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center justify-between w-full h-11 px-4 bg-white/90 shadow-lg backdrop-blur-sm rounded-lg hover:bg-white/95 ${selectClassName}`}
        >
          <span className="text-gray-700">
            {selectedMunicipality || "Velg kommune"}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        {isDropdownOpen && (
          <div className={`absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl ${dropdownClassName}`}>
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Søk etter kommune..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-transparent ${optionClassName}`}
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