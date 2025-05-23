
import { Badge } from "@/components/ui/badge";

const Logo = ({ size = "default" }) => {
  const sizeClasses = {
    "small": "text-lg",
    "default": "text-2xl",
    "large": "text-4xl"
  };

  return (
    <div className="flex items-center gap-2">
      <div className="font-bold text-corporate-700 flex items-center">
        <span className={`${sizeClasses[size]}`}>Meal</span>
        <span className={`${sizeClasses[size]} text-corporate-500`}>Mate</span>
      </div>
      {size !== "small" && (
        <Badge variant="outline" className="text-xs bg-corporate-50 text-corporate-700 border-corporate-200">
          Corporate Edition
        </Badge>
      )}
    </div>
  );
};

export default Logo;
