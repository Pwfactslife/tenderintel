import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">TenderIntel</span>
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Refund Policy</h1>
        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Credit-Based Service</h2>
            <p>
              TenderIntel operates on a credit-based system. Each tender analysis consumes one credit from your account balance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. No Refunds on Used Credits</h2>
            <p className="font-semibold text-foreground">
              Credits that have been used for tender analysis are non-refundable.
            </p>
            <p className="mt-2">
              Once you upload a tender document and receive an analysis, the credit consumed for that analysis cannot be refunded or restored.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Subscription Cancellation</h2>
            <p>
              You may cancel your Business Pro subscription at any time. Upon cancellation:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Your subscription will remain active until the end of the current billing period</li>
              <li>No prorated refunds will be issued for partial months</li>
              <li>Any unused credits will expire at the end of your billing period</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Exceptions</h2>
            <p>
              Refunds may be considered in the following exceptional circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Technical failures on our end that prevented analysis completion</li>
              <li>Duplicate charges due to payment processing errors</li>
              <li>Service unavailability for extended periods (more than 24 hours)</li>
            </ul>
            <p className="mt-4">
              To request a refund for any of the above reasons, please contact us at support@tenderintel.com with your order details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Processing Time</h2>
            <p>
              Approved refunds will be processed within 5-7 business days. The refund will be credited to the original payment method used during purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Contact</h2>
            <p>
              For refund requests or questions about this policy, contact us at:
            </p>
            <p className="mt-2">
              Email: support@tenderintel.com
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
