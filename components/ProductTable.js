import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableFooter,
} from "@/components/ui/table";
import ProductRow from "./ProductRow";
import Pagination from "./Pagination";

import { getAllProducts } from "@/lib/apiProducts";
import { cn } from "@/lib/utils";

export default async function ProductTable({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = Math.max(1, Number(resolvedSearchParams?.page) || 1);
  const { products, pagination } = await getAllProducts({ page });

  if (!products || !products.length) return null;

  const tableHeaders = [
    { label: "Product Name", key: "name" },
    { label: "Base Price", key: "base_price" },
    { label: "Discount", key: "discount_percentage" },
    { label: "Category", key: "category_name" },
    { label: "Stock", key: "total_stock" },
    { label: "Code", key: "product_code" },
    { label: "Status", key: "is_active" },
    { label: "Actions", key: "actions" },
  ];
  // console.log(products);

  // Simulate a delay
  // await new Promise((resolve) => setTimeout(resolve, 2000));

  return (
    <Table className="mt-10 border rounded-lg">
      <TableHeader>
        <TableRow>
          {tableHeaders.map((header, index) => (
            <TableHead
              className={cn("py-3.5", index === 0 && "pl-4")}
              key={header.key}
            >
              {header.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </TableBody>

      <TableFooter>
        <Pagination pagination={pagination} />
      </TableFooter>
    </Table>
  );
}
