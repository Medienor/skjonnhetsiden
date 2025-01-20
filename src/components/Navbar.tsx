import { Link } from "react-router-dom";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";

const topCities = [
  "Oslo",
  "Bergen",
  "Trondheim",
  "Stavanger",
  "Drammen"
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          
          {/* Navigation Links */}
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
                  <NavigationMenuTrigger 
                    className="text-gray-600 hover:text-blue-700 text-base"
                  >
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
          <div className="md:hidden flex items-center">
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
                    ? "M6 18L18 6M6 6l12 12" // X icon when open
                    : "M4 6h16M4 12h16M4 18h16" // Hamburger icon when closed
                  }
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                to="/sporsmal" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Spørsmål
              </Link>
              <Link 
                to="/kalender" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Kalender
              </Link>
              <Link 
                to="/samarbeid" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Samarbeid
              </Link>
              
              {/* Mobile Cities Dropdown */}
              <div className="relative">
                <button
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={(e) => {
                    e.preventDefault();
                    // You might want to add a separate state for this dropdown
                  }}
                >
                  Byer
                </button>
                <div className="pl-4">
                  {topCities.map((city) => (
                    <Link
                      key={city}
                      to={`/${city.toLowerCase()}`}
                      className="block px-3 py-2 rounded-md text-base text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Regnskapsfører {city}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link 
                    to="/tilbud"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Få tilbud
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;