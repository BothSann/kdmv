import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProductRow({ product }) {
  // const total_stock = product.
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12">
            <Image
              src={product.banner_image_url}
              alt={product.name}
              fill
              quality={100}
              className="object-cover object-top"
            />
          </div>
          <p>{product.name}</p>
        </div>
      </TableCell>
      <TableCell>${product.base_price}</TableCell>
      <TableCell>{product.category_name || "No Category"}</TableCell>
      <TableCell>{product.subcategory_name || "No Subcategory"}</TableCell>
      <TableCell>{product.total_stock}</TableCell>
      <TableCell>{product.product_code || "No Code"}</TableCell>
      <TableCell>
        {product.is_active ? (
          <span className="text-green-600">In Stock</span>
        ) : (
          <span className="text-red-600">Out Of Stock</span>
        )}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href={`/admin/products/${product.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
