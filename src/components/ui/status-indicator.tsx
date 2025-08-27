import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error" | "warning";

interface StatusIndicatorProps {
  status: Status;
  message?: string;
  className?: string;
}

const statusConfig = {
  idle: {
    icon: null,
    color: "text-muted-foreground",
    bgColor: "bg-muted/20",
  },
  loading: {
    icon: Loader2,
    color: "text-primary",
    bgColor: "bg-primary/10",
    animate: "animate-spin",
  },
  success: {
    icon: CheckCircle,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  error: {
    icon: XCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  warning: {
    icon: AlertCircle,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
};

export function StatusIndicator({ status, message, className }: StatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  if (status === "idle" && !message) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg border",
      config.bgColor,
      "border-border/50",
      className
    )}>
      {Icon && (
        <Icon className={cn("h-4 w-4", config.color, "animate" in config ? config.animate : "")} />
      )}
      {message && (
        <span className={cn("text-sm", config.color)}>{message}</span>
      )}
    </div>
  );
}