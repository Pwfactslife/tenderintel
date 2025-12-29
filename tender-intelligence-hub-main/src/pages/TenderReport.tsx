import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, ExternalLink, Crown, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EligibilityGauge } from "@/components/tender-report/EligibilityGauge";
import { GapAnalysisTable, GapAnalysisItem } from "@/components/tender-report/GapAnalysisTable";
import { RiskPenaltySection, RiskItem } from "@/components/tender-report/RiskPenaltySection";
import { DocumentChecklist, DocumentItem } from "@/components/tender-report/DocumentChecklist";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Mock data for logged-in users - replace with actual data fetching
const mockTenderData = {
  id: "GEM/2025/B/4821567",
  title: "Supply of IT Equipment and Services for Government Office",
  score: 85,
  summary:
    "This tender matches your profile on Turnover and Experience. However, notice the strict EMD requirement of ₹2 Lakhs. You are highly likely to qualify technically.",
};

const mockGapAnalysis: GapAnalysisItem[] = [
  {
    criteria: "Annual Turnover (Avg 3 Years)",
    tenderAsk: "₹50 Lakhs",
    yourProfile: "₹1.2 Crores",
    status: "pass",
  },
  {
    criteria: "Prior Experience",
    tenderAsk: "3 Similar Projects",
    yourProfile: "5 Completed Projects",
    status: "pass",
  },
  {
    criteria: "EMD Amount",
    tenderAsk: "₹2,00,000",
    yourProfile: "Available",
    status: "warning",
  },
  {
    criteria: "GST Registration",
    tenderAsk: "Active GST",
    yourProfile: "Active",
    status: "pass",
  },
  {
    criteria: "MSME Certificate",
    tenderAsk: "Required",
    yourProfile: "Not Available",
    status: "fail",
  },
  {
    criteria: "Solvency Certificate",
    tenderAsk: "₹10 Lakhs",
    yourProfile: "₹15 Lakhs",
    status: "pass",
  },
];

const mockRisks: RiskItem[] = [
  {
    title: "Delay Penalty: 0.5% per week",
    description: "Late delivery will attract a penalty of 0.5% of contract value per week, capped at 10%.",
    severity: "high",
  },
  {
    title: "Manpower Shortage Fine",
    description: "Failure to maintain minimum staff levels will result in proportionate deduction.",
    severity: "medium",
  },
  {
    title: "Quality Rejection Clause",
    description: "Items failing quality check will be rejected at vendor's cost with no appeal.",
    severity: "high",
  },
  {
    title: "Payment Terms: 60 Days",
    description: "Payment will be released 60 days after successful inspection and acceptance.",
    severity: "low",
  },
];

const mockDocuments: DocumentItem[] = [
  { id: "gst", name: "GST Registration Certificate", required: true },
  { id: "pan", name: "PAN Card (Company)", required: true },
  { id: "solvency", name: "Solvency Certificate from Bank", required: true },
  { id: "affidavit", name: "Notarized Affidavit (No Blacklisting)", required: true },
  { id: "msme", name: "MSME/Udyam Registration", required: false },
  { id: "experience", name: "Work Order Copies (Experience Proof)", required: true },
  { id: "technical", name: "Technical Specification Compliance Sheet", required: true },
  { id: "emd", name: "EMD/Bid Security Document", required: true },
];

const TenderReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      
      setIsPremium(data?.plan === "business_pro");
    };
    
    if (user) {
      checkSubscription();
    }
  }, [user]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  const handleDownloadPDF = () => {
    if (!isPremium) {
      navigate("/subscription");
      return;
    }
    // TODO: Implement PDF download
    console.log("Downloading PDF report...");
  };

  const handleApplyOnGeM = () => {
    window.open("https://gem.gov.in", "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Premium Upgrade Banner for Free Users */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-2 px-4">
          <div className="container mx-auto flex items-center justify-center gap-3 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Unlock Risk Analysis, PDF Reports & Unlimited Checks</span>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => navigate("/subscription")}
              className="h-7 text-xs"
            >
              <Crown className="h-3 w-3 mr-1" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="shrink-0 mt-1"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <p className="text-sm text-muted-foreground font-mono">
                  {mockTenderData.id}
                </p>
                <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                  {mockTenderData.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-10 sm:ml-0">
              <Button 
                variant="outline" 
                onClick={handleDownloadPDF} 
                className="gap-2 relative"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download Report</span>
                <span className="sm:hidden">PDF</span>
                {!isPremium && (
                  <Badge className="absolute -top-2 -right-2 h-5 px-1 text-[10px] bg-amber-500 hover:bg-amber-500">
                    <Crown className="h-3 w-3" />
                  </Badge>
                )}
              </Button>
              <Button onClick={handleApplyOnGeM} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Apply on GeM</span>
                <span className="sm:hidden">Apply</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Section A: The Verdict */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex justify-center md:justify-start">
                <EligibilityGauge score={mockTenderData.score} />
              </div>
              <div className="flex-1 md:border-l md:pl-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Executive AI Summary
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {mockTenderData.summary}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section B: Gap Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Eligibility Gap Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <GapAnalysisTable items={mockGapAnalysis} />
          </CardContent>
        </Card>

        {/* Two Column Layout for Risk & Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section C: Risk & Penalty */}
          <RiskPenaltySection risks={mockRisks} isPremium={isPremium} />

          {/* Section D: Document Checklist */}
          <DocumentChecklist documents={mockDocuments} />
        </div>

        {/* Premium CTA for Free Users */}
        {!isPremium && (
          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-semibold mb-1">Upgrade to Business Pro</h3>
                  <p className="text-muted-foreground text-sm">
                    Get unlimited tender analysis, detailed risk detection, penalty clause alerts, 
                    and downloadable PDF reports. Win more contracts with AI-powered insights.
                  </p>
                </div>
                <Button onClick={() => navigate("/subscription")} size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Upgrade Now - ₹999/mo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TenderReport;
