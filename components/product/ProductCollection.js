"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductCollection({
  collections = [],
  selectedCollection,
  onCollectionChange,
  isEditing = false,
}) {
  // Only render if there are collections
  if (!collections || collections.length === 0) {
    return null;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collection (Optional)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedCollection} onValueChange={onCollectionChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a collection (optional)" />
          </SelectTrigger>
          <SelectContent>
            {collections.map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isEditing && selectedCollection && (
          <p className="text-sm text-warning">
            <span className="font-bold">Note: </span>Removing this product from
            the collection must be done inside the collection itself.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
