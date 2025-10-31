export default async function AddressPage({ params }) {
  const resolvedParams = await params;
  const { addressId } = resolvedParams;

  return <div>AddressPage {addressId}</div>;
}
