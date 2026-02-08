import EmptyState from "@/components/EmptyState";
import UsersTableClient from "./UsersTableClient";
import { getAllUsers } from "@/lib/data/users";
import { Users } from "lucide-react";
import { DEFAULT_USER_SORT } from "@/lib/constants";

export default async function UsersTable({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = Math.max(1, Number(resolvedSearchParams?.page) || 1);
  const sortBy = resolvedSearchParams?.sort || DEFAULT_USER_SORT;
  const role = resolvedSearchParams?.role || null;
  const searchQuery = resolvedSearchParams?.search || null;

  const { users, pagination, error } = await getAllUsers({
    page,
    perPage: 10,
    sortBy,
    role,
    searchQuery,
  });

  if (error) {
    return (
      <EmptyState
        icon={Users}
        title="Error loading users"
        description={error}
      />
    );
  }

  if (!users || users.length === 0) {
    // Check if filters are active
    const hasFilters = role || searchQuery;

    return (
      <EmptyState
        icon={Users}
        title={hasFilters ? "No users found" : "No users yet"}
        description={
          hasFilters
            ? "Try adjusting your filters or search query"
            : "Create your first admin to display in the store"
        }
      />
    );
  }

  return (
    <UsersTableClient
      users={users}
      pagination={pagination}
      currentRole={role}
      currentSearch={searchQuery}
    />
  );
}
