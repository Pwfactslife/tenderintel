import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Download } from "lucide-react";

const tenders = [
  { id: 1, title: "IT Infrastructure Modernization", status: "eligible", score: 92 },
  { id: 2, title: "Cloud Migration Services", status: "conditional", score: 75 },
  { id: 3, title: "Cybersecurity Assessment", status: "not-eligible", score: 38 },
  { id: 4, title: "Data Analytics Platform", status: "processing", score: null },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  "eligible": { label: "Eligible", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  "conditional": { label: "Conditional Pass", className: "bg-amber-100 text-amber-800 border-amber-200" },
  "not-eligible": { label: "Not Eligible", className: "bg-red-100 text-red-800 border-red-200" },
  "processing": { label: "Processing", className: "bg-primary/10 text-primary border-primary/20" },
};

export default function MyTenders() {
  return (
    <AppLayout title="My Tenders">
      <div className="space-y-4">
        {tenders.map((tender) => (
          <Card key={tender.id} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground truncate">{tender.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tender.score !== null 
                        ? `Eligibility Score: ${tender.score}/100`
                        : "Analysis in progress..."
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                  <Badge variant="outline" className={statusConfig[tender.status].className}>
                    {statusConfig[tender.status].label}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
