import { useEffect, useState } from "react";
import { FileText, CheckCircle, Clock, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { UploadZone } from "@/components/dashboard/UploadZone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  
  // Real data - no uploads yet for new users
  const recentActivity: never[] = [];

  const stats = [
    { title: "Total Tenders Analyzed", value: 0, icon: FileText },
    { title: "Eligible Opportunities", value: 0, icon: CheckCircle },
    { title: "Pending Actions", value: 0, icon: Clock },
  ];

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

  if (isLoading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Premium Upgrade Banner for Free Users */}
        {!isPremium && (
          <Card className="bg-gradient-to-r from-primary/10 to-amber-500/10 border-primary/20">
            <CardContent className="py-3 px-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Crown className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Unlock Unlimited Tender Analysis</p>
                    <p className="text-xs text-muted-foreground">Get risk detection, penalty alerts & PDF reports</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => navigate("/subscription")} className="gap-2">
                  <Sparkles className="h-3 w-3" />
                  Upgrade to Pro
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Row - Horizontal scroll on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-4 md:grid md:grid-cols-3 min-w-max md:min-w-0">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                className="w-56 md:w-auto shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Upload Zone - Main Action Area */}
        <UploadZone />

        {/* Recent Activity - Empty State */}
        <Card className="shadow-card">
          <CardContent className="py-8">
            <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No tenders analyzed yet. Upload a PDF above to get started.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
