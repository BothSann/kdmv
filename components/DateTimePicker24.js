"use client";

import { useState } from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Calendar1 } from "lucide-react";

export function DateTimePicker24h({ name, value, onChange, disabled }) {
  // Use external value if provided, otherwise internal state for backwards compatibility
  const [internalDate, setInternalDate] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const date = value !== undefined ? value : internalDate;

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleDateChange = (newDate) => {
    if (onChange) {
      onChange(newDate); // Notify parent component
    } else {
      setInternalDate(newDate); // Fallback to internal state
    }
  };

  const handleDateSelect = (selectedDate) => {
    if (selectedDate) {
      // If we have an existing date with time, preserve the time
      if (date) {
        const newDate = new Date(selectedDate);
        newDate.setHours(date.getHours(), date.getMinutes());
        handleDateChange(newDate);
      } else {
        // Set default time to current time
        const now = new Date();
        selectedDate.setHours(now.getHours(), now.getMinutes());
        handleDateChange(selectedDate);
      }
    }
  };

  const handleTimeChange = (type, timeValue) => {
    if (date) {
      const newDate = new Date(date);
      if (type === "hour") {
        newDate.setHours(
          (parseInt(timeValue) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
        );
      } else if (type === "minute") {
        newDate.setMinutes(parseInt(timeValue));
      } else if (type === "ampm") {
        const currentHours = newDate.getHours();
        newDate.setHours(
          timeValue === "PM" ? currentHours + 12 : currentHours - 12
        );
      }
      handleDateChange(newDate);
    }
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <Calendar1 className="mr-2 h-4 w-4" />
            {date ? (
              format(date, "MM/dd/yyyy hh:mm aa")
            ) : (
              <span>MM/DD/YYYY hh:mm aa</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <div className="sm:flex">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              disabled={disabled}
            />
            <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
              <ScrollArea className="w-64 sm:w-auto">
                <div className="flex sm:flex-col p-2">
                  {hours.reverse().map((hour) => (
                    <Button
                      key={hour}
                      size="icon"
                      variant={
                        date && (date.getHours() % 12 || 12) === hour
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleTimeChange("hour", hour.toString())}
                    >
                      {hour}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
              <ScrollArea className="w-64 sm:w-auto">
                <div className="flex sm:flex-col p-2">
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                    <Button
                      key={minute}
                      size="icon"
                      variant={
                        date && date.getMinutes() === minute
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() =>
                        handleTimeChange("minute", minute.toString())
                      }
                    >
                      {minute}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
              <ScrollArea className="">
                <div className="flex sm:flex-col p-2">
                  {["AM", "PM"].map((ampm) => (
                    <Button
                      key={ampm}
                      size="icon"
                      variant={
                        date &&
                        ((ampm === "AM" && date.getHours() < 12) ||
                          (ampm === "PM" && date.getHours() >= 12))
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleTimeChange("ampm", ampm)}
                    >
                      {ampm}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Hidden input for form data extraction */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={date ? date.toISOString() : ""}
        />
      )}
    </>
  );
}
