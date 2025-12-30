import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Download, Loader2, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Define the interface for the Tender data expected from backend
interface Tender {
  tender_id: string;
  eligibility_score: number | null;
  status: string;
  created_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Helper to normalize backend status to UI config keys
const getStatusConfig = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized.includes("not")) return { label: "Not Eligible", className: "bg-destructive/10 text-destructive border-destructive/20", icon: null };
  if (normalized.includes("conditional")) return { label: "Conditional", className: "bg-amber-100 text-amber-800 border-amber-200", icon: null };
  if (normalized.includes("processing")) return { label: "Processing", className: "bg-primary/10 text-primary border-primary/20", icon: Clock };

  // Default to Eligible if none of above, or explicit 'eligible'
  return { label: "Eligible", className: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: null };
};

export default function MyTenders() {
  const { user } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTenders() {
      if (!user) return;

      try {
        const response = await fetch(`${API_URL}/tenders/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setTenders(data);
        } else {
          console.error("Failed to fetch tenders");
        }
      } catch (error) {
        console.error("Error fetching tenders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTenders();
  }, [user]);

  return (
    <AppLayout title="My Tenders">
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tenders.length === 0 ? (
          <Card className="shadow-card border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Tenders Analyzed yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Upload your tender documents to get an instant eligibility analysis and compliance report.
              </p>
              <Button asChild>
                <Link to="/dashboard">Upload one from Dashboard!</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          tenders.map((tender, index) => {
            const statusInfo = getStatusConfig(tender.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={`${tender.tender_id}-${index}`} className="shadow-card hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-foreground truncate max-w-[200px] sm:max-w-md" title={tender.tender_id}>
                          {tender.tender_id}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {tender.eligibility_score !== null
                              ? `Score: ${tender.eligibility_score}/100`
                              : "Analysis Pending..."
                            }
                          </span>
                          <span>•</span>
                          <span>{new Date(tender.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                      <Badge variant="outline" className={cn("flex items-center gap-1.5", statusInfo.className)}>
                        {StatusIcon && <StatusIcon className="h-3 w-3" />}
                        {statusInfo.label}
                      </Badge>

                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={statusInfo.label === "Processing"}
                          title="Download Report"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}
