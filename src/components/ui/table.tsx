import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.memo(function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-xl bg-white p-0"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-[15px]", className)}
        {...props}
      />
    </div>
  )
});

const TableHeader = React.memo(function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-[#f8fafc] [&_tr]:border-0 [&_th]:text-[#6c7680] [&_th]:font-bold [&_th]:uppercase [&_th]:text-xs [&_th]:tracking-wider [&_th]:bg-[#f8fafc] [&_th]:border-0", className)}
      {...props}
    />
  )
});

const TableBody = React.memo(function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
});

const TableFooter = React.memo(function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
});

const TableRow = React.memo(function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-[#e5e7eb] transition-colors hover:bg-[#f8fafc] data-[state=selected]:bg-[#f1f5f9] group",
        className
      )}
      {...props}
    />
  )
});

const TableHead = React.memo(function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-[#6c7680] h-11 px-6 text-left align-middle font-bold whitespace-nowrap text-xs bg-[#f8fafc] border-0 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
});

const TableCell = React.memo(function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-6 py-3 align-middle whitespace-nowrap text-[#23272f] text-[15px] group-hover:bg-[#f8fafc] transition-colors [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
});

const TableCaption = React.memo(function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
});

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
