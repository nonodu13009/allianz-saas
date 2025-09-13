"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onChange, disabled = false, size = "md", className, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-5 w-9",
      md: "h-6 w-11", 
      lg: "h-7 w-12"
    }

    const thumbSizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6"
    }

    const translateClasses = {
      sm: checked ? "translate-x-4" : "translate-x-0",
      md: checked ? "translate-x-5" : "translate-x-0",
      lg: checked ? "translate-x-5" : "translate-x-0"
    }

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        ref={ref}
        className={cn(
          "relative inline-flex items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked 
            ? "bg-blue-500 hover:bg-blue-600" 
            : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none inline-block transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out",
            thumbSizeClasses[size],
            translateClasses[size]
          )}
        />
      </button>
    )
  }
)

Toggle.displayName = "Toggle"

export { Toggle }
