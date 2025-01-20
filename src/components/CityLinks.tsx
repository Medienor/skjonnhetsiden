import { Link } from "react-router-dom";

export const CityLinks = () => {
  const cities = [
    "Oslo",
    "Bergen",
    "Trondheim",
    "Stavanger",
    "Drammen",
    "Kristiansand",
    "Tromsø",
    "Fredrikstad"
  ];

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">
        Finn regnskapsfører i andre byer
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cities.map((city) => (
          <Link
            key={city}
            to={`/${city.toLowerCase()}`}
            className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            Regnskapsfører {city}
          </Link>
        ))}
      </div>
    </div>
  );
};