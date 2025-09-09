import { Button } from "@/components/ui/button";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({ searchParams }) {
  const message = searchParams.message;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center gap-4 uppercase">
        <h1 className="text-3xl font-bold">An error occurred</h1>
        <p className="text-md text-muted-foreground">
          {message || "An unknown error occurred"}
        </p>
        <Button asChild>
          <Link href="/">
            <ArrowBigLeft />
            <span>Return to Home</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
