"use client";

import { useState } from "react";
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AttributeTable from "./AttributeTable";
import AttributeFormDialog from "./AttributeFormDialog";
import DeleteAttributeDialog from "./DeleteAttributeDialog";

export default function ProductAttributesClient({ productTypes, genders }) {
  // Product Types state
  const [ptDialogOpen, setPtDialogOpen] = useState(false);
  const [ptEditItem, setPtEditItem] = useState(null);
  const [ptDeleteItem, setPtDeleteItem] = useState(null);

  // Genders state
  const [genderDialogOpen, setGenderDialogOpen] = useState(false);
  const [genderEditItem, setGenderEditItem] = useState(null);
  const [genderDeleteItem, setGenderDeleteItem] = useState(null);

  const handlePtEdit = (item) => {
    setPtEditItem(item);
    setPtDialogOpen(true);
  };

  const handlePtCreate = () => {
    setPtEditItem(null);
    setPtDialogOpen(true);
  };

  const handleGenderEdit = (item) => {
    setGenderEditItem(item);
    setGenderDialogOpen(true);
  };

  const handleGenderCreate = () => {
    setGenderEditItem(null);
    setGenderDialogOpen(true);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/products">
            <ChevronLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold">Product Attributes</h1>
          <p className="text-muted-foreground mt-1">
            Manage product types and genders
          </p>
        </div>
      </div>

      {/* Product Types Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Product Types</h2>
          <Button onClick={handlePtCreate}>
            <Plus />
            Add Product Type
          </Button>
        </div>
        <AttributeTable
          items={productTypes}
          type="productType"
          onEdit={handlePtEdit}
          onDelete={setPtDeleteItem}
        />
      </section>

      {/* Genders Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Genders</h2>
          <Button onClick={handleGenderCreate}>
            <Plus />
            Add Gender
          </Button>
        </div>
        <AttributeTable
          items={genders}
          type="gender"
          onEdit={handleGenderEdit}
          onDelete={setGenderDeleteItem}
        />
      </section>

      {/* Product Type Dialogs */}
      <AttributeFormDialog
        open={ptDialogOpen}
        onOpenChange={setPtDialogOpen}
        type="productType"
        editItem={ptEditItem}
      />
      <DeleteAttributeDialog
        item={ptDeleteItem}
        type="productType"
        onClose={() => setPtDeleteItem(null)}
      />

      {/* Gender Dialogs */}
      <AttributeFormDialog
        open={genderDialogOpen}
        onOpenChange={setGenderDialogOpen}
        type="gender"
        editItem={genderEditItem}
      />
      <DeleteAttributeDialog
        item={genderDeleteItem}
        type="gender"
        onClose={() => setGenderDeleteItem(null)}
      />
    </div>
  );
}
