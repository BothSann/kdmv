import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";

import AdminRow from "@/components/admin/AdminRow";
import { getAllAdmins } from "@/lib/api/users";
import EmptyState from "../EmptyState";
import { Users } from "lucide-react";

export default async function AdminTable() {
  const { admins } = await getAllAdmins();

  if (!admins || admins.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No admins yet"
        description="Create your first admin to display in the store"
      />
    );
  }

  return (
    <Table className="mt-10 border rounded-lg">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {admins.map((admin) => (
          <AdminRow key={admin.id} admin={admin} />
        ))}
      </TableBody>
    </Table>
  );
}
