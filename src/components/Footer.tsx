import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { TREATMENTS } from "../types/treatments";

const Footer = () => {
  const topCities = [
    "Oslo",
    "Bergen",
    "Trondheim",
    "Stavanger",
    "Drammen"
  ];

  return (
    <footer className="bg-purple-950 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1: Logo & Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Skjønnhetsklinikker.no</h3>
            <p className="text-purple-200 mb-6">
              Din guide til å finne de beste skjønnhetsklinikkene i Norge
            </p>
            <div className="text-sm text-purple-300 space-y-2">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <p>Oslo, Norge</p>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <p>+47 400 00 000</p>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <p>kontakt@skjonnhetsklinikker.no</p>
              </div>
            </div>
          </div>

          {/* Column 2: Behandlinger */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Populære behandlinger</h3>
            <ul className="space-y-2">
              {TREATMENTS.slice(0, 7).map((treatment) => (
                <li key={treatment.id}>
                  <Link 
                    to={`/behandling/${treatment.id}`} 
                    className="text-purple-200 hover:text-white transition-colors"
                  >
                    {treatment.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Om Oss */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Om Oss</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/om-oss" className="text-purple-200 hover:text-white transition-colors">
                  Om Skjønnhetsklinikkguiden
                </Link>
              </li>
              <li>
                <Link to="/kontakt" className="text-purple-200 hover:text-white transition-colors">
                  Kontakt Oss
                </Link>
              </li>
              <li>
                <Link to="/personvern" className="text-purple-200 hover:text-white transition-colors">
                  Personvern
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-purple-200 hover:text-white transition-colors">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Byer */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Finn klinikk</h3>
            <ul className="space-y-2">
              {topCities.map((city) => (
                <li key={city}>
                  <Link 
                    to={`/${city.toLowerCase()}`}
                    className="text-purple-200 hover:text-white transition-colors"
                  >
                    Skjønnhetsklinikk {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="mt-12 pt-8 border-t border-purple-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-purple-300 text-sm mb-4 md:mb-0">
              © 2024 Skjønnhetsklinikker.no | Eies av Netsure AS | Org.nr: 834 762 102
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-purple-200 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-purple-200 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;