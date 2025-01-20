import { Link } from "react-router-dom";

const Footer = () => {
  const topCities = [
    "Oslo",
    "Bergen",
    "Trondheim",
    "Stavanger",
    "Drammen"
  ];

  return (
    <footer className="bg-gray-50 border-t mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Logo */}
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Regnskapsførerlisten.no</h3>
            <p className="text-gray-600 mb-4">
              Din guide til å finne den beste regnskapsføreren for din bedrift
            </p>
            <div className="text-sm text-gray-500">
              <p>Eies av Netsure AS</p>
              <p>Org.nr: 834 762 102</p>
            </div>
          </div>

          {/* Column 2: Om Oss */}
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Om Oss</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/om-oss" className="text-gray-600 hover:text-blue-700">
                  Om Regnskapsførerlisten.no
                </Link>
              </li>
              <li>
                <Link to="/kontakt" className="text-gray-600 hover:text-blue-700">
                  Kontakt Oss
                </Link>
              </li>
              <li>
                <Link to="/personvern" className="text-gray-600 hover:text-blue-700">
                  Personvern
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Finn regnskapsfører */}
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Finn regnskapsfører</h3>
            <ul className="space-y-2">
              {topCities.map((city) => (
                <li key={city}>
                  <Link 
                    to={`/${city.toLowerCase()}`}
                    className="text-gray-600 hover:text-blue-700"
                  >
                    Regnskapsfører {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;