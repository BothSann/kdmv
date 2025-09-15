"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mt-10 space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-medium">Theme</h2>
        <p className="text-sm text-muted-foreground">
          Choose the theme for your account.
        </p>
      </div>

      <RadioGroup
        value={theme}
        onValueChange={setTheme}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <RadioGroupItem value="light" id="light" className="sr-only" />
          <Label
            htmlFor="light"
            className={`flex flex-col items-center rounded-lg border-2 p-4 cursor-pointer ${
              theme === "light" ? "border-primary" : "border-muted"
            }`}
          >
            <div className="space-y-2 rounded-lg bg-[#ecedef] p-4 w-full">
              <div className="space-y-3 rounded-md bg-white p-2.5 shadow-sm">
                <Skeleton className="h-3 w-[60%] rounded-lg bg-[#ecedef]" />
                <Skeleton className="h-3 w-[80%] rounded-lg bg-[#ecedef]" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-white p-2.5 shadow-sm">
                <Skeleton className="h-6 w-6 rounded-full bg-[#ecedef]" />
                <Skeleton className="h-3 w-full rounded-lg bg-[#ecedef]" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-white p-2.5 shadow-sm">
                <Skeleton className="h-6 w-6 rounded-full bg-[#ecedef]" />
                <Skeleton className="h-3 w-full rounded-lg bg-[#ecedef]" />
              </div>
            </div>
          </Label>
          <div className="flex items-center justify-center mt-4">
            <span className="font-medium">Light</span>
          </div>
        </div>

        <div>
          <RadioGroupItem value="dark" id="dark" className="sr-only" />
          <Label
            htmlFor="dark"
            className={`flex flex-col items-center rounded-lg border-2 p-4 cursor-pointer ${
              theme === "dark" ? "border-primary" : "border-muted"
            }`}
          >
            <div className="space-y-2 rounded-lg bg-slate-950 p-4 w-full">
              <div className="space-y-2 rounded-md bg-slate-800 p-2.5 shadow-sm">
                <Skeleton className="h-3 w-[60%] rounded-lg bg-slate-400" />
                <Skeleton className="h-3 w-[80%] rounded-lg bg-slate-400" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2.5 shadow-sm">
                <Skeleton className="h-6 w-6 rounded-full bg-slate-400" />
                <Skeleton className="h-3 w-full rounded-lg bg-slate-400" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2.5 shadow-sm">
                <Skeleton className="h-6 w-6 rounded-full bg-slate-400" />
                <Skeleton className="h-3 w-full rounded-lg bg-slate-400" />
              </div>
            </div>
          </Label>
          <div className="flex items-center justify-center mt-4">
            <span className="font-medium">Dark</span>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
