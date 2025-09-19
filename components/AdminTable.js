import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";

import AdminRow from "@/components/AdminRow";
import { getAllAdmins } from "@/lib/apiUsers";

export default async function AdminTable() {
  const { admins } = await getAllAdmins();

  if (!admins.length) return null;

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
