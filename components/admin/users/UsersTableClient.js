"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableFooter,
} from "@/components/ui/table";
import UserRow from "./UserRow";
import UserFilters from "./UserFilters";
import Pagination from "@/components/Pagination";
import SortSelect from "@/components/ui/sort-select";
import { USER_SORT_OPTIONS, DEFAULT_USER_SORT } from "@/lib/constants";

export default function UsersTableClient({
  users,
  pagination,
  currentRole,
  currentSearch,
}) {
  const tableHeaders = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "telephone" },
    { label: "Role", key: "role" },
    { label: "Joined", key: "created_at" },
    { label: "Actions", key: "actions" },
  ];

  return (
    <div>
      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
        <UserFilters currentRole={currentRole} currentSearch={currentSearch} />
        <SortSelect
          options={USER_SORT_OPTIONS}
          defaultValue={DEFAULT_USER_SORT}
        />
      </div>

      <Table className="mt-6 border">
        <TableHeader>
          <TableRow>
            {tableHeaders.map((header) => (
              <TableHead key={header.key}>{header.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </TableBody>

        <TableFooter>
          <Pagination
            pagination={pagination}
            totalColumns={tableHeaders.length}
          />
        </TableFooter>
      </Table>
    </div>
  );
}
