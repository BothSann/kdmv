import Link from "next/link";
import Image from "next/image";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, User } from "lucide-react";
import { formatISODateToDayMonthNameYear } from "@/lib/utils/formatters";

export default function UserRow({ user }) {
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  const displayName = fullName || "Unknown User";

  return (
    <TableRow className="text-sm">
      {/* Name with Avatar */}
      <TableCell>
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 flex-shrink-0">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={displayName}
                fill
                loading="lazy"
                quality={50}
                sizes="40px"
                className="object-cover object-center rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center">
                <User size={20} className="text-muted-foreground" />
              </div>
            )}
          </div>
          <p className="font-medium">{displayName}</p>
        </div>
      </TableCell>

      {/* Email */}
      <TableCell className="text-muted-foreground">{user.email}</TableCell>

      {/* Phone */}
      <TableCell className="text-muted-foreground">
        {user.telephone || "-"}
      </TableCell>

      {/* Role Badge */}
      <TableCell>
        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
          {user.role?.toUpperCase() || "CUSTOMER"}
        </Badge>
      </TableCell>

      {/* Joined Date */}
      <TableCell className="text-muted-foreground">
        {user.created_at
          ? formatISODateToDayMonthNameYear(user.created_at)
          : "-"}
      </TableCell>

      {/* Actions */}
      <TableCell>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/users/${user.id}`}>
            <Eye className="h-4 w-4" />
            View
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}
