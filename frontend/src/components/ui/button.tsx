import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E3D]/30 dark:focus-visible:ring-[#3D9A6A]/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#1B5E3D] dark:bg-[#2D7A50] text-white shadow-lg shadow-[#1B5E3D]/25 hover:bg-[#144832] dark:hover:bg-[#1B5E3D] hover:shadow-xl hover:shadow-[#1B5E3D]/30 hover:scale-[1.02] active:scale-[0.98]",
        destructive: "bg-red-600 text-white shadow-lg shadow-red-500/25 hover:bg-red-700 hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02]",
        outline: "border-2 border-[#D1DDD6] dark:border-[#2D3F35] bg-transparent hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26] hover:border-[#1B5E3D] dark:hover:border-[#3D9A6A] text-[#1A2E23] dark:text-[#E8F0EC]",
        secondary: "bg-[#E8F0EC] dark:bg-[#1E2D26] text-[#1B5E3D] dark:text-[#3D9A6A] hover:bg-[#D1DDD6] dark:hover:bg-[#2D3F35]",
        ghost: "hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26] text-[#1A2E23] dark:text-[#E8F0EC]",
        link: "text-[#1B5E3D] dark:text-[#3D9A6A] underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-[#1B5E3D] to-[#2D7A50] text-white shadow-lg shadow-[#1B5E3D]/25 hover:shadow-xl hover:shadow-[#1B5E3D]/30 hover:scale-[1.02] active:scale-[0.98]",
        gold: "bg-[#F5A623] hover:bg-[#D4890A] text-[#1A2E23] shadow-lg shadow-[#F5A623]/25 hover:shadow-xl hover:shadow-[#F5A623]/30 hover:scale-[1.02] active:scale-[0.98]",
        glass: "glass hover:bg-white/90 dark:hover:bg-[#141F1A]/90",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
