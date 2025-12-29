import { CloudUpload, Loader2, FileText, X } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useRateLimiter } from "@/hooks/useRateLimiter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { checkAndIncrementUsage, isChecking } = useRateLimiter();

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

    // Check rate limit before proceeding
    const canProceed = await checkAndIncrementUsage();
    if (!canProceed) return;

    setIsUploading(true);
    try {
      // TODO: Implement actual file upload and analysis
      // Send files[] array to /analyze endpoint
      console.log("Processing files:", selectedFiles.map(f => f.name));
      
      // API call would be:
      // const formData = new FormData();
      // selectedFiles.forEach(file => formData.append('files[]', file));
      // await fetch('/analyze', { method: 'POST', body: formData });
      
      toast.success(`${selectedFiles.length} document(s) uploaded! Analysis starting...`);
      setSelectedFiles([]);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload documents. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, checkAndIncrementUsage]);

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
                    removeFile(index);
                  }}
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
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
