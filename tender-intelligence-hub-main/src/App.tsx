import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import CompanyProfile from "./pages/CompanyProfile";
import MyTenders from "./pages/MyTenders";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";
import AnalysisResults from "./pages/AnalysisResults";
import TenderReport from "./pages/TenderReport";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import RefundPolicy from "./pages/RefundPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/company-profile" element={<CompanyProfile />} />
            <Route path="/my-tenders" element={<MyTenders />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analysis-results" element={<AnalysisResults />} />
            <Route path="/tender/:id" element={<TenderReport />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
