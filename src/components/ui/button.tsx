import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 shadow-md",
      secondary: "bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg transform hover:-translate-y-0.5 shadow-md",
      outline: "border-2 border-blue-200 bg-white text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transform hover:-translate-y-0.5",
      ghost: "hover:bg-gray-100 text-gray-700 hover:shadow-sm",
      destructive: "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg transform hover:-translate-y-0.5 shadow-md"
    }

    const sizes = {
      default: "px-6 py-2.5 text-sm font-medium",
      sm: "px-4 py-2 text-xs font-medium",
      lg: "px-8 py-3.5 text-base font-semibold",
      xl: "px-10 py-4 text-lg font-semibold",
      icon: "p-2.5 text-sm"
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none active:transform-none",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }