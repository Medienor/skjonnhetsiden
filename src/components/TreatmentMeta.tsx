import { Clock, Coins } from "lucide-react";

interface TreatmentMetaProps {
  price: {
    from: number;
    to: number;
  };
  duration: {
    from: number;
    to: number;
  };
  className?: string;
}

export const TreatmentMeta = ({ price, duration, className = "" }: TreatmentMetaProps) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours}t ${remainingMinutes}min` 
      : `${hours}t`;
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50">
          <Coins className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Pris</p>
          <p className="font-medium text-gray-900">
            {formatPrice(price.from)} - {formatPrice(price.to)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50">
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Varighet</p>
          <p className="font-medium text-gray-900">
            {formatDuration(duration.from)} - {formatDuration(duration.to)}
          </p>
        </div>
      </div>
    </div>
  );
}; 