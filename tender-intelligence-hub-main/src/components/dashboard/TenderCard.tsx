import { Calendar, Building2, DollarSign, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TenderCardProps {
  title: string;
  organization: string;
  deadline: string;
  value: string;
  status: "open" | "closing-soon" | "closed";
  matchScore: number;
}

const statusConfig = {
  "open": { label: "Open", className: "bg-success/10 text-success border-success/20" },
  "closing-soon": { label: "Closing Soon", className: "bg-warning/10 text-warning border-warning/20" },
  "closed": { label: "Closed", className: "bg-muted text-muted-foreground border-muted" },
};

export function TenderCard({ title, organization, deadline, value, status, matchScore }: TenderCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <Card className="shadow-card transition-all duration-200 hover:shadow-card-hover animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground leading-tight">{title}</h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{organization}</span>
            </div>
          </div>
          <Badge variant="outline" className={cn("shrink-0", statusInfo.className)}>
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Deadline: {deadline}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{value}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Match Score</span>
            <span className="font-semibold text-primary">{matchScore}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div 
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${matchScore}%` }}
            />
          </div>
        </div>

        <Button variant="outline" className="w-full group">
          View Details
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
