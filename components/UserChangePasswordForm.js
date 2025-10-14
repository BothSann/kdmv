"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { verifyAndUpdateUserPasswordAction } from "@/actions/user-action";
import { toast } from "sonner";

export default function UserChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const changePasswordData = {
      new_password: formData.get("new_password"),
      confirm_password: formData.get("confirm_password"),
      current_password: formData.get("current_password"),
      logout_other_devices: formData.get("logout_other_devices"),
    };

    const toastId = toast.loading("Updating password...");
    setIsPending(true);

    try {
      const { success, error, message } =
        await verifyAndUpdateUserPasswordAction(changePasswordData);

      if (error) {
        toast.error(error, { id: toastId });
      }

      if (success) {
        toast.success(message, { id: toastId });
        event.target.reset();
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-1/2 mt-10">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <Label htmlFor="current_password">Current Password</Label>
          <Input
            type="password"
            name="current_password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isPending}
            required
          />
        </div>
        <div className="space-y-4">
          <Label htmlFor="new_password">New Password</Label>
          <Input
            type="password"
            name="new_password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isPending}
            required
          />
        </div>
        <div className="space-y-4">
          <Label htmlFor="confirm_password">Confirm Password</Label>
          <Input
            type="password"
            name="confirm_password"
            placeholder="Re-type New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPending}
            required
          />
          {newPassword !== confirmPassword &&
            newPassword &&
            confirmPassword && (
              <p className="text-destructive text-sm mt-3">
                Passwords do not match!
              </p>
            )}
        </div>

        {/* Logout other devices */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="logout_other_devices"
            name="logout_other_devices"
            defaultChecked={true}
            disabled
          />
          <Label htmlFor="logout_other_devices">Logout of other devices</Label>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            disabled={isPending}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isPending || newPassword !== confirmPassword || !currentPassword
            }
          >
            {isPending ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>
    </form>
  );
}
