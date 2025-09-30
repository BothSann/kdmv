import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound({ href, title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-10rem)] text-center space-y-4">
      <h2 className="text-3xl font-bold">{title} Not Found</h2>
      <p className="text-muted-foreground">
        The {title.toLowerCase()} you&apos;re looking for doesn&apos;t exist or
        has been deleted.
      </p>

      <Button asChild>
        <Link href={href}>
          <ChevronLeft />
          Back to {title}
        </Link>
      </Button>
    </div>
  );
}
