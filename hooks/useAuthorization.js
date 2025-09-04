import useAuthStore from "@/store/useAuthStore";

export default function useAuthorization() {
  const { role, user, profile, isLoading } = useAuthStore();

  const isAuthorized = (allowedRoles) => {
    if (isLoading) return false;
    if (!user) return false;
    if (!allowedRoles) return true;
    return allowedRoles.includes(role);
  };

  const isAdmin = () => isAuthorized(["admin"]);
  const isCustomer = () => isAuthorized(["customer"]);
  const isAuthenticated = () => user?.role === "authenticated";

  return {
    role,
    user,
    profile,
    isLoading,
    isAuthorized,
    isAdmin,
    isCustomer,
    isAuthenticated,
  };
}
