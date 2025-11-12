"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const PAYMENT_METHODS = [
  {
    id: "bakong_khqr",
    name: "KHQR Payment",
    description: "Scan to pay with Bakong app or any bank apps",
    image: "/KHQR-logo.png",
  },
  // Future payment methods can be added here
  // {
  //   id: "aba_pay",
  //   name: "ABA Pay",
  //   description: "Pay with ABA mobile app",
  //   image: "/aba-logo.png",
  // },
];

/**
 * Client Component - Payment method selection
 */
export default function PaymentMethodSection({ selected, onSelect }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 font-poppins">Payment Method</h2>

      <Card>
        <CardContent>
          <RadioGroup value={selected} onValueChange={onSelect}>
            {PAYMENT_METHODS.map((method) => (
              <div
                className="flex items-center lg:gap-4 gap-2.5"
                key={method.id}
              >
                <RadioGroupItem
                  className="cursor-pointer"
                  value={method.id}
                  id={method.id}
                />
                <Label
                  htmlFor={method.id}
                  className="flex items-center gap-2.5 lg:gap-4 cursor-pointer flex-grow"
                >
                  <div className="relative lg:min-w-16 lg:min-h-16 min-w-14 min-h-14">
                    <Image
                      fill
                      quality={100}
                      src={method.image}
                      alt={method.name}
                      className="object-contain object-center"
                    />
                  </div>

                  <div className="font-source-sans-3">
                    <p className="font-bold text-sm lg:text-base">
                      {method.name}
                    </p>
                    <span className="text-xs lg:text-sm">
                      {method.description}
                    </span>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
