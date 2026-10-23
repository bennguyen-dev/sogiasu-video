import { Check, RefreshCw, Search, Trash2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import SelectAllCheckbox from "@/shared/components/SelectAllCheckbox";
import {
  DynamicModal,
  DynamicModalContent,
  DynamicModalDescription,
  DynamicModalFooter,
  DynamicModalHeader,
  DynamicModalTitle,
} from "@/shared/components/ui/DynamicModal";
import { cn } from "@/shared/lib/utils";
import type { Box } from "../../shared/tutorial/AppScreen";
import { CLASS_LIST } from "./data";

// CalendarFilterButton's dialog on its class tab, with the ticked class handed in by the frame: its own checkboxes
// don't take a scripted click in the phone frame, and this keeps the tick on the tap
export const FilterDialog = ({
  open,
  checkedId,
}: {
  readonly open: boolean;
  readonly checkedId: string | null;
}) => {
  const t = useTranslations("calendar");
  return (
    <DynamicModal open={open}>
      <DynamicModalContent className="sm:max-w-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DynamicModalHeader>
          <DynamicModalTitle>{t("filter.title")}</DynamicModalTitle>
          <DynamicModalDescription>
            {t("filter.description")}
          </DynamicModalDescription>
        </DynamicModalHeader>
        <div className="flex flex-col gap-3">
          <Tabs value="class">
            <TabsList className="w-full">
              <TabsTrigger value="class">{t("filter.byClass")}</TabsTrigger>
              <TabsTrigger value="student">{t("filter.byStudent")}</TabsTrigger>
            </TabsList>
          </Tabs>
          <InputGroup className="h-10">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value=""
              readOnly
              placeholder={t("filter.search")}
            />
          </InputGroup>
          <div className="max-h-[45vh] overflow-y-auto rounded-md border">
            <SelectAllCheckbox
              selected={checkedId ? 1 : 0}
              total={CLASS_LIST.length}
              onToggleAll={() => {}}
              className="border-b px-3 py-2.5 hover:bg-accent"
            />
            {CLASS_LIST.map((item) => (
              <label
                key={item.id}
                data-class-row={item.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2 py-2.5 pl-8 pr-3 text-sm hover:bg-accent",
                  checkedId === item.id && "bg-accent/60",
                )}
              >
                <Checkbox checked={checkedId === item.id} />
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
              </label>
            ))}
          </div>
        </div>
        <DynamicModalFooter>
          <Button variant="outline" disabled={!checkedId}>
            {t("filter.clear")}
          </Button>
          <Button data-apply>
            <Check className="h-4 w-4" />
            {t("filter.apply")}
          </Button>
        </DynamicModalFooter>
      </DynamicModalContent>
    </DynamicModal>
  );
};

const ITEM =
  "relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm select-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

// LessonDetailHeader's ⋮ menu for a scheduled lesson, opened under its trigger (`anchor`, screen px)
export const DetailMenu = ({ anchor }: { readonly anchor: Box }) => {
  const t = useTranslations("lesson");
  return (
    <div
      data-detail-menu
      className="fixed z-[60] min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      style={{
        top: anchor.y + anchor.h + 4,
        right: `calc(100% - ${anchor.x + anchor.w}px)`,
      }}
    >
      <div className={ITEM}>
        <RefreshCw className="text-muted-foreground" />
        {t("detail.refresh")}
      </div>
      <div className="-mx-1 my-1 h-px bg-border" />
      <div className={cn(ITEM, "text-destructive")} data-cancel-item>
        <XCircle className="text-destructive" />
        {t("detail.cancelLesson")}
      </div>
      <div className={cn(ITEM, "text-destructive")}>
        <Trash2 className="text-destructive" />
        {t("detail.deleteLesson")}
      </div>
    </div>
  );
};
