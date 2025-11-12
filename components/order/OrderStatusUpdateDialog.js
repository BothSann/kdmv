"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/server/actions/order-action";

export default function OrderStatusUpdateDialog({ order, adminId }) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const currentStatus = order?.status;
  const orderId = order?.id;

  const orderStatuses = [
    {
      value: "PENDING",
      label: "Pending",
      description: "Order is being processed",
    },
    {
      value: "CONFIRMED",
      label: "Confirmed",
      description: "Payment confirmed, preparing order",
    },
    {
      value: "SHIPPED",
      label: "Shipped",
      description: "Order has been shipped",
    },
    {
      value: "DELIVERED",
      label: "Delivered",
      description: "Order delivered to customer",
    },
    {
      value: "CANCELLED",
      label: "Cancelled",
      description: "Order has been cancelled",
    },
  ];

  const orderStatusVariants = {
    PENDING: "warning",
    CONFIRMED: "default",
    SHIPPED: "default",
    DELIVERED: "success",
    CANCELLED: "destructive",
  };

  // Sync state when dialog opens
  useEffect(() => {
    if (open && currentStatus) {
      // When dialog opens, set selected status to current order status
      setSelectedStatus(currentStatus);
    }
  }, [open, currentStatus]); // Re-run when dialog opens or currentStatus changes

  const handleSubmit = async (event) => {
    const toastId = toast.loading("Updating order status...");
    try {
      event.preventDefault();

      // Validation
      if (!selectedStatus) {
        toast.error("Please select a status");
        return;
      }

      if (selectedStatus === currentStatus) {
        toast.error(`Order is already ${currentStatus}`);
        return;
      }

      // Call server action with transition
      startTransition(async () => {
        const result = await updateOrderStatusAction(
          orderId,
          selectedStatus,
          notes,
          adminId
        );

        if (result.error) {
          toast.error(result.error, { id: toastId });
        } else {
          toast.success(result.message || "Order status updated successfully", {
            id: toastId,
          });
          setOpen(false); // Close dialog
          setSelectedStatus(""); // Reset form
          setNotes("");
        }
      });
    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Update Status
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-[1.40rem]">
              Update Order Status
            </DialogTitle>
            <DialogDescription>
              Manage and update the status of customer orders to reflect their
              current stage.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Current Status Display */}
            <div className="space-y-2">
              <Label>Current Status</Label>
              <Badge variant={orderStatusVariants[currentStatus]}>
                {currentStatus}
              </Badge>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <Label htmlFor="status">New Status &#42;</Label>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                disabled={isPending}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((status) => (
                    <SelectItem
                      key={status.value}
                      value={status.value}
                      disabled={status.value === currentStatus}
                    >
                      <div className="space-x-1">
                        <span>{status.label}</span>
                        <span className="text-xs text-muted-foreground">
                          ({status.description})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Optional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this status change..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isPending}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setSelectedStatus(""); // Reset when cancelling
                  setNotes("");
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending || !selectedStatus}>
              {isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
