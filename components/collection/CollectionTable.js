import { getAllCollections } from "@/lib/api/collections";
import CollectionTableClient from "./CollectionTableClient";

export default async function CollectionTable({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, Number(resolvedSearchParams?.page) || 1);
  const { collections, pagination } = await getAllCollections({
    page,
  });

  if (!collections.length) return null;

  return (
    <CollectionTableClient collections={collections} pagination={pagination} />
  );
}
