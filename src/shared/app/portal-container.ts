import { createContext, useContext } from "react";

// the phone iframe's body, so a popover opened inside the phone renders inside it too
export const PortalContainer = createContext<HTMLElement | null>(null);

export const usePortalContainer = () => useContext(PortalContainer) ?? undefined;
