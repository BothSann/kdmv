import { cn } from "@/lib/utils";
import { TableCell, TableRow } from "./ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

export default function Pagination() {
  return (
    <TableRow>
      <TableCell colSpan={8} className="px-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">1</span> to{" "}
            <span className="font-semibold text-foreground">10</span> of{" "}
            <span className="font-semibold text-foreground">100</span> results
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button variant="ghost" size="sm">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
