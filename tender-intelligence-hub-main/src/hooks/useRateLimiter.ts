import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DAILY_LIMIT = 50;

export function useRateLimiter() {
  const [isChecking, setIsChecking] = useState(false);

  const checkAndIncrementUsage = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("Please sign in to upload documents");
        return false;
      }

      const userId = session.user.id;
      const today = new Date().toISOString().split('T')[0];

      // Fetch current usage
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('daily_usage_count, last_usage_date')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        toast.error("Unable to verify usage limits. Please try again.");
        return false;
      }

      let currentCount = profile?.daily_usage_count || 0;
      const lastDate = profile?.last_usage_date;

      // Reset count if it's a new day
      if (lastDate !== today) {
        currentCount = 0;
      }

      // Check if over limit
      if (currentCount >= DAILY_LIMIT) {
        toast.error(
          "Daily limit reached. To ensure quality for all users, we limit analysis to 50 tenders/day under our Fair Usage Policy.",
          { duration: 6000 }
        );
        return false;
      }

      // Increment usage count
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          daily_usage_count: currentCount + 1,
          last_usage_date: today,
        })
        .eq('id', userId);

      if (updateError) {
        console.error("Error updating usage:", updateError);
        toast.error("Unable to update usage. Please try again.");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Rate limiter error:", error);
      toast.error("An error occurred. Please try again.");
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { checkAndIncrementUsage, isChecking };
}
