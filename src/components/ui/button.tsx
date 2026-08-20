import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "a11y-inline-flex a11y-items-center a11y-justify-center a11y-gap-2 a11y-whitespace-nowrap a11y-rounded-md a11y-text-sm a11y-font-medium a11y-ring-offset-background a11y-transition-colors focus-visible:a11y-outline-none focus-visible:a11y-ring-2 focus-visible:a11y-ring-ring focus-visible:a11y-ring-offset-2 disabled:a11y-pointer-events-none disabled:a11y-opacity-50 [&_svg]:a11y-pointer-events-none [&_svg]:a11y-size-4 [&_svg]:a11y-shrink-0",
  {
    variants: {
      variant: {
        default: "a11y-bg-primary a11y-text-primary-foreground hover:a11y-bg-primary/90",
        destructive:
          "a11y-bg-destructive a11y-text-destructive-foreground hover:a11y-bg-destructive/90",
        outline:
          "a11y-border a11y-border-input a11y-bg-background hover:a11y-bg-accent hover:a11y-text-accent-foreground",
        secondary:
          "a11y-bg-secondary a11y-text-secondary-foreground hover:a11y-bg-secondary/80",
        ghost: "hover:a11y-bg-accent hover:a11y-text-accent-foreground",
        link: "a11y-text-primary a11y-underline-offset-4 hover:a11y-underline",
      },
      size: {
        default: "a11y-h-10 a11y-px-4 a11y-py-2",
        sm: "a11y-h-9 a11y-rounded-md a11y-px-3",
        lg: "a11y-h-11 a11y-rounded-md a11y-px-8",
        icon: "a11y-size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
