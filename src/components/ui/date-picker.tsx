import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  disabled,
  className,
  placeholder = "mm / dd / yyyy",
}) => {
  const [open, setOpen] = React.useState(false);

  // Fix: Calendar returns date in UTC, so adjust for local timezone
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Set time to noon to avoid timezone issues
      const localDate = new Date(date);
      localDate.setHours(12, 0, 0, 0);
      onChange?.(localDate);
    } else {
      onChange?.(undefined);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          tabIndex={0}
          role="button"
          aria-label="Pick a date"
          onClick={() => !disabled && setOpen((v) => !v)}
          onKeyDown={e => {
            if (!disabled && (e.key === "Enter" || e.key === " ")) setOpen((v) => !v);
          }}
          className={cn(
            // Use project theme: white background, gray border, blue focus, gray text
            "w-full flex items-center justify-between text-left font-normal p-4 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg cursor-pointer select-none outline-none",
            !value ? "text-gray-400" : "text-gray-900",
            disabled && "opacity-60 pointer-events-none",
            className
          )}
        >
          <span>
            {value ? format(value, "MM / dd / yyyy") : <span>{placeholder}</span>}
          </span>
          <CalendarIcon className="ml-2 h-5 w-5 text-gray-400" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-auto p-0 z-[300] rounded-xl border border-gray-200 bg-white shadow-xl mt-2"
        )}
        align="start"
      >
        <div className="rounded-xl bg-white p-2">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            initialFocus
            className="rounded-xl bg-white"
            // Show 1 month, always start week on Monday
            numberOfMonths={1}
            weekStartsOn={1}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};