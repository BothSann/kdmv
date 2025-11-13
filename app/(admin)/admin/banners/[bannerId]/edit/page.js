import BannerForm from "@/components/admin/banner/BannerForm";
import { getBannerById } from "@/lib/api/banners";
import { notFound } from "next/navigation";

/**
 * Edit Banner Page
 * Fetches banner data and renders the form in edit mode
 */
export default async function EditBannerPage({ params }) {
  const { bannerId } = await params;

  const { banner, error } = await getBannerById(bannerId);

  if (error || !banner) {
    notFound();
  }

  return <BannerForm existingBanner={banner} />;
}
