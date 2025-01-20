import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Search, X, MapPin, Building2 } from "lucide-react";
import { getAllMunicipalities, normalizeMunicipalityName } from "@/utils/municipalityData";
import { useNavigate } from "react-router-dom";
import { searchItems } from "@/utils/search";

const topCities = [
  "Oslo",
  "Bergen",
  "Trondheim",
  "Stavanger",
  "Drammen"
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const municipalities = getAllMunicipalities();
  const [searchResults, setSearchResults] = useState<Awaited<ReturnType<typeof searchItems>>>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const doSearch = async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        const results = await searchItems(searchTerm);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(doSearch, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleMunicipalitySelect = (municipality: string) => {
    const normalizedName = normalizeMunicipalityName(municipality);
    setIsSearchOpen(false);
    setSearchTerm("");
    navigate(`/${normalizedName}`);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-900">
                Regnskapsførerlisten.no
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search icon - visible on both mobile and desktop */}
            <div className="relative" ref={searchRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </Button>

              {isSearchOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Søk etter regnskapsfører..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                  
                  {searchTerm && (
                    <div className="max-h-96 overflow-y-auto border-t">
                      {isSearching ? (
                        <div className="p-3 text-sm text-gray-500 text-center">
                          Søker...
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500 text-center">
                          Ingen resultater funnet
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {searchResults.map((result, index) => (
                            <Link
                              key={`${result.type}-${index}`}
                              to={result.url}
                              className="flex items-start gap-3 px-4 py-2 hover:bg-gray-50"
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchTerm("");
                              }}
                            >
                              {result.type === 'municipality' ? (
                                <MapPin className="h-4 w-4 mt-1 text-gray-400" />
                              ) : (
                                <Building2 className="h-4 w-4 mt-1 text-gray-400" />
                              )}
                              <div>
                                <div className="text-sm text-gray-700">{result.name}</div>
                                {result.subtitle && (
                                  <div className="text-xs text-gray-500">{result.subtitle}</div>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/sporsmal" className="text-gray-600 hover:text-blue-700">
                Spørsmål
              </Link>
              <Link to="/kalender" className="text-gray-600 hover:text-blue-700">
                Kalender
              </Link>
              <Link to="/samarbeid" className="text-gray-600 hover:text-blue-700">
                Samarbeid
              </Link>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-gray-600 hover:text-blue-700 text-base">
                      Byer
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="w-48 p-2">
                        {topCities.map((city) => (
                          <li key={city}>
                            <Link
                              to={`/${city.toLowerCase()}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                            >
                              Regnskapsfører {city}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link to="/tilbud">Få tilbud</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center justify-center"
              >
                <span className="sr-only">Open menu</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={isMobileMenuOpen 
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm" 
                 onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
              <div className="flex flex-col h-full">
                {/* Mobile menu header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Meny</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-full hover:bg-gray-100"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Mobile menu content */}
                <div className="flex-1 overflow-y-auto">
                  <nav className="px-4 py-6 space-y-6">
                    {/* Primary navigation */}
                    <div className="space-y-3">
                      <Link 
                        to="/sporsmal" 
                        className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Spørsmål
                      </Link>
                      <Link 
                        to="/kalender" 
                        className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Kalender
                      </Link>
                      <Link 
                        to="/samarbeid" 
                        className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Samarbeid
                      </Link>
                    </div>

                    {/* Cities section */}
                    <div className="space-y-3">
                      <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Populære Byer
                      </h3>
                      <div className="space-y-1">
                        {topCities.map((city) => (
                          <Link
                            key={city}
                            to={`/${city.toLowerCase()}`}
                            className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                            <span>Regnskapsfører {city}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </nav>
                </div>

                {/* Mobile menu footer */}
                <div className="p-4 border-t bg-gray-50">
                  <Button 
                    asChild 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Link 
                      to="/tilbud"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center"
                    >
                      Få tilbud
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;