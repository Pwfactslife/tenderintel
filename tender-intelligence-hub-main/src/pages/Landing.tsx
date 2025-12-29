import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, FileText, Shield, Zap, CheckCircle, ArrowRight, Menu, X, Cloud, Brain, ClipboardCheck, Landmark, Building, Award, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthModal } from "@/components/landing/AuthModal";
import { cn } from "@/lib/utils";

export default function Landing() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      startProcessing(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      startProcessing(file);
    }
  };

  const startProcessing = (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowAuthModal(true);
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const howItWorks = [
    {
      icon: Cloud,
      title: "Upload PDF",
      description: "Drop your tender document",
    },
    {
      icon: Brain,
      title: "AI Analyzes",
      description: "Extracts all requirements",
    },
    {
      icon: ClipboardCheck,
      title: "Get Report",
      description: "Instant eligibility verdict",
    },
  ];

  const trustLogos = [
    { icon: Landmark, name: "Government of India" },
    { icon: Building, name: "GeM Portal" },
    { icon: Award, name: "MSME" },
    { icon: Rocket, name: "Startup India" },
  ];

  const features = [
    {
      icon: Zap,
      title: "Instant Gap Analysis",
      description: "AI extracts eligibility criteria from tenders and compares against your company profile in seconds.",
    },
    {
      icon: Shield,
      title: "Penalty Detection",
      description: "Identify hidden penalty clauses and risk factors before you commit to bidding.",
    },
    {
      icon: CheckCircle,
      title: "Eligibility Scoring",
      description: "Get a clear Pass/Fail/Conditional verdict with actionable recommendations.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">TenderIntel</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How it Works
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" className="text-foreground hover:bg-muted/20" onClick={() => navigate("/auth")}>
                Login
              </Button>
              <Button 
                className="bg-cta hover:bg-cta/90 text-cta-foreground font-semibold"
                onClick={() => document.getElementById("upload-hero")?.scrollIntoView({ behavior: "smooth" })}
              >
                Start Free Check
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-4 border-t border-border">
              <a href="#how-it-works" className="block text-muted-foreground hover:text-foreground">
                How it Works
              </a>
              <a href="#pricing" className="block text-muted-foreground hover:text-foreground">
                Pricing
              </a>
              <a href="#contact" className="block text-muted-foreground hover:text-foreground">
                Contact
              </a>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/auth")}>
                  Login
                </Button>
                <Button className="flex-1">Start Free</Button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section with Gradient */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-navy-gradient-start via-navy-light to-navy-gradient-end overflow-hidden" id="upload-hero">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Win Government
                <br />
                <span className="bg-gradient-to-r from-sky-300 to-cyan-200 bg-clip-text text-transparent">Tenders with AI</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/80 max-w-xl mb-8">
                Upload your GeM tender document and instantly know if you're eligible. 
                Our AI analyzes requirements and matches them against your company profile.
              </p>
              
              {/* Upload Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className={cn(
                  "relative rounded-2xl border-2 border-dashed p-8 sm:p-10 transition-all duration-300 backdrop-blur-sm",
                  isProcessing
                    ? "border-white/60 bg-white/10"
                    : "border-white/30 hover:border-white/60 hover:bg-white/10"
                )}
              >
                {!isProcessing ? (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white">
                          Drop your Tender PDF here
                        </p>
                        <p className="text-white/60 mt-1">
                          or click to browse (Max 20MB)
                        </p>
                      </div>
                      <Button className="mt-4 gap-2 bg-cta hover:bg-cta/90 text-cta-foreground font-semibold text-lg px-8 py-6">
                        <Upload className="h-5 w-5" />
                        Start Free Check
                      </Button>
                    </div>
                  </label>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="h-8 w-8 text-white" />
                      <span className="font-medium text-white">{uploadedFile?.name}</span>
                    </div>
                    <div className="space-y-2">
                      <Progress value={progress} className="h-3 bg-white/20" />
                      <p className="text-sm text-white/70">
                        {progress < 30 && "Extracting tender requirements..."}
                        {progress >= 30 && progress < 60 && "Analyzing eligibility criteria..."}
                        {progress >= 60 && progress < 90 && "Comparing with company profiles..."}
                        {progress >= 90 && "Generating eligibility report..."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Dashboard Mockup */}
            <div className="hidden lg:block relative">
              <div className="relative transform perspective-1000 rotate-y-[-5deg] rotate-x-[5deg]">
                {/* Glass Card Dashboard Mockup */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                  {/* Fake Dashboard Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="h-3 w-32 bg-white/40 rounded" />
                      <div className="h-2 w-24 bg-white/20 rounded mt-2" />
                    </div>
                  </div>
                  
                  {/* Fake Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold text-emerald-300">12</div>
                      <div className="text-xs text-white/60">Eligible</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold text-amber-300">5</div>
                      <div className="text-xs text-white/60">Pending</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold text-red-300">2</div>
                      <div className="text-xs text-white/60">Not Eligible</div>
                    </div>
                  </div>
                  
                  {/* Fake Table Rows */}
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                        <div className="h-8 w-8 rounded bg-white/10" />
                        <div className="flex-1 space-y-1">
                          <div className="h-2 w-3/4 bg-white/20 rounded" />
                          <div className="h-2 w-1/2 bg-white/10 rounded" />
                        </div>
                        <div className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          i === 1 ? "bg-emerald-500/30 text-emerald-200" : i === 2 ? "bg-amber-500/30 text-amber-200" : "bg-white/10 text-white/60"
                        )}>
                          {i === 1 ? "Eligible" : i === 2 ? "Pending" : "Checking"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Decorative glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-3xl blur-2xl -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip - Logo Carousel */}
      <section className="py-12 bg-muted/50 border-y border-border overflow-hidden">
        <div className="container mx-auto px-4">
          <p className="text-sm text-muted-foreground text-center mb-8">Trusted for bidding on government portals</p>
          
          <div className="relative">
            <div className="flex animate-scroll-left">
              {/* Duplicate logos for seamless scroll */}
              {[...trustLogos, ...trustLogos, ...trustLogos, ...trustLogos].map((logo, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-8 py-4 mx-4 rounded-xl bg-background border border-border opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <logo.icon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Horizontal Steps */}
      <section className="py-20 bg-background" id="how-it-works">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How TenderIntel Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From upload to insight in under 60 seconds
            </p>
          </div>

          {/* Horizontal Steps */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 max-w-4xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={step.title} className="flex items-center">
                {/* Step Card */}
                <div className="relative bg-card rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all border border-border text-center min-w-[200px]">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </div>
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto animate-pulse-slow">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                
                {/* Arrow between steps */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:flex items-center px-4">
                    <ArrowRight className="h-8 w-8 text-primary/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why TenderIntel?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Save time, reduce risk, win more contracts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative bg-card rounded-xl p-8 shadow-card hover:shadow-card-hover transition-shadow border border-border"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20" id="pricing">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-card rounded-xl p-8 border border-border shadow-card">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <p className="text-muted-foreground mb-6">Perfect for trying out</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-success" />
                  3 tender checks per month
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Basic eligibility status
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Gap analysis summary
                </li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
                Get Started Free
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="bg-primary rounded-xl p-8 text-primary-foreground relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-warning text-warning-foreground text-xs font-semibold px-2 py-1 rounded">
                POPULAR
              </div>
              <h3 className="text-xl font-semibold mb-2">Business Pro</h3>
              <p className="text-primary-foreground/70 mb-6">For serious bidders</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹999</span>
                <span className="text-primary-foreground/70">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Unlimited tender checks
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Detailed analysis reports
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Penalty clause detection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Risk assessment
                </li>
              </ul>
              <Button variant="secondary" className="w-full" onClick={() => navigate("/auth")}>
                Start 7-Day Trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-12" id="contact">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <FileText className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">TenderIntel</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                AI-powered tender eligibility analysis for government contractors.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#how-it-works" className="hover:text-foreground">How it Works</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy-policy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link to="/refund-policy" className="hover:text-foreground">Refund Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>support@tenderintel.com</li>
                <li><Link to="/contact" className="hover:text-foreground">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} TenderIntel. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <AuthModal onClose={() => setShowAuthModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
