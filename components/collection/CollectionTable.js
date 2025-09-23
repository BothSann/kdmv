import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableFooter,
} from "@/components/ui/table";

import Pagination from "../Pagination";
import CollectionRow from "./CollectionRow";
import { getAllCollections } from "@/lib/apiCollections";

export default async function CollectionTable({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, Number(resolvedSearchParams?.page) || 1);
  const { collections, pagination } = await getAllCollections({ page });

  const tableHeaders = [
    { key: "name", label: "Collection Name" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  if (!collections.length) return null;

  return (
    <Table className="mt-10 border rounded-lg">
      <TableHeader>
        <TableRow>
          {tableHeaders.map((header) => (
            <TableHead key={header.key}>{header.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {collections.map((collection) => (
          <CollectionRow key={collection.id} collection={collection} />
        ))}
      </TableBody>

      {pagination && (
        <TableFooter>
          <Pagination
            pagination={pagination}
            totalColumns={tableHeaders.length}
          />
        </TableFooter>
      )}
    </Table>
  );
}
