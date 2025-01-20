import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Accountant } from "@/types/accountant";

interface AccountantCardProps {
  accountant: Accountant;
}

export const AccountantCard = ({ accountant }: AccountantCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-blue-900">{accountant.name}</h3>
            <p className="text-gray-600 mt-1">{accountant.location}</p>
          </div>
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="ml-1 font-semibold">{accountant.rating}</span>
          </div>
        </div>
        
        <p className="mt-4 text-gray-600">{accountant.description}</p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {accountant.services.map((service) => (
            <Badge key={service} variant="secondary">
              {service}
            </Badge>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Timepris:</p>
            <p className="font-semibold text-blue-900">{accountant.priceRange}</p>
          </div>
          <Link 
            to={`/company/${accountant.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Les mer →
          </Link>
        </div>
      </div>
    </Card>
  );
};