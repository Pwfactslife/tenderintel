import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, Building2, DollarSign, Briefcase, Paperclip, AlertCircle, Loader2, Lock, Shield } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface WorkOrder {
  id: string;
  clientName: string;
  value: string;
  completionYear: string;
  projectType: string;
}

interface StatutoryCompliance {
  hasGst: boolean;
  gstNumber: string;
  hasUdyam: boolean;
  udyamNumber: string;
  hasStartupIndia: boolean;
  startupIndiaNumber: string;
  hasEpf: boolean;
  epfNumber: string;
  hasEsic: boolean;
  esicNumber: string;
  hasPsara: boolean;
  psaraNumber: string;
  hasIso: boolean;
  isoNumber: string;
  hasPan: boolean;
  panNumber: string;
}

interface ProfileFormData {
  companyName: string;
  incorporationDate: string;
  legalStatus: string;
  startupRegNo: string;
  msmeUdyamNo: string;
  turnover2425: string;
  turnover2324: string;
  turnover2223: string;
  netWorth: string;
  solvencyCertValue: string;
  workOrders: WorkOrder[];
  statutory: StatutoryCompliance;
}

const initialStatutory: StatutoryCompliance = {
  hasGst: false,
  gstNumber: "",
  hasUdyam: false,
  udyamNumber: "",
  hasStartupIndia: false,
  startupIndiaNumber: "",
  hasEpf: false,
  epfNumber: "",
  hasEsic: false,
  esicNumber: "",
  hasPsara: false,
  psaraNumber: "",
  hasIso: false,
  isoNumber: "",
  hasPan: false,
  panNumber: "",
};

const initialFormData: ProfileFormData = {
  companyName: "",
  incorporationDate: "",
  legalStatus: "",
  startupRegNo: "",
  msmeUdyamNo: "",
  turnover2425: "",
  turnover2324: "",
  turnover2223: "",
  netWorth: "",
  solvencyCertValue: "",
  workOrders: [{ id: "1", clientName: "", value: "", completionYear: "", projectType: "" }],
  statutory: initialStatutory,
};

// Statutory compliance items configuration
const statutoryItems = [
  { key: "hasGst", numberKey: "gstNumber", label: "GST Registration", mandatory: true, description: "Goods and Services Tax" },
  { key: "hasUdyam", numberKey: "udyamNumber", label: "UDYAM / MSME Registration", mandatory: false, description: "For EMD Exemption" },
  { key: "hasStartupIndia", numberKey: "startupIndiaNumber", label: "Startup India (DPIIT) Certificate", mandatory: false, description: "Department for Promotion of Industry" },
  { key: "hasEpf", numberKey: "epfNumber", label: "EPF Registration", mandatory: false, description: "Employee Provident Fund - Critical for Manpower/Security tenders" },
  { key: "hasEsic", numberKey: "esicNumber", label: "ESIC Registration", mandatory: false, description: "Employee State Insurance - Critical for Manpower/Security tenders" },
  { key: "hasPsara", numberKey: "psaraNumber", label: "PSARA License", mandatory: false, description: "Private Security Agencies Regulation Act" },
  { key: "hasIso", numberKey: "isoNumber", label: "ISO 9001 Certification", mandatory: false, description: "Quality Management System" },
  { key: "hasPan", numberKey: "panNumber", label: "PAN Card (Company)", mandatory: false, description: "Permanent Account Number" },
] as const;

export default function CompanyProfile() {
  const navigate = useNavigate();
  const { user, isProfileComplete, refreshProfile, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error loading profile:", error);
          toast.error("Failed to load profile data");
          setIsLoading(false);
          return;
        }

        if (data) {
          // Parse work_orders from JSON, with type safety
          let workOrders: WorkOrder[] = [{ id: "1", clientName: "", value: "", completionYear: "", projectType: "" }];
          
          if (data.work_orders && Array.isArray(data.work_orders) && data.work_orders.length > 0) {
            workOrders = (data.work_orders as unknown as WorkOrder[]);
          }

          setFormData({
            companyName: data.company_name || "",
            incorporationDate: data.incorporation_date || "",
            legalStatus: data.legal_status || "",
            startupRegNo: data.startup_reg_no || "",
            msmeUdyamNo: data.msme_udyam_no || "",
            turnover2425: data.turnover_2425?.toString() || "",
            turnover2324: data.turnover_2324?.toString() || "",
            turnover2223: data.turnover_2223?.toString() || "",
            netWorth: data.net_worth?.toString() || "",
            solvencyCertValue: data.solvency_cert_value?.toString() || "",
            workOrders,
            statutory: {
              hasGst: data.has_gst || false,
              gstNumber: data.gst_number || "",
              hasUdyam: data.has_udyam || false,
              udyamNumber: data.udyam_number || "",
              hasStartupIndia: data.has_startup_india || false,
              startupIndiaNumber: data.startup_india_number || "",
              hasEpf: data.has_epf || false,
              epfNumber: data.epf_number || "",
              hasEsic: data.has_esic || false,
              esicNumber: data.esic_number || "",
              hasPsara: data.has_psara || false,
              psaraNumber: data.psara_number || "",
              hasIso: data.has_iso || false,
              isoNumber: data.iso_number || "",
              hasPan: data.has_pan || false,
              panNumber: data.pan_number || "",
            },
          });
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      loadProfile();
    }
  }, [user?.id, authLoading]);

  // Calculate average turnover
  const averageTurnover = useMemo(() => {
    const values = [formData.turnover2425, formData.turnover2324, formData.turnover2223]
      .map(v => parseFloat(v.replace(/,/g, "")) || 0)
      .filter(v => v > 0);
    
    if (values.length === 0) return "0.00";
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [formData.turnover2425, formData.turnover2324, formData.turnover2223]);

  const updateField = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const updateStatutory = (field: keyof StatutoryCompliance, value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      statutory: { ...prev.statutory, [field]: value },
    }));
  };

  const addWorkOrder = () => {
    setFormData(prev => ({
      ...prev,
      workOrders: [
        ...prev.workOrders,
        { id: Date.now().toString(), clientName: "", value: "", completionYear: "", projectType: "" },
      ],
    }));
  };

  const removeWorkOrder = (id: string) => {
    if (formData.workOrders.length > 1) {
      setFormData(prev => ({
        ...prev,
        workOrders: prev.workOrders.filter((wo) => wo.id !== id),
      }));
    }
  };

  const updateWorkOrder = (id: string, field: keyof WorkOrder, value: string) => {
    setFormData(prev => ({
      ...prev,
      workOrders: prev.workOrders.map((wo) => (wo.id === id ? { ...wo, [field]: value } : wo)),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }
    if (!formData.legalStatus) {
      newErrors.legalStatus = "Legal status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseNumber = (value: string): number | null => {
    const cleaned = value.replace(/,/g, "").trim();
    if (!cleaned) return null;
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user?.id) {
      toast.error("You must be logged in to save your profile");
      navigate("/auth");
      return;
    }

    setIsSaving(true);

    try {
      // Cast work_orders to Json type for Supabase
      const workOrdersJson = JSON.parse(JSON.stringify(formData.workOrders)) as Json;
      
      const updateData = {
        company_name: formData.companyName.trim(),
        incorporation_date: formData.incorporationDate || null,
        legal_status: formData.legalStatus || null,
        startup_reg_no: formData.startupRegNo.trim() || null,
        msme_udyam_no: formData.msmeUdyamNo.trim() || null,
        turnover_2425: parseNumber(formData.turnover2425),
        turnover_2324: parseNumber(formData.turnover2324),
        turnover_2223: parseNumber(formData.turnover2223),
        net_worth: parseNumber(formData.netWorth),
        solvency_cert_value: parseNumber(formData.solvencyCertValue),
        work_orders: workOrdersJson,
        // Statutory compliance fields
        has_gst: formData.statutory.hasGst,
        gst_number: formData.statutory.gstNumber.trim() || null,
        has_udyam: formData.statutory.hasUdyam,
        udyam_number: formData.statutory.udyamNumber.trim() || null,
        has_startup_india: formData.statutory.hasStartupIndia,
        startup_india_number: formData.statutory.startupIndiaNumber.trim() || null,
        has_epf: formData.statutory.hasEpf,
        epf_number: formData.statutory.epfNumber.trim() || null,
        has_esic: formData.statutory.hasEsic,
        esic_number: formData.statutory.esicNumber.trim() || null,
        has_psara: formData.statutory.hasPsara,
        psara_number: formData.statutory.psaraNumber.trim() || null,
        has_iso: formData.statutory.hasIso,
        iso_number: formData.statutory.isoNumber.trim() || null,
        has_pan: formData.statutory.hasPan,
        pan_number: formData.statutory.panNumber.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
        console.error("Error saving profile:", error);
        if (error.message.includes("valid_legal_status")) {
          toast.error("Invalid legal status selected");
        } else {
          toast.error("Failed to save profile. Please try again.");
        }
        return;
      }

      toast.success("Company profile saved successfully!");
      await refreshProfile();
      navigate("/dashboard");
    } catch (err) {
      console.error("Error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (isLoading || authLoading) {
    return (
      <AppLayout title="Company Profile">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Company Profile">
      <div className="space-y-6 pb-20">
        {/* Profile Incomplete Banner */}
        {!isProfileComplete && (
          <Alert className="border-warning bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning">
              Complete your company profile to unlock tender analysis features.
            </AlertDescription>
          </Alert>
        )}

        {/* Card 1: Legal Identity */}
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Legal Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input 
                  id="companyName" 
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  className={errors.companyName ? "border-destructive" : ""}
                />
                {errors.companyName && (
                  <p className="text-xs text-destructive">{errors.companyName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="incorporationDate">Incorporation Date</Label>
                <Input 
                  id="incorporationDate" 
                  type="date"
                  value={formData.incorporationDate}
                  onChange={(e) => updateField("incorporationDate", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="legalStatus">Legal Status *</Label>
                <Select 
                  value={formData.legalStatus} 
                  onValueChange={(value) => updateField("legalStatus", value)}
                >
                  <SelectTrigger id="legalStatus" className={errors.legalStatus ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="pvt-ltd">Pvt Ltd</SelectItem>
                    <SelectItem value="llp">LLP</SelectItem>
                    <SelectItem value="proprietorship">Proprietorship</SelectItem>
                  </SelectContent>
                </Select>
                {errors.legalStatus && (
                  <p className="text-xs text-destructive">{errors.legalStatus}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="startupRegNo">Startup India Reg No</Label>
                <Input 
                  id="startupRegNo" 
                  placeholder="Optional"
                  value={formData.startupRegNo}
                  onChange={(e) => updateField("startupRegNo", e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="msmeUdyamNo">MSME Udyam No</Label>
                <Input 
                  id="msmeUdyamNo" 
                  placeholder="Optional"
                  value={formData.msmeUdyamNo}
                  onChange={(e) => updateField("msmeUdyamNo", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Financial Capability */}
        <Card className="shadow-card border-l-4 border-l-warning">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-warning" />
              Financial Details
              <span className="text-xs font-normal text-muted-foreground ml-2">(Critical for eligibility)</span>
            </CardTitle>
            {/* Privacy Signal */}
            <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-muted/50 border border-border">
              <Lock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Your financial data is encrypted and used strictly for eligibility calculation. We do not share this with third parties.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Turnover Fields - 3 Years */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="turnover2425">Turnover FY 2024-25</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input 
                    id="turnover2425" 
                    className="pl-7" 
                    placeholder="0.00"
                    value={formData.turnover2425}
                    onChange={(e) => updateField("turnover2425", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="turnover2324">Turnover FY 2023-24</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input 
                    id="turnover2324" 
                    className="pl-7" 
                    placeholder="0.00"
                    value={formData.turnover2324}
                    onChange={(e) => updateField("turnover2324", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="turnover2223">Turnover FY 2022-23</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input 
                    id="turnover2223" 
                    className="pl-7" 
                    placeholder="0.00"
                    value={formData.turnover2223}
                    onChange={(e) => updateField("turnover2223", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Average Turnover - Read Only */}
            <div className="p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="space-y-2">
                <Label htmlFor="avgTurnover" className="text-success font-medium">
                  Average Turnover (3 Yrs) - Auto Calculated
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-success">₹</span>
                  <Input 
                    id="avgTurnover" 
                    className="pl-7 bg-success/5 border-success/20 font-semibold text-success" 
                    value={averageTurnover}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Net Worth Only */}
            <div className="space-y-2">
              <Label htmlFor="netWorth">Net Worth</Label>
              <div className="relative max-w-md">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input 
                  id="netWorth" 
                  className="pl-7" 
                  placeholder="0.00"
                  value={formData.netWorth}
                  onChange={(e) => updateField("netWorth", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Statutory Registrations & Licenses */}
        <Card className="shadow-card border-l-4 border-l-primary">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Statutory Registrations & Licenses
            </CardTitle>
            <CardDescription>
              Toggle the registrations your company holds. Enter registration numbers for eligibility verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {statutoryItems.map((item) => {
              const isEnabled = formData.statutory[item.key as keyof StatutoryCompliance] as boolean;
              return (
                <div 
                  key={item.key}
                  className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{item.label}</span>
                        {item.mandatory && (
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => toast.info("File upload coming soon!")}
                      >
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => updateStatutory(item.key as keyof StatutoryCompliance, checked)}
                      />
                    </div>
                  </div>
                  
                  {/* Registration Number Input - shown when enabled */}
                  {isEnabled && (
                    <div className="mt-3 pt-3 border-t border-border animate-fade-in">
                      <Label htmlFor={item.numberKey} className="text-xs text-muted-foreground">
                        Enter Registration Number (Optional)
                      </Label>
                      <Input
                        id={item.numberKey}
                        className="mt-1.5 max-w-sm"
                        placeholder="Enter registration number"
                        value={formData.statutory[item.numberKey as keyof StatutoryCompliance] as string}
                        onChange={(e) => updateStatutory(item.numberKey as keyof StatutoryCompliance, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Card 4: Technical Experience */}
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5 text-primary" />
                Technical Experience
              </CardTitle>
              <Button variant="outline" size="sm" onClick={addWorkOrder} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Work Order
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Past Work Orders</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.workOrders.map((workOrder, index) => (
              <div
                key={workOrder.id}
                className="relative rounded-lg border border-border bg-surface-subtle p-4 animate-fade-in"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    Work Order #{index + 1}
                  </span>
                  {formData.workOrders.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeWorkOrder(workOrder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Client Name</Label>
                    <Input
                      placeholder="Enter client name"
                      value={workOrder.clientName}
                      onChange={(e) =>
                        updateWorkOrder(workOrder.id, "clientName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Work Order Value</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input
                        className="pl-7"
                        placeholder="0.00"
                        value={workOrder.value}
                        onChange={(e) =>
                          updateWorkOrder(workOrder.id, "value", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Completion Year</Label>
                    <Input
                      placeholder="e.g., 2023"
                      value={workOrder.completionYear}
                      onChange={(e) =>
                        updateWorkOrder(workOrder.id, "completionYear", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Project Type</Label>
                    <Select
                      value={workOrder.projectType}
                      onValueChange={(value) =>
                        updateWorkOrder(workOrder.id, "projectType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="manpower">Manpower</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="construction">Construction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Sticky Save Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={handleSave} 
          className="shadow-elevated gap-2 px-6"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </AppLayout>
  );
}
