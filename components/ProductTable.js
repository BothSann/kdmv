import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import ProductRow from "./ProductRow";
import { getAllProducts } from "@/lib/apiProducts";

export default async function ProductTable() {
  const { products } = await getAllProducts();

  // console.log(products);

  // Simulate a delay
  // await new Promise((resolve) => setTimeout(resolve, 2000));

  if (!products.length) return null;

  return (
    <Table className="mt-6 border rounded-lg">
      <TableHeader className="text-base">
        <TableRow>
          <TableHead>Product Name</TableHead>
          <TableHead>Base Price</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
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
