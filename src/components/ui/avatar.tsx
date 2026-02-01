import React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

interface AvatarImageProps {
  src: string
  alt?: string
  className?: string
  width?: number
  height?: number
  unoptimized?: boolean
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
)
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  AvatarImageProps
>(({ className, alt = "", src, width = 90, height = 90, unoptimized = true }, ref) => (
  <Image
    ref={ref}
    src={src}
    width={width}
    height={height}
    unoptimized={unoptimized}
    className={cn("aspect-square h-full w-full", className)}
    alt={alt}
  />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
