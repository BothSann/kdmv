import { Package } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center space-y-4",
        className
      )}
    >
      {Icon ? (
        <Icon className="w-18 h-18 text-muted-foreground mb-4" />
      ) : (
        <Package className="w-18 h-18 text-muted-foreground mb-4" />
      )}
      <div className="space-y-1 text-center">
        <p className="text-2xl font-bold">{title}</p>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
