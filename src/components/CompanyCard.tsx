import { MapPin, Phone, Globe, Star, Building2, Award, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Company } from "@/types/Company";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { normalizeCompanyName } from "@/utils/companyData";
import { useMemo } from "react";

interface CompanyCardProps {
  company: Company & {
    averageRating?: number;
    totalReviews?: number;
  };
  highlightedTreatment?: string;
  isRelevant?: boolean;
}

export const CompanyCard = ({ company, highlightedTreatment, isRelevant = true }: CompanyCardProps) => {
  const navigate = useNavigate();
  const companyName = company.name || company.navn || '';
  
  const isPremium = useMemo(() => {
    if (!company.averageRating || !company.totalReviews) return false;
    return company.averageRating > 4.8 && company.totalReviews > 0;
  }, [company.averageRating, company.totalReviews]);
  
  const ratingDisplay = useMemo(() => {
    if (!company.averageRating || !company.totalReviews) {
      return 'Ingen vurderinger ennå';
    }
    return `${company.averageRating.toFixed(1)} (${company.totalReviews} vurderinger)`;
  }, [company.averageRating, company.totalReviews]);
  
  return (
    <div 
      className={cn(
        "relative rounded-lg transition-all duration-200",
        isPremium 
          ? "bg-gradient-to-br from-white via-purple-50/30 to-purple-100/20 border-2 border-purple-200 p-8" 
          : `bg-white border ${isRelevant ? 'border-gray-200' : 'border-gray-100'} p-6`,
        "hover:shadow-md"
      )}
    >
      {isPremium && (
        <div className="absolute -top-4 left-6 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Topp-rangert klinikk
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className={cn(
          "w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0",
          isPremium 
            ? "bg-gradient-to-br from-purple-100 to-purple-50 ring-2 ring-purple-200" 
            : "bg-gradient-to-br from-purple-50 to-pink-50"
        )}>
          {isPremium ? (
            <Award className="w-8 h-8 text-purple-600" />
          ) : (
            <Building2 className="w-8 h-8 text-purple-400" />
          )}
        </div>

        <div className="flex-1">
          <h3 className={cn(
            "text-xl font-semibold",
            isPremium ? "text-purple-900" : "text-gray-900"
          )}>
            {companyName}
          </h3>
          
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    company.averageRating && i < Math.floor(company.averageRating)
                      ? isPremium 
                        ? "text-purple-500 fill-purple-500" 
                        : "text-purple-400 fill-purple-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className={cn(
              "text-sm ml-2",
              isPremium ? "text-purple-700 font-medium" : "text-gray-600"
            )}>
              {ratingDisplay}
            </span>
          </div>
        </div>
      </div>
      
      {company.forretningsadresse && (
        <p className="text-gray-600 mb-2 flex items-start">
          <MapPin className={cn(
            "w-4 h-4 mr-2 mt-1 flex-shrink-0",
            isPremium ? "text-purple-500" : "text-purple-400"
          )} />
          <span>
            {company.forretningsadresse.adresse.join(', ')}<br />
            {company.forretningsadresse.postnummer} {company.forretningsadresse.poststed}
          </span>
        </p>
      )}
      
      {company.phone && (
        <p className="text-gray-600 flex items-center">
          <Phone className={cn(
            "w-4 h-4 mr-2",
            isPremium ? "text-purple-500" : "text-purple-400"
          )} />
          {company.phone}
        </p>
      )}

      {isPremium && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 bg-purple-50/50 p-2 rounded-md">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Star className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-purple-900">Høyt rangert</div>
              <div className="text-purple-600">Topp kvalitet</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-purple-50/50 p-2 rounded-md">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-purple-900">Verifisert</div>
              <div className="text-purple-600">Anbefalt</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant={isPremium ? "default" : "outline"}
          onClick={() => navigate('/tilbud')}
          className={cn(
            "bg-purple-900 hover:bg-purple-800 text-white px-6",
            isPremium && "shadow-lg shadow-purple-100"
          )}
        >
          Be om tilbud
        </Button>
        
        <Link 
          to={`/klinikk/${normalizeCompanyName(companyName)}`}
          className="text-purple-700 hover:text-purple-900 font-medium flex items-center"
        >
          Se full profil →
        </Link>
      </div>
    </div>
  );
}; 