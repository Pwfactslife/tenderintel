import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [signUpData, setSignUpData] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
  });
  
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  // Check if user is already logged in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const redirectUrl = `${window.location.origin}/company-profile`;
    
    const { data, error } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: signUpData.fullName,
          company_name: signUpData.companyName,
        }
      }
    });
    
    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please sign in instead.");
      } else {
        toast.error(error.message);
      }
      setIsLoading(false);
      return;
    }
    
    if (data.user && !data.session) {
      toast.success("Account created! Please check your email to confirm your account.");
    } else if (data.session) {
      toast.success("Account created successfully!");
      navigate("/company-profile");
    }
    
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: signInData.email,
      password: signInData.password,
    });
    
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.error(error.message);
      }
      setIsLoading(false);
      return;
    }
    
    toast.success("Signed in successfully!");
    navigate("/company-profile");
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/company-profile`,
      }
    });
    
    if (error) {
      toast.error(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!signInData.email) {
      toast.error("Please enter your email address first.");
      return;
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(signInData.email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    
    if (error) {
      toast.error(error.message);
      return;
    }
    
    toast.success("Password reset email sent! Check your inbox.");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Testimonial */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy opacity-90" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="max-w-lg">
            <div className="mb-8">
              <div className="h-12 w-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center mb-6">
                <svg
                  className="h-6 w-6 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl xl:text-4xl font-bold text-primary-foreground mb-2">
                TenderIntel
              </h1>
              <p className="text-primary-foreground/60 text-lg">
                AI-Powered Tender Eligibility Analysis
              </p>
            </div>

            <blockquote className="border-l-4 border-primary-foreground/20 pl-6 py-2">
              <p className="text-xl xl:text-2xl text-primary-foreground/90 font-medium leading-relaxed mb-6">
                "TenderIntel saved us countless hours of manual document review. We now bid on 3x more tenders with confidence, knowing exactly where we stand before submission."
              </p>
              <footer className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary-foreground">RS</span>
                </div>
                <div>
                  <p className="text-primary-foreground font-semibold">Rajesh Sharma</p>
                  <p className="text-primary-foreground/60 text-sm">
                    Director, Sharma Constructions Pvt Ltd
                  </p>
                </div>
              </footer>
            </blockquote>

            <div className="mt-12 flex items-center gap-8 text-primary-foreground/40 text-sm">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>500+ Companies</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>10,000+ Tenders Analyzed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">TenderIntel</h1>
            <p className="text-muted-foreground text-sm">AI-Powered Tender Analysis</p>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-foreground">Welcome</h2>
            <p className="text-muted-foreground">Sign in to your account or create a new one</p>
          </div>

          {/* Google Sign In */}
          <Button
            variant="outline"
            className="w-full gap-3 h-12 border-border shadow-sm hover:shadow-md transition-shadow"
            onClick={handleGoogleSignIn}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Work Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@company.com"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                      onClick={handleForgotPassword}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-12" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Work Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@company.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Your Company Pvt Ltd"
                    value={signUpData.companyName}
                    onChange={(e) => setSignUpData({ ...signUpData, companyName: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-12" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a 
              href="/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Terms of Service
            </a>
            {" "}and{" "}
            <a 
              href="/privacy-policy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
