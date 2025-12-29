import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p>
              TenderIntel ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our tender analysis service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Account information (name, email address, company name)</li>
              <li>Company profile data (turnover, certifications, work orders)</li>
              <li>Tender documents you upload for analysis</li>
              <li>Payment information (processed securely via Razorpay)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide and maintain our tender analysis service</li>
              <li>Process your transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Improve and optimize our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Your tender documents are encrypted during transmission and storage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Third-Party Services</h2>
            <p>
              We use third-party services including Supabase for data storage and Razorpay for payment processing. These services have their own privacy policies governing the use of your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
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
