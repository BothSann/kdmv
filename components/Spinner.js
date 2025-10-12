import { cn } from "@/lib/utils";

export default function Spinner({ message = "Loading...", className = "" }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 min-h-screen",
        className
      )}
    >
      <div className="loader text-foreground"></div>
      <p className="text-base text-muted-foreground">{message}</p>
    </div>
  );
}
