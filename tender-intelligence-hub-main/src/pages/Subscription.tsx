import { useState, useEffect } from "react";
import { Check, Star, HelpCircle, Loader2, Crown, Info, Shield } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: () => void) => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  expires_at: string | null;
}

const starterFeatures = [
  "3 Checks/Month",
  "Basic Pass/Fail Status",
  "Profile Storage",
];

const proFeatures = [
  { text: "Unlimited Checks", hasTooltip: true, tooltip: "Subject to Fair Usage Policy (FUP) of 50 tenders/day to prevent automated abuse." },
  { text: "Detailed Gap Analysis", hasTooltip: false },
  { text: "Hidden Penalty Detection", hasTooltip: false },
  { text: "Document Checklist Generator", hasTooltip: false },
];

const faqs = [
  {
    question: "How does the billing work?",
    answer: "Business Pro is billed monthly at ₹999. Your subscription renews automatically each month. You can cancel anytime from your account settings, and you will retain access until the end of your billing period.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. Once cancelled, you will continue to have access to Pro features until the end of your current billing cycle. After that, your account will automatically switch to the Starter plan.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards including Visa, Mastercard, and RuPay. We also support UPI payments and net banking for Indian customers.",
  },
  {
    question: "Is there a refund policy?",
    answer: "We offer a 7-day money-back guarantee. If you are not satisfied with Business Pro within the first 7 days, contact our support team for a full refund.",
  },
  {
    question: "What happens to my data if I downgrade?",
    answer: "Your company profile and all analysis history will be preserved. However, you will lose access to detailed reports and premium features. You can upgrade again anytime to regain access.",
  },
];

export default function Subscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [user, setUser] = useState<{ email?: string; name?: string; id?: string } | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    // Get current user and subscription
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name,
        });

        // Fetch subscription
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (subData) {
          setSubscription(subData);
        }
      }
      setIsLoadingSubscription(false);
    };

    fetchData();

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const verifyPayment = async (response: RazorpayResponse) => {
    const { data, error } = await supabase.functions.invoke("verify-razorpay-payment", {
      body: {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        amount: 999,
        plan: "business_pro",
      },
    });

    if (error) {
      console.error("Verification error:", error);
      toast.error("Payment verification failed. Please contact support.");
      return;
    }

    if (data?.success) {
      setSubscription(data.subscription);
      toast.success("Payment verified! Welcome to Business Pro!");
    } else {
      toast.error("Payment verification failed. Please contact support.");
    }
  };

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to upgrade your plan");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          amount: 999,
          currency: "INR",
          receipt: `pro_${session.user.id}_${Date.now()}`,
          notes: {
            plan: "business_pro",
            user_id: session.user.id,
          },
        },
      });

      if (error) {
        console.error("Order creation error:", error);
        toast.error("Failed to create order. Please try again.");
        return;
      }

      if (!data?.orderId || !data?.keyId) {
        toast.error("Invalid order response. Please try again.");
        return;
      }

      const options: RazorpayOptions = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "TenderIntel",
        description: "Business Pro Subscription",
        order_id: data.orderId,
        handler: async (response: RazorpayResponse) => {
          console.log("Payment successful, verifying...");
          await verifyPayment(response);
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#6366f1",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
      });
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isPro = subscription?.plan === 'business_pro' && subscription?.status === 'active';
  const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null;
  const isExpired = expiresAt && expiresAt < new Date();

  return (
    <AppLayout title="Subscription">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground">Choose Your Plan</h2>
          <p className="text-muted-foreground mt-2">
            Select the plan that best fits your tender analysis needs
          </p>
        </div>

        {/* Current Plan Banner */}
        {isPro && !isExpired && (
          <Card className="bg-primary/5 border-primary/20 max-w-4xl mx-auto">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">You're on Business Pro!</p>
                  <p className="text-sm text-muted-foreground">
                    Renews on {expiresAt?.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <Badge className="bg-primary text-primary-foreground">Active</Badge>
            </CardContent>
          </Card>
        )}

        {/* Pricing Cards */}
        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto px-4 sm:px-0">
          {/* Starter Plan */}
          <Card className={`shadow-card relative ${!isPro || isExpired ? 'border-2 border-primary' : ''}`}>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">Starter</CardTitle>
              <p className="text-sm text-muted-foreground">For individual contractors</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">₹0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {starterFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" disabled>
                {!isPro || isExpired ? 'Current Plan' : 'Free Plan'}
              </Button>
            </CardContent>
          </Card>

          {/* Business Pro Plan */}
          <Card className={`shadow-card relative ${isPro && !isExpired ? 'border-2 border-primary' : ''}`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground gap-1">
                <Star className="h-3 w-3" />
                Best Value
              </Badge>
            </div>
            <CardHeader className="text-center pb-2 pt-6">
              <CardTitle className="text-xl">Business Pro</CardTitle>
              <p className="text-sm text-muted-foreground">Recommended for Contractors</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">₹999</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <TooltipProvider>
                <ul className="space-y-3">
                  {proFeatures.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-success shrink-0" />
                      <span>{feature.text}</span>
                      {feature.hasTooltip && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{feature.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </li>
                  ))}
                </ul>
              </TooltipProvider>
              {isLoadingSubscription ? (
                <Button className="w-full" disabled>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </Button>
              ) : isPro && !isExpired ? (
                <Button variant="outline" className="w-full" disabled>
                  <Crown className="h-4 w-4 mr-2" />
                  Current Plan
                </Button>
              ) : (
                <Button className="w-full" onClick={handleUpgrade} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isExpired ? (
                    "Renew Now"
                  ) : (
                    "Upgrade Now"
                  )}
                </Button>
              )}
              
              {/* Privacy Footer */}
              <div className="flex items-center gap-2 pt-3 border-t border-border mt-4">
                <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  PDFs are processed securely and auto-deleted after analysis for your privacy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="shadow-card max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HelpCircle className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
