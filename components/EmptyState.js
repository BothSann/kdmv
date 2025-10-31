import { Package } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
      {Icon ? (
        <Icon className="w-16 h-16 text-muted-foreground" />
      ) : (
        <Package className="w-16 h-16 text-muted-foreground" />
      )}
      <div>
        <p className="text-base font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {action && (
        <Button asChild size="sm">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
