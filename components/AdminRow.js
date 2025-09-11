import { TableRow, TableCell } from "@/components/ui/table";
import Image from "next/image";

export default function AdminRow({ admin }) {
  const fullName = `${admin.first_name} ${admin.last_name}`;

  return (
    <TableRow className="text-base">
      <TableCell>
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12">
            <Image
              src={
                admin.avatar_url ||
                "https://rbcppmhhbzilsypviyrg.supabase.co/storage/v1/object/public/clothes-images/Default_pfp%20(1).jpg"
              }
              alt={fullName}
              fill
              loading="lazy"
              quality={100}
              className="object-cover object-center"
            />
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
