import * as React from "react"
import { cn } from "@/lib/utils"

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-brand-badge-bg border border-brand-border text-brand-text-secondary",
    secondary: "bg-brand-elevated border border-brand-border text-brand-text-primary",
    accent: "bg-brand-accent text-brand-bg border-0",
    success: "bg-brand-success text-white border-0",
    warning: "bg-brand-warning text-white border-0",
    danger: "bg-brand-danger text-white border-0",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
