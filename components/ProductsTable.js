import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import { getAllProducts } from "@/services/data-service";
import ProductRow from "./ProductRow";

export default async function ProductsTable() {
  const products = await getAllProducts();

  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (!products.length) return null;

  return (
    <Table className="mt-6 border rounded-lg">
      <TableHeader>
        <TableRow>
          <TableHead>Product Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </TableBody>
    </Table>
  );
}
