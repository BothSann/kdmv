"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableFooter,
} from "@/components/ui/table";
import OrderRow from "./OrderRow";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import Pagination from "../Pagination";

export default function OrderTableClient({ orders, pagination }) {
  const tableHeaders = [
    { label: "", key: "select" },
    { label: "Order Number", key: "order_number" },
    { label: "Total Amount", key: "total_amount" },
    { label: "Customer", key: "customer" },
    { label: "Date", key: "date" },
    { label: "Order Status", key: "status" },
    { label: "Payment Status", key: "payment_status" },
    { label: "Actions", key: "actions" },
  ];

  return (
    <>
      <Table className="mt-10 border">
        <TableHeader>
          <TableRow>
            {tableHeaders.map((header) => (
              <TableHead key={header.key}>
                {header.key === "select" ? (
                  <Checkbox aria-label="Select all orders" />
                ) : (
                  header.label
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </TableBody>
        {pagination && (
          <TableFooter>
            <Pagination
              pagination={pagination}
              totalColumns={tableHeaders.length}
            />
          </TableFooter>
        )}
      </Table>
    </>
  );
}
