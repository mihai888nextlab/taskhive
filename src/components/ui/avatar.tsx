"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

// Expanded color palette for fallback avatars (20+ colors)
const fallbackColors = [
  "bg-blue-500 text-white",
  "bg-green-500 text-white",
  "bg-red-500 text-white",
  "bg-yellow-500 text-white",
  "bg-purple-500 text-white",
  "bg-pink-500 text-white",
  "bg-indigo-500 text-white",
  "bg-teal-500 text-white",
  "bg-orange-500 text-white",
  "bg-gray-500 text-white",
  "bg-cyan-500 text-white",
  "bg-lime-500 text-white",
  "bg-amber-500 text-white",
  "bg-fuchsia-500 text-white",
  "bg-rose-500 text-white",
  "bg-violet-500 text-white",
  "bg-emerald-500 text-white",
  "bg-sky-500 text-white",
  "bg-stone-500 text-white",
  "bg-neutral-500 text-white",
  "bg-blue-700 text-white",
  "bg-green-700 text-white",
  "bg-red-700 text-white",
  "bg-yellow-700 text-white",
  "bg-purple-700 text-white",
  "bg-pink-700 text-white",
  "bg-indigo-700 text-white",
  "bg-teal-700 text-white",
  "bg-orange-700 text-white",
  "bg-gray-700 text-white",
  "bg-cyan-700 text-white",
  "bg-lime-700 text-white",
  "bg-amber-700 text-white",
  "bg-fuchsia-700 text-white",
  "bg-rose-700 text-white",
  "bg-violet-700 text-white",
  "bg-emerald-700 text-white",
  "bg-sky-700 text-white",
  "bg-stone-700 text-white",
  "bg-neutral-700 text-white",
];

function getColorClass(seed: string | undefined): string {
  if (!seed) return fallbackColors[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % fallbackColors.length;
  return fallbackColors[idx];
}

function AvatarFallback({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  // Use children (e.g., initials or user id) as seed for color
  const seed =
    typeof children === "string"
      ? children
      : Array.isArray(children) && typeof children[0] === "string"
        ? children[0]
        : undefined;
  const colorClass = getColorClass(seed);
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full",
        colorClass,
        className
      )}
      {...props}
    >
      {children}
    </AvatarPrimitive.Fallback>
  )
}

export { Avatar, AvatarImage, AvatarFallback }