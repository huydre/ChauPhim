import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand-primary text-brand-bg hover:bg-brand-primary/90",
        destructive:
          "bg-brand-danger text-white hover:bg-brand-danger/90",
        outline:
          "border border-brand-border bg-transparent hover:bg-brand-elevated text-brand-text-primary",
        secondary:
          "bg-brand-elevated text-brand-text-primary hover:bg-brand-elevated/80",
        ghost: "bg-brand-badge-bg border border-brand-border text-brand-text-primary hover:bg-brand-elevated",
        link: "text-brand-primary underline-offset-4 hover:underline",
        accent: "bg-brand-accent text-brand-bg hover:bg-brand-accent/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
