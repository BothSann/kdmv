import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";

import CouponRow from "./CouponRow";
import { getAllCoupons } from "@/lib/apiCoupons";

export default async function CouponTable() {
  const { coupons } = await getAllCoupons();

  if (!coupons.length) return null;

  return (
    <Table className="mt-10 border rounded-lg">
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Total Uses</TableHead>
          <TableHead>Max Uses</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coupons.map((coupon) => (
          <CouponRow key={coupon.id} coupon={coupon} />
        ))}
      </TableBody>
    </Table>
  );
}
