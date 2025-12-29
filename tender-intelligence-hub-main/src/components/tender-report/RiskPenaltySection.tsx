import { AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface RiskItem {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
}

interface RiskPenaltySectionProps {
  risks: RiskItem[];
  isPremium: boolean;
}

export const RiskPenaltySection = ({ risks, isPremium }: RiskPenaltySectionProps) => {
  const navigate = useNavigate();

  const getSeverityColor = (severity: RiskItem["severity"]) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-orange-600 bg-orange-50";
      case "low":
        return "text-yellow-600 bg-yellow-50";
    }
  };

  return (
    <Card className="border-2 border-orange-200 bg-orange-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Hidden Risks & Penalty Clauses
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className={cn("space-y-3", !isPremium && "blur-sm select-none")}>
          {risks.map((risk, index) => (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg border",
                getSeverityColor(risk.severity)
              )}
            >
              <p className="font-medium text-sm">{risk.title}</p>
              <p className="text-sm opacity-80 mt-1">{risk.description}</p>
            </div>
          ))}
        </div>

        {!isPremium && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Premium Feature</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Unlock detailed risk analysis to protect your bid
                </p>
              </div>
              <Button onClick={() => navigate("/subscription")} className="mt-2">
                Upgrade to Pro
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
