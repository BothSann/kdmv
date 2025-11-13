import { getAllCollections } from "@/lib/api/collections";
import CollectionTableClient from "./CollectionTableClient";
import EmptyState from "../EmptyState";
import { Combine } from "lucide-react";

export default async function CollectionTable({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, Number(resolvedSearchParams?.page) || 1);
  const { collections, pagination } = await getAllCollections({
    page,
  });

  if (!collections || collections.length === 0) {
    return (
      <EmptyState
        icon={Combine}
        title="No collections yet"
        description="Create your first collection to display in the store"
      />
    );
  }

  return (
    <CollectionTableClient collections={collections} pagination={pagination} />
  );
}
