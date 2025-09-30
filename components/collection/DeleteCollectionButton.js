"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import DeleteCollectionDialog from "./DeleteCollectionDialog";

export default function DeleteCollectionButton({ collection, redirectTo }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
        <Trash2 />
        Delete
      </Button>

      <DeleteCollectionDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        collection={collection}
        redirectTo={redirectTo}
      />
    </>
  );
}
