import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimePicker({ value, onChange, placeholder = "Select time", className }: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedHour, setSelectedHour] = React.useState<string>("");
  const [selectedMinute, setSelectedMinute] = React.useState<string>("");
  const [period, setPeriod] = React.useState<"AM" | "PM">("AM");

  // Parse initial value
  React.useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(":");
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      setSelectedHour(hour12.toString().padStart(2, "0"));
      setSelectedMinute(minutes);
      setPeriod(hour24 >= 12 ? "PM" : "AM");
    }
  }, [value]);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  const handleConfirm = () => {
    if (selectedHour && selectedMinute) {
      let hour24 = parseInt(selectedHour, 10);
      if (period === "PM" && hour24 !== 12) {
        hour24 += 12;
      } else if (period === "AM" && hour24 === 12) {
        hour24 = 0;
      }
      const timeValue = `${hour24.toString().padStart(2, "0")}:${selectedMinute}`;
      onChange(timeValue);
      setOpen(false);
    }
  };

  const formatDisplayTime = () => {
    if (!value) return null;
    const [hours, minutes] = value.split(":");
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const displayPeriod = hour24 >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${displayPeriod}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatDisplayTime() || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          {/* Time Display */}
          <div className="text-center bg-muted rounded-lg p-3">
            <span className="text-3xl font-bold tabular-nums">
              {selectedHour || "--"}:{selectedMinute || "--"}
            </span>
            <span className="ml-2 text-lg font-medium text-muted-foreground">
              {period}
            </span>
          </div>

          {/* Selectors Row */}
          <div className="flex gap-2">
            {/* Hours */}
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Hour</p>
              <ScrollArea className="h-[180px] rounded-md border">
                <div className="p-1">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      onClick={() => setSelectedHour(hour)}
                      className={cn(
                        "w-full px-3 py-2 text-center rounded-md text-sm transition-colors",
                        selectedHour === hour
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Minutes */}
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Minute</p>
              <ScrollArea className="h-[180px] rounded-md border">
                <div className="p-1">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      onClick={() => setSelectedMinute(minute)}
                      className={cn(
                        "w-full px-3 py-2 text-center rounded-md text-sm transition-colors",
                        selectedMinute === minute
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* AM/PM */}
            <div className="w-16">
              <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Period</p>
              <div className="space-y-1">
                <button
                  onClick={() => setPeriod("AM")}
                  className={cn(
                    "w-full px-3 py-3 rounded-md text-sm font-medium transition-colors",
                    period === "AM"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  AM
                </button>
                <button
                  onClick={() => setPeriod("PM")}
                  className={cn(
                    "w-full px-3 py-3 rounded-md text-sm font-medium transition-colors",
                    period === "PM"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedHour || !selectedMinute}
              className="flex-1"
            >
              Set Time
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
