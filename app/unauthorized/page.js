"use client";
import useAuthorization from "@/hooks/useAuthorization";

export default function UnauthorizedPage() {
  const { user, profile, role } = useAuthorization();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Unauthorized</h1>
    </div>
  );
}
