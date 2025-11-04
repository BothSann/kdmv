import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function AddressDisplayCard({ address, onChangeClick }) {
  if (!address) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            No delivery address selected
          </p>
          <Button onClick={onChangeClick}>Select Address</Button>
        </CardContent>
      </Card>
    );
  }

  const fullName = `${address.first_name} ${address.last_name}`;
  const fullAddress = [
    address.street_address,
    address.apartment,
    address.city_province,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="font-semibold text-lg">{fullName}</p>
            <p className="text-sm text-muted-foreground">{fullAddress}</p>
            <p className="text-sm text-muted-foreground">
              {address.phone_number}
            </p>
          </div>
          {address.is_default && <Badge variant="default">Default</Badge>}
        </div>

        <Button variant="outline" onClick={onChangeClick} className="w-full">
          Change Address
        </Button>
      </CardContent>
    </Card>
  );
}
