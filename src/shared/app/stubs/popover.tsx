import type React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "@/shared/lib/utils";
import { usePortalContainer } from "../portal-container";

export {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "../../../../../studying-report/src/shared/components/ui/popover";

// the app's PopoverContent, portalled into the phone iframe instead of the video's own body
export function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal container={usePortalContainer()}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
