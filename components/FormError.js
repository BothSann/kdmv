import { AlertCircle } from "lucide-react";

export default function FormError({ message }) {
  if (!message) return null;

  return (
    <p className="text-xs text-destructive">
      <AlertCircle className="inline-block size-3 mr-1" />
      {message}
    </p>
  );
}
