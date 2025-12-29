import { Check, X, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface GapAnalysisItem {
  criteria: string;
  tenderAsk: string;
  yourProfile: string;
  status: "pass" | "fail" | "warning";
}

interface GapAnalysisTableProps {
  items: GapAnalysisItem[];
}

export const GapAnalysisTable = ({ items }: GapAnalysisTableProps) => {
  const getStatusBadge = (status: GapAnalysisItem["status"]) => {
    switch (status) {
      case "pass":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
            <Check className="h-3 w-3" />
            Pass
          </Badge>
        );
      case "fail":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1">
            <X className="h-3 w-3" />
            Fail
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1">
            <AlertTriangle className="h-3 w-3" />
            Warning
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: GapAnalysisItem["status"]) => {
    switch (status) {
      case "pass":
        return <Check className="h-5 w-5 text-green-600" />;
      case "fail":
        return <X className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Criteria</TableHead>
            <TableHead className="font-semibold">Tender Requirement</TableHead>
            <TableHead className="font-semibold">Your Profile</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.criteria}</TableCell>
              <TableCell className="text-muted-foreground">{item.tenderAsk}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className={cn(
                    item.status === "pass" && "text-green-700",
                    item.status === "fail" && "text-red-700",
                    item.status === "warning" && "text-yellow-700"
                  )}>
                    {item.yourProfile}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
