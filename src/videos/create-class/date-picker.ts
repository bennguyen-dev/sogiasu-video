import type { Box } from "../../shared/tutorial/AppScreen";

// day 1 of October 2026 in the app's DatePicker (Thursday, first row of a Monday-first grid), measured off a
// rendered frame relative to the picker's trigger; the popover opens start-aligned under it, so it holds for any trigger
export const dayOne = (trigger: Box) => ({ x: trigger.x + 126, y: trigger.y + trigger.h + 108 });
