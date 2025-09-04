"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

export default function AdminRegisterForm() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col items-center">
          <Logo />
          <CardTitle className="text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter the details below to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-3">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    name="first_name"
                    id="first_name"
                    type="text"
                    placeholder="John"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    name="last_name"
                    id="last_name"
                    type="text"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  name="email"
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  name="password"
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <Button type="submit" className="w-full">
                  Create account
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
