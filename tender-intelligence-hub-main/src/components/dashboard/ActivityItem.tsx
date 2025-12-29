import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  iconClassName?: string;
}

export function ActivityItem({ icon: Icon, title, description, time, iconClassName }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4 animate-slide-in">
      <div className={cn("rounded-full p-2", iconClassName || "bg-primary/10")}>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
    </div>
  );
}
