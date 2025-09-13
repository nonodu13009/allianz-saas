import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-allianz",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
        danger: "bg-danger-500 text-white hover:bg-danger-600 shadow-allianz",
        success: "bg-success-500 text-white hover:bg-success-600 shadow-allianz",
        warning: "bg-warning-500 text-white hover:bg-warning-600 shadow-allianz",
        info: "bg-info-500 text-white hover:bg-info-600 shadow-allianz",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-11 px-6 text-lg",
        icon: "h-10 w-10",
      },
      tone: {
        default: "",
        subtle: "opacity-80 hover:opacity-100",
        bold: "font-semibold",
      },
      density: {
        comfortable: "px-4 py-2",
        compact: "px-3 py-1.5",
        spacious: "px-6 py-3",
      },
      state: {
        default: "",
        loading: "opacity-70 cursor-not-allowed",
        disabled: "opacity-50 cursor-not-allowed",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      tone: "default",
      density: "comfortable",
      state: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, tone, density, state, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, tone, density, state, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
