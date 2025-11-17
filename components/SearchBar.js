"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();

    // Validate: prevent empty searches
    if (!query.trim()) {
      return;
    }

    // Navigate to search page with query parameter
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);

    // Close the sheet and clear input
    setIsOpen(false);
    setQuery("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <Search className="scale-125" />
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="h-24">
        {/* Visually hidden header for screen readers */}
        <VisuallyHidden>
          <SheetHeader>
            <SheetTitle className="sr-only">Search</SheetTitle>
            <SheetDescription className="sr-only">
              Search for a product
            </SheetDescription>
          </SheetHeader>
        </VisuallyHidden>
        <form
          onSubmit={handleSearch}
          className="my-auto flex items-center px-10 lg:px-72"
        >
          <Button type="submit" variant="ghost">
            <Search className="size-5 lg:size-6 text-muted-foreground" />
          </Button>
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search our store"
            className="w-full focus-visible:ring-0 focus-visible:ring-offset-0 border-none placeholder:text-sm lg:placeholder:text-lg"
            autoFocus
          />
        </form>
      </SheetContent>
    </Sheet>
  );
}
