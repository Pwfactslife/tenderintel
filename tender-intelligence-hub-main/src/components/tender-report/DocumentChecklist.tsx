import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DocumentItem {
  id: string;
  name: string;
  required: boolean;
}

interface DocumentChecklistProps {
  documents: DocumentItem[];
}

export const DocumentChecklist = ({ documents }: DocumentChecklistProps) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = (checkedCount / documents.length) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Required Documents Packet
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {checkedCount} / {documents.length} ready
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => (
            <label
              key={doc.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                checkedItems[doc.id]
                  ? "bg-green-50 border-green-200"
                  : "bg-background hover:bg-muted/50"
              )}
            >
              <Checkbox
                id={doc.id}
                checked={checkedItems[doc.id] || false}
                onCheckedChange={() => toggleItem(doc.id)}
              />
              <span
                className={cn(
                  "flex-1 text-sm font-medium",
                  checkedItems[doc.id] && "line-through text-muted-foreground"
                )}
              >
                {doc.name}
              </span>
              {doc.required && (
                <span className="text-xs text-red-600 font-medium">Required</span>
              )}
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
