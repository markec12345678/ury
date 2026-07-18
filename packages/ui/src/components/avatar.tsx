import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        default: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-lg",
      },
    },
    defaultVariants: {
      size: "default",
      shape: "circle",
    },
  }
)

const avatarFallbackVariants = cva(
  "flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground",
  {
    variants: {
      color: {
        default: "bg-gray-200 text-gray-600",
        primary: "bg-primary/10 text-primary",
        success: "bg-green-100 text-green-700",
        warning: "bg-orange-100 text-orange-700",
        danger: "bg-red-100 text-red-700",
        info: "bg-blue-100 text-blue-700",
      },
    },
    defaultVariants: {
      color: "default",
    },
  }
)

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  color?: "default" | "primary" | "success" | "warning" | "danger" | "info"
  status?: "online" | "offline" | "busy" | "away"
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, shape, src, alt, fallback, color, status, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false)
    const showImage = src && !imageError

    // Generate initials from fallback text
    const initials = React.useMemo(() => {
      if (!fallback) return "?"
      return fallback
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }, [fallback])

    const statusColors: Record<string, string> = {
      online: "bg-green-500",
      offline: "bg-gray-400",
      busy: "bg-red-500",
      away: "bg-yellow-500",
    }

    return (
      <div className={cn("relative inline-flex", className)} ref={ref} {...props}>
        <div className={cn(avatarVariants({ size, shape }))}>
          {showImage ? (
            <img
              src={src}
              alt={alt || fallback || "Avatar"}
              className="aspect-square h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={cn(avatarFallbackVariants({ color }), shape === "square" && "rounded-lg")}>
              {initials}
            </div>
          )}
        </div>
        {status && (
          <span
            className={cn(
              "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
              statusColors[status],
              size === "xs" && "h-1.5 w-1.5",
              size === "sm" && "h-2 w-2",
              (!size || size === "default") && "h-2.5 w-2.5",
              size === "lg" && "h-3 w-3",
              size === "xl" && "h-3.5 w-3.5"
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = "Avatar"

export { Avatar, avatarVariants, avatarFallbackVariants }
