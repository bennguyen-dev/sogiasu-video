import type React from "react";
import { XIcon } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { cn } from "@/shared/lib/utils";
import { usePortalContainer } from "../portal-container";

export { Sheet, SheetClose, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "../../../../../studying-report/src/shared/components/ui/sheet";

// the app's SheetContent, portalled into the app's iframe instead of the video's own body
export function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <SheetPrimitive.Portal container={usePortalContainer()}>
      <SheetPrimitive.Overlay data-slot="sheet-overlay" className="fixed inset-0 z-50 bg-black/50" />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover shadow-lg",
          side === "right" && "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" && "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" && "inset-x-0 top-0 h-auto border-b",
          side === "bottom" && "inset-x-0 bottom-0 h-auto border-t",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}
