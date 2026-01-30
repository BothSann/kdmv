"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FormError from "@/components/FormError";

import {
  productTypeSchema,
  genderSchema,
} from "@/lib/validations/product-attribute";
import {
  createProductTypeAction,
  updateProductTypeAction,
  createGenderAction,
  updateGenderAction,
} from "@/server/actions/product-attribute-action";

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AttributeFormDialog({
  open,
  onOpenChange,
  type,
  editItem,
}) {
  const isEditing = !!editItem;
  const schema = type === "productType" ? productTypeSchema : genderSchema;
  const label = type === "productType" ? "Product Type" : "Gender";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      display_order: 0,
      is_active: true,
    },
  });

  const nameValue = watch("name");
  const isActiveValue = watch("is_active");

  // Reset form when dialog opens/closes or editItem changes
  useEffect(() => {
    if (open) {
      if (editItem) {
        reset({
          name: editItem.name,
          slug: editItem.slug,
          display_order: editItem.display_order,
          is_active: editItem.is_active,
        });
      } else {
        reset({
          name: "",
          slug: "",
          display_order: 0,
          is_active: true,
        });
      }
    }
  }, [open, editItem, reset]);

  // Auto-generate slug from name (only when creating)
  useEffect(() => {
    if (!isEditing && nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, isEditing, setValue]);

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      ...(isEditing && { id: editItem.id }),
    };

    let action;
    if (type === "productType") {
      action = isEditing ? updateProductTypeAction : createProductTypeAction;
    } else {
      action = isEditing ? updateGenderAction : createGenderAction;
    }

    const toastId = toast.loading(
      isEditing ? `Updating ${label}...` : `Creating ${label}...`
    );

    try {
      const { success, error, message } = await action(formData);

      if (error) {
        toast.error(error, { id: toastId });
        return;
      }

      if (success) {
        toast.success(message, { id: toastId });
        onOpenChange(false);
      }
    } catch (err) {
      toast.error("An unexpected error occurred", { id: toastId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit ${label}` : `Add ${label}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="attr-name">
              Name<span className="text-destructive">*</span>
            </Label>
            <Input
              id="attr-name"
              {...register("name")}
              disabled={isSubmitting}
              placeholder={`Enter ${label.toLowerCase()} name`}
            />
            {errors.name && <FormError message={errors.name.message} />}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="attr-slug">
              Slug<span className="text-destructive">*</span>
            </Label>
            <Input
              id="attr-slug"
              {...register("slug")}
              disabled={isSubmitting}
              placeholder="auto-generated-slug"
            />
            {errors.slug && <FormError message={errors.slug.message} />}
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="attr-order">Display Order</Label>
            <Input
              id="attr-order"
              type="number"
              {...register("display_order", { valueAsNumber: true })}
              disabled={isSubmitting}
              min={0}
            />
            {errors.display_order && (
              <FormError message={errors.display_order.message} />
            )}
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="attr-active"
              checked={isActiveValue}
              onCheckedChange={(checked) => setValue("is_active", checked)}
              disabled={isSubmitting}
            />
            <Label htmlFor="attr-active" className="cursor-pointer">
              Active
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? `Update ${label}`
                : `Create ${label}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
