import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "a11y-peer a11y-inline-flex a11y-h-6 a11y-w-11 a11y-shrink-0 a11y-cursor-pointer a11y-items-center a11y-rounded-full a11y-border-2 a11y-border-transparent a11y-transition-colors focus-visible:a11y-outline-none focus-visible:a11y-ring-2 focus-visible:a11y-ring-ring focus-visible:a11y-ring-offset-2 focus-visible:a11y-ring-offset-background disabled:a11y-cursor-not-allowed disabled:a11y-opacity-50 data-[state=checked]:a11y-bg-primary data-[state=unchecked]:a11y-bg-input",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "a11y-pointer-events-none a11y-block a11y-size-5 a11y-rounded-full a11y-bg-background a11y-shadow-lg a11y-ring-0 a11y-transition-transform data-[state=checked]:a11y-translate-x-5 data-[state=unchecked]:a11y-translate-x-0",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
