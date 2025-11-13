import { TableRow, TableCell } from "@/components/ui/table";
import { User } from "lucide-react";
import Image from "next/image";

export default function AdminRow({ admin }) {
  const fullName = `${admin.first_name} ${admin.last_name}`;

  return (
    <TableRow className="text-sm">
      <TableCell>
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10">
            {admin.avatar_url ? (
              <Image
                src={admin.avatar_url}
                alt={fullName}
                fill
                loading="lazy"
                quality={50}
                sizes="100vw"
                className="object-cover object-center rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center">
                <User size={24} className="text-ring" />
              </div>
            )}
          </div>
          <p>{fullName}</p>
        </div>
      </TableCell>
      <TableCell>{admin.email}</TableCell>
      <TableCell>{admin.telephone}</TableCell>
      <TableCell>{admin.role.toUpperCase()}</TableCell>
    </TableRow>
  );
}
