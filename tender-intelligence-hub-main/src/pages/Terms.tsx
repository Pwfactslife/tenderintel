import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
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
        <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using TenderIntel's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Service Description</h2>
            <p>
              TenderIntel provides AI-powered analysis of government tender documents to help businesses assess their eligibility. Our service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Tender document parsing and requirement extraction</li>
              <li>Eligibility assessment based on company profiles</li>
              <li>Gap analysis and recommendations</li>
              <li>Risk assessment for premium users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Important Disclaimer</h2>
            <p className="font-semibold text-foreground">
              TenderIntel is an analysis tool and does not guarantee tender success.
            </p>
            <p className="mt-2">
              The analysis provided by our service is for informational purposes only. We do not guarantee the accuracy of tender requirement extraction or eligibility assessments. Users should independently verify all requirements before submitting bids. We are not responsible for any decisions made based on our analysis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide accurate company profile information</li>
              <li>Use the service only for lawful purposes</li>
              <li>Not upload malicious files or content</li>
              <li>Maintain the confidentiality of your account credentials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Subscription and Payments</h2>
            <p>
              Premium features require a paid subscription. Payments are processed securely through Razorpay. Subscription fees are billed monthly and are non-refundable except as stated in our Refund Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
            <p>
              The TenderIntel service, including its AI models, algorithms, and user interface, is protected by intellectual property laws. You retain ownership of any documents you upload.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, TenderIntel shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Contact</h2>
            <p>
              For questions about these Terms, contact us at support@tenderintel.com
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
