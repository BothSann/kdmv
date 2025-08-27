import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Spinner />
      <p className="text-sm text-muted-foreground">Loading products data...</p>
    </div>
  );
}
