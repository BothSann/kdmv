import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export default function ProductTableSkeleton() {
  return (
    <div className="space-y-6">
      {/* Table skeleton */}
      <Table className="mt-10 border rounded-lg">
        <TableHeader>
          <TableRow>
            {Array.from({ length: 8 }).map((_, index) => (
              <TableHead key={index} className="py-3.5">
                <Skeleton className="h-4 w-32" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between px-4 py-4 border rounded-lg">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}
