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
import { Search, X, MapPin, Syringe } from "lucide-react";
import logo from "/logo1.svg";

const topCities = [
  "Oslo",
  "Bergen",
  "Trondheim",
  "Stavanger",
  "Drammen"
];

const topTreatments = [
  { title: "Botox", id: "botox" },
  { title: "Leppefiller", id: "leppefiller" },
  { title: "HIFU", id: "hifu" },
  { title: "Fettfjerning", id: "fettfjerning" },
  { title: "Hudforbedrende laserbehandlinger", id: "hudforbedrende" },
  { title: "Ansiktsskulpturering", id: "ansiktsskulpturering" },
  { title: "Medisinsk hudpleie", id: "medisinsk-hudpleie" },
  { title: "Hårfjerning med laser", id: "harfjerning" },
  { title: "Dermapen", id: "dermapen" },
  { title: "Akne og aknearr", id: "akne" }
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <img src={logo} alt="Skjønnhetsklinikkguiden.no" className="h-16 w-auto" />
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-gray-600 hover:text-blue-700 text-base">
                      Byer
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="w-56 p-2">
                        {topCities.map((city) => (
                          <li key={city}>
                            <Link
                              to={`/${city.toLowerCase()}`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                            >
                              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                              Klinikker i {city}
                            </Link>
                          </li>
                        ))}
                        <li className="mt-2 pt-2 border-t border-gray-100">
                          <Link
                            to="/behandlinger"
                            className="flex items-center px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 rounded-md"
                          >
                            <Syringe className="h-4 w-4 mr-2 text-purple-600" />
                            Alle behandlinger
                          </Link>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-gray-600 hover:text-blue-700 text-base">
                      Behandlinger
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="w-64 p-2">
                        {topTreatments.map((treatment) => (
                          <li key={treatment.id}>
                            <Link
                              to={`/behandling/${treatment.id}`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                            >
                              <Syringe className="h-4 w-4 mr-2 text-gray-400" />
                              {treatment.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <Link 
                to="/artikler" 
                className="text-gray-600 hover:text-blue-700 text-base"
              >
                Artikler
              </Link>

              <Button 
                asChild 
                className="bg-purple-950 hover:bg-purple-900 text-white transition-colors"
              >
                <Link to="/tilbud">Bestill time</Link>
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

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm" 
                 onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
              <div className="flex flex-col h-full">
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

                <div className="flex-1 overflow-y-auto">
                  <nav className="px-4 py-6 space-y-6">
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
                            <span>Klinikker i {city}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Treatments section */}
                    <div className="space-y-3">
                      <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Populære Behandlinger
                      </h3>
                      <div className="space-y-1">
                        {topTreatments.map((treatment) => (
                          <Link
                            key={treatment.id}
                            to={`/behandling/${treatment.id}`}
                            className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Syringe className="h-5 w-5 mr-3 text-gray-400" />
                            <span>{treatment.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </nav>
                </div>

                <div className="p-4 border-t bg-gray-50">
                  <Button 
                    asChild 
                    className="w-full bg-purple-950 hover:bg-purple-900 text-white transition-colors"
                  >
                    <Link 
                      to="/tilbud"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Bestill time
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