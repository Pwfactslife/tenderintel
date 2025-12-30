import { CloudUpload, Loader2, FileText, X } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useRateLimiter } from "@/hooks/useRateLimiter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { checkAndIncrementUsage, isChecking } = useRateLimiter();
  const { user, profile } = useAuth();

  const validateFiles = useCallback((files: File[]): File[] => {
    const validFiles: File[] = [];

    for (const file of files) {
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a PDF file`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 20MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    return validFiles;
  }, []);

  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles = validateFiles(newFiles);

    setSelectedFiles(prev => {
      const combined = [...prev, ...validFiles];
      if (combined.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files allowed per upload`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  }, [validateFiles]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const processFiles = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    if (!user) {
      toast.error("You must be logged in to analyze tenders.");
      return;
    }

    // Check rate limit before proceeding
    const canProceed = await checkAndIncrementUsage();
    if (!canProceed) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('user_id', user.id);
      formData.append('user_profile', JSON.stringify(profile || {}));

      toast.info("Uploading and Analyzing... This may take a minute.");

      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Server Busy: Processing queue full. Please wait 30 Seconds.");
          throw new Error("Rate limit exceeded");
        }
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Analysis Result:", result);

      toast.success("Analysis Complete! Report generated.");
      // TODO: Navigate to results page or show modal with 'result' data
      // For now, we clear files
      setSelectedFiles([]);

    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to analyze documents.");
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, checkAndIncrementUsage, user, profile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  }, [addFiles]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      addFiles(files);
    }
    e.target.value = '';
  }, [addFiles]);

  const handleClick = () => {
    if (!isUploading && !isChecking) {
      document.getElementById("file-upload")?.click();
    }
  };

  const isProcessing = isUploading || isChecking;
  const hasFiles = selectedFiles.length > 0;

  return (
    <div className="space-y-4">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200",
          isProcessing ? "cursor-wait" : "cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-surface-subtle hover:border-primary/50 hover:bg-primary/5"
        )}
      >
        <input
          id="file-upload"
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={isProcessing}
        />

        <div className={cn(
          "mb-4 rounded-full bg-primary/10 p-6 transition-transform duration-200",
          isDragging && "scale-110"
        )}>
          {isProcessing ? (
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          ) : (
            <CloudUpload className="h-12 w-12 text-primary" />
          )}
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-2">
          {isProcessing ? "Processing..." : "Analyze New Tender"}
        </h3>

        <p className="text-muted-foreground text-center mb-4">
          {isProcessing
            ? "Please wait while we process your documents"
            : "Drop your GeM Tender Documents (Main Tender, ATC, Scope of Work)"
          }
        </p>

        <p className="text-xs text-muted-foreground">
          Max {MAX_FILES} files, 20MB each. Supports scanned PDFs.
        </p>
      </div>

      {/* Selected Files List */}
      {hasFiles && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">
              Selected Files ({selectedFiles.length}/{MAX_FILES})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFiles([])}
              className="text-muted-foreground hover:text-destructive"
              disabled={isProcessing}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isProcessing) removeFile(index);
                  }}
                  disabled={isProcessing}
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={processFiles}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              `Analyze ${selectedFiles.length} Document${selectedFiles.length > 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
