import BannerTable from "@/components/admin/banner/BannerTable";
import { Button } from "@/components/ui/button";
import { getAllBanners } from "@/lib/api/banners";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import TableSkeleton from "@/components/TableSkeleton";
import PaginationStateManager from "@/components/PaginationStateManager";

/**
 * Admin Banners List Page
 * Displays all hero banners with pagination and management options
 */
export default async function AdminBannersPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, Number(resolvedSearchParams?.page) || 1);

  const { banners, pagination, error } = await getAllBanners({ page });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive font-medium">Error loading banners</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PaginationStateManager />
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Hero Banners</h1>
          <p className="text-muted-foreground mt-1">
            Manage homepage carousel banners
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/banners/create">
            <Plus />
            Create Banner
          </Link>
        </Button>
      </div>

      {/* Banners Table */}
      <Suspense fallback={<TableSkeleton />}>
        <BannerTable banners={banners} pagination={pagination} />
      </Suspense>
    </div>
  );
}
