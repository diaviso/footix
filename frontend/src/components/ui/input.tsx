import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border-2 border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#0D1512] px-4 py-2 text-sm text-[#1A2E23] dark:text-[#E8F0EC] ring-offset-background transition-all duration-300",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#1A2E23] dark:file:text-[#E8F0EC]",
          "placeholder:text-[#5A7265] dark:placeholder:text-[#8BA898]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E3D]/20 dark:focus-visible:ring-[#3D9A6A]/20 focus-visible:ring-offset-2 focus-visible:border-[#1B5E3D] dark:focus-visible:border-[#3D9A6A]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-[#1B5E3D]/50 dark:hover:border-[#3D9A6A]/50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
