"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ProductDetails({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="space-y-3">
          <Label>Name</Label>
          <Input
            type="text"
            name="name"
            value={name}
            required
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label>Description (Optional)</Label>
          <Textarea
            name="description"
            rows={4}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
