"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Trash2 } from "lucide-react";

import DeleteCouponDialog from "./DeleteCouponDialog";

export default function DeleteCouponButton({ coupon, redirectTo }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
        <Trash2 />
        Delete
      </Button>

      <DeleteCouponDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        coupon={coupon}
        redirectTo={redirectTo}
      />
    </>
  );
}
