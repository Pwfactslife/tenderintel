import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityRow {
  tenderId: string;
  uploadedDate: string;
  status: "analyzing" | "completed";
  result: "pass" | "fail" | null;
}

const recentActivity: ActivityRow[] = [
  {
    tenderId: "GEM/2025/B/4821567",
    uploadedDate: "Dec 28, 2025",
    status: "completed",
    result: "pass",
  },
  {
    tenderId: "GEM/2025/B/4821234",
    uploadedDate: "Dec 27, 2025",
    status: "completed",
    result: "fail",
  },
  {
    tenderId: "GEM/2025/B/4820998",
    uploadedDate: "Dec 27, 2025",
    status: "analyzing",
    result: null,
  },
  {
    tenderId: "GEM/2025/B/4820756",
    uploadedDate: "Dec 26, 2025",
    status: "completed",
    result: "pass",
  },
  {
    tenderId: "GEM/2025/B/4820512",
    uploadedDate: "Dec 25, 2025",
    status: "completed",
    result: "pass",
  },
];

export function RecentActivityTable() {
  const navigate = useNavigate();

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tender ID</TableHead>
                <TableHead>Uploaded Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((row) => (
                <TableRow key={row.tenderId}>
                  <TableCell className="font-medium">{row.tenderId}</TableCell>
                  <TableCell className="text-muted-foreground">{row.uploadedDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        row.status === "analyzing"
                          ? "bg-warning/10 text-warning border-warning/20"
                          : "bg-success/10 text-success border-success/20"
                      )}
                    >
                      {row.status === "analyzing" ? "Analyzing" : "Completed"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.result ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          row.result === "pass"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        )}
                      >
                        {row.result === "pass" ? "Pass" : "Fail"}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={row.status === "analyzing"}
                      className="gap-1.5"
                      onClick={() => navigate("/analysis-results")}
                    >
                      <Eye className="h-4 w-4" />
                      View Report
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {recentActivity.map((row) => (
            <div key={row.tenderId} className="rounded-lg border border-border bg-surface-subtle p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm text-foreground break-all">{row.tenderId}</p>
                {row.result ? (
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0",
                      row.result === "pass"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    )}
                  >
                    {row.result === "pass" ? "Pass" : "Fail"}
                  </Badge>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">{row.uploadedDate}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    row.status === "analyzing"
                      ? "bg-warning/10 text-warning border-warning/20"
                      : "bg-success/10 text-success border-success/20"
                  )}
                >
                  {row.status === "analyzing" ? "Analyzing" : "Completed"}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={row.status === "analyzing"}
                className="w-full gap-1.5"
                onClick={() => navigate("/analysis-results")}
              >
                <Eye className="h-4 w-4" />
                View Report
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
