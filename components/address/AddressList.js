import AddressCard from "./AddressCard";

export default function AddressList({ addresses, customerId }) {
  return (
    <>
      {addresses.map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          customerId={customerId}
        />
      ))}
    </>
  );
}
