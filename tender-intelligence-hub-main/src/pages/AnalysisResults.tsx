import { CheckCircle, XCircle, Lock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const gapAnalysisData = [
  {
    criteria: "Avg Turnover",
    requirement: "₹50 Lakhs",
    status: "₹1.2 Cr",
    passed: true,
  },
  {
    criteria: "Experience",
    requirement: "3 Hospitals",
    status: "1 Hospital",
    passed: false,
  },
  {
    criteria: "Net Worth",
    requirement: "₹25 Lakhs",
    status: "₹45 Lakhs",
    passed: true,
  },
  {
    criteria: "ISO Certification",
    requirement: "ISO 9001:2015",
    status: "Valid till 2026",
    passed: true,
  },
  {
    criteria: "EMD Amount",
    requirement: "₹2 Lakhs",
    status: "Pending",
    passed: false,
  },
];

export default function AnalysisResults() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Analysis Results">
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" className="gap-2" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Section 1: The Verdict */}
        <Card className="shadow-card overflow-hidden">
          <div className="bg-gradient-to-r from-warning/10 via-warning/5 to-transparent p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-medium text-muted-foreground">Eligibility Score</h2>
                  <Badge className="bg-warning/20 text-warning border-warning/30 hover:bg-warning/20">
                    Conditional Pass
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold text-foreground">75</span>
                  <span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <p className="text-muted-foreground max-w-md">
                  You meet the Turnover criteria, but are missing one key document.
                </p>
              </div>

              {/* Score Visual */}
              <div className="relative h-32 w-32 shrink-0">
                <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="hsl(var(--warning))"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${75 * 2.51} ${100 * 2.51}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">75%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Gap Analysis Table */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Gap Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">
              Comparison of tender requirements vs your company profile
            </p>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Criteria</TableHead>
                    <TableHead>Tender Requirement</TableHead>
                    <TableHead>Your Status</TableHead>
                    <TableHead className="w-[80px] text-center">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gapAnalysisData.map((row) => (
                    <TableRow key={row.criteria}>
                      <TableCell className="font-medium">{row.criteria}</TableCell>
                      <TableCell className="text-muted-foreground">{row.requirement}</TableCell>
                      <TableCell
                        className={cn(
                          "font-medium",
                          row.passed ? "text-success" : "text-destructive"
                        )}
                      >
                        {row.status}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.passed ? (
                          <CheckCircle className="h-5 w-5 text-success inline-block" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive inline-block" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {gapAnalysisData.map((row) => (
                <div key={row.criteria} className="rounded-lg border border-border bg-surface-subtle p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-medium text-foreground">{row.criteria}</span>
                    {row.passed ? (
                      <CheckCircle className="h-5 w-5 text-success shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive shrink-0" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Required</p>
                      <p className="text-foreground">{row.requirement}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Your Status</p>
                      <p className={cn("font-medium", row.passed ? "text-success" : "text-destructive")}>
                        {row.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Freemium Lock */}
        <Card className="shadow-card overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">
              Detailed Risk Assessment & Penalty Clauses
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {/* Blurred Content */}
            <div className="blur-sm select-none pointer-events-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                The tender document specifies a liquidated damages clause of 0.5% per week of delay, 
                capped at 10% of the total contract value. Based on your previous project completion 
                timelines, there is a moderate risk of incurring penalties if resource allocation 
                is not optimized during peak delivery phases.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Competitor analysis indicates that 3 other bidders have submitted proposals for 
                this tender. Two competitors have stronger hospital experience credentials, while 
                one has a lower turnover but holds specialized healthcare certifications that may 
                be weighted favorably in technical evaluation.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Risk mitigation strategies include: partnering with an experienced healthcare 
                services provider to strengthen your consortium bid, obtaining additional 
                certifications before the bid deadline, and preparing comprehensive documentation 
                of your existing hospital project to maximize scoring on experience criteria.
              </p>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-4 text-center p-6">
                <div className="rounded-full bg-primary/10 p-4">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Premium Content</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Unlock the full report to access penalty clauses, competitor analysis, and risk mitigation strategies.
                  </p>
                </div>
                <Button className="gap-2 mt-2">
                  <Lock className="h-4 w-4" />
                  Unlock Premium Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
