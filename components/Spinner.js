export default function Spinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-screen">
      <div className="loader text-foreground"></div>
      <p className="text-base text-muted-foreground">{message}</p>
    </div>
  );
}
