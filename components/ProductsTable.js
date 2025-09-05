import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import ProductRow from "./ProductRow";
import { getAllProducts } from "@/lib/apiProducts";

export default async function ProductsTable() {
  const { products } = await getAllProducts();
  console.log(products);

  // Simulate a delay
  // await new Promise((resolve) => setTimeout(resolve, 2000));

  if (!products.length) return null;

  return (
    <Table className="mt-6 border rounded-lg">
      <TableHeader>
        <TableRow>
          <TableHead>Product Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Subcategory</TableHead>
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
