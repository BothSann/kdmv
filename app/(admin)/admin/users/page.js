import Link from "next/link";
import { Suspense } from "react";

import AdminTable from "@/components/AdminTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import Spinner from "@/components/Spinner";

export default function AdminRegisterPage() {
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Users</h1>
        <Button asChild>
          <Link href="/admin/users/create">
            <Plus />
            Create Admin
          </Link>
        </Button>
      </div>

      <Suspense fallback={<Spinner />}>
        <AdminTable />
      </Suspense>
    </div>
  );
}
