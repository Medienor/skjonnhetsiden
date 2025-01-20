import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import type { Accountant } from '@/types/accountant';
import { Link } from 'react-router-dom';
import { normalizeCompanyName } from '@/utils/companyData';
import { Loader2 } from 'lucide-react';

interface AccountantsMapProps {
  accountants: Accountant[];
  city: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export const AccountantsMap = ({ accountants, city }: AccountantsMapProps) => {
  const [selectedAccountant, setSelectedAccountant] = useState<Accountant | null>(null);
  const [cityCoordinates, setCityCoordinates] = useState<Coordinates | null>(null);
  const [accountantCoordinates, setAccountantCoordinates] = useState<Map<string, Coordinates>>(new Map());
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const geocodeAddresses = async () => {
      setIsLoadingLocations(true);
      try {
        // First, get city coordinates
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            city + ', Norway'
          )}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        if (data.results[0]) {
          setCityCoordinates(data.results[0].geometry.location);
        }

        // Then get coordinates for each accountant
        const coordinates = new Map<string, Coordinates>();
        for (const accountant of accountants) {
          if (accountant.forretningsadresse?.adresse[0] && accountant.forretningsadresse?.poststed) {
            const address = `${accountant.forretningsadresse.adresse[0]}, ${accountant.forretningsadresse.poststed}, Norway`;
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                address
              )}&key=${GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();
            if (data.results[0]) {
              coordinates.set(accountant.id, data.results[0].geometry.location);
            }
          }
        }
        setAccountantCoordinates(coordinates);
      } catch (error) {
        console.error('Error geocoding addresses:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    if (accountants.length > 0 && city && GOOGLE_MAPS_API_KEY) {
      geocodeAddresses();
    }
  }, [accountants, city, GOOGLE_MAPS_API_KEY]);

  if (!cityCoordinates || !GOOGLE_MAPS_API_KEY) {
    return <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">Laster kart...</div>;
  }

  return (
    <div className="relative">
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerClassName="w-full h-[400px] rounded-lg mb-8"
          center={cityCoordinates}
          zoom={12}
        >
          {accountants.map((accountant) => {
            const coordinates = accountantCoordinates.get(accountant.id);
            if (!coordinates) return null;

            return (
              <Marker
                key={accountant.id}
                position={coordinates}
                onClick={() => setSelectedAccountant(accountant)}
              />
            );
          })}

          {selectedAccountant && accountantCoordinates.get(selectedAccountant.id) && (
            <InfoWindow
              position={accountantCoordinates.get(selectedAccountant.id)!}
              onCloseClick={() => setSelectedAccountant(null)}
            >
              <div className="p-2">
                <h3 className="font-semibold mb-1">{selectedAccountant.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {selectedAccountant.forretningsadresse?.adresse[0]}, {selectedAccountant.forretningsadresse?.poststed}
                </p>
                <Link
                  to={`/regnskapsforer/${normalizeCompanyName(selectedAccountant.name)}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Se profil
                </Link>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
      
      {isLoadingLocations && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
          <p className="text-blue-900 font-medium">
            Henter alle kontorer i {city}...
          </p>
          <p className="text-sm text-gray-600 mt-1">
            ({accountantCoordinates.size} av {accountants.length} funnet)
          </p>
        </div>
      )}
    </div>
  );
}; 