import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import type { Treatment } from '@/types/treatments';

interface TreatmentCardProps {
  treatment: Treatment;
}

export const TreatmentCard = ({ treatment }: TreatmentCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-[16/9] relative">
        {treatment.image && (
          <img
            src={treatment.image}
            alt={treatment.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900">
          {treatment.title}
        </h3>
        {treatment.shortDescription && (
          <p className="text-gray-600 text-sm mt-1">
            {treatment.shortDescription}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          {treatment.price && (
            <div className="text-sm text-gray-500">
              Fra kr {treatment.price.from},-
            </div>
          )}
          {treatment.duration && (
            <div className="text-sm text-gray-500">
              {treatment.duration.from} min
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <Link 
            to={`/behandling/${treatment.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Les mer →
          </Link>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showDetails ? <Minus size={20} /> : <Plus size={20} />}
          </button>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {treatment.fordeler.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Fordeler:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {treatment.fordeler.map((fordel, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {fordel}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 