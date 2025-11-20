"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({ error }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-6xl font-bold tracking-tight text-foreground sm:text-7xl">
          404
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Oops, it looks like the page you&apos;re looking for doesn&apos;t
          exist.
        </p>
        <p className="mt-4 text-md text-muted-foreground">{error.message}</p>
        <Button className="mt-6" asChild>
          <Link href="/" prefetch={false}>
            Go to Homepage
          </Link>
        </Button>
      </div>
    </div>
  );
}
