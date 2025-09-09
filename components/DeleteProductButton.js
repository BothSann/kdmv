"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Trash2 } from "lucide-react";

import DeleteProductDialog from "./DeleteProductDialog";

export default function DeleteProductButton({ product, redirectTo }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
        <Trash2 />
        Delete
      </Button>

      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        product={product}
        redirectTo={redirectTo}
      />
    </>
  );
}
