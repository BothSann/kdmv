"use client";
import useAuthorization from "@/hooks/useAuthorization";

export default function UnauthorizedPage() {
  const { user, profile, role } = useAuthorization();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Unauthorized</h1>
      <h1>
        Hello {profile?.first_name} {profile?.last_name}
      </h1>
      <h1>Your role is {role}</h1>
      <h1>Your user is {user?.email}</h1>
    </div>
  );
}
