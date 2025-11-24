"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import { Controller } from "react-hook-form";
import FormError from "@/components/FormError";
import { cn } from "@/lib/utils";

export default function ProductCollection({
  collections = [],
  control,
  errors,
  isSubmitting,
  isEditing = false,
}) {
  // Only render if there are collections
  if (!collections || collections.length === 0) {
    return null;
  }

  const selectedCollection = control._formValues?.collection_id;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collection (Optional)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="collection_id">Collection</Label>
          <Controller
            name="collection_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  className={cn(
                    "w-full",
                    errors.collection_id && "border-destructive"
                  )}
                  id="collection_id"
                >
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
            )}
          />
          {errors.collection_id && (
            <FormError message={errors.collection_id.message} />
          )}
        </div>

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
