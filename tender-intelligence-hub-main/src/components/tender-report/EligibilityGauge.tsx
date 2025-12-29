import { cn } from "@/lib/utils";

interface EligibilityGaugeProps {
  score: number;
  maxScore?: number;
}

export const EligibilityGauge = ({ score, maxScore = 100 }: EligibilityGaugeProps) => {
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage > 80) return "text-green-500";
    if (percentage >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getStrokeColor = () => {
    if (percentage > 80) return "#22c55e";
    if (percentage >= 50) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={getStrokeColor()}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-4xl font-bold", getColor())}>{score}</span>
          <span className="text-sm text-muted-foreground">/ {maxScore}</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-muted-foreground">Eligibility Score</p>
    </div>
  );
};
