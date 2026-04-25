import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import {
  clearKeys,
  restoreSnapshot,
  getToolKeys,
  getAllDashboardKeys,
  type ResetSnapshot,
} from "@/lib/resetData";

interface ResetDataButtonProps {
  /** When provided, resets only the keys for this tool. Omit for full dashboard wipe. */
  toolId?: string;
  /** Visual variant. */
  variant?: "ghost" | "outline" | "destructive" | "link";
  /** Compact icon-only style for tool headers. */
  compact?: boolean;
  className?: string;
  /** Optional explicit label override. */
  label?: string;
}

/**
 * Reusable "Reset data" button with confirmation dialog and undo toast.
 * Use inside tools (with toolId) or in Settings (no toolId = full wipe).
 */
export function ResetDataButton({
  toolId,
  variant = "ghost",
  compact = false,
  className,
  label,
}: ResetDataButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const isFull = !toolId;

  const handleConfirm = () => {
    const keys = isFull ? getAllDashboardKeys() : getToolKeys(toolId!);
    if (keys.length === 0) {
      toast.error(t("reset.nothingToReset", "No data to reset"));
      setOpen(false);
      return;
    }

    const snap: ResetSnapshot = clearKeys(keys);
    haptic("medium");
    setOpen(false);

    toast.success(
      isFull
        ? t("reset.fullSuccess", "All dashboard data cleared")
        : t("reset.toolSuccess", "Tool data cleared"),
      {
        description: t(
          "reset.undoHint",
          "You can undo this within 10 seconds.",
        ),
        duration: 10000,
        action: {
          label: t("reset.undo", "Undo"),
          onClick: () => {
            restoreSnapshot(snap);
            toast.success(t("reset.restored", "Data restored"));
          },
        },
      },
    );
  };

  const triggerLabel =
    label ??
    (isFull
      ? t("reset.fullLabel", "Reset all data")
      : t("reset.toolLabel", "Reset data"));

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={compact ? "icon" : "sm"}
          className={cn(
            "gap-2 text-destructive hover:text-destructive hover:bg-destructive/10",
            isFull && !compact && "w-full justify-center font-semibold",
            className,
          )}
          aria-label={triggerLabel}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {!compact && <span>{triggerLabel}</span>}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isFull
              ? t("reset.fullTitle", "Reset all dashboard data?")
              : t("reset.toolTitle", "Reset this tool's data?")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isFull
              ? t(
                  "reset.fullDesc",
                  "All trackers, saved results, and history will be deleted. Your profile and language stay intact. You can undo this for 10 seconds.",
                )
              : t(
                  "reset.toolDesc",
                  "All entries for this tool will be deleted. You can undo this for 10 seconds.",
                )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("reset.cancel", "Cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t("reset.confirm", "Yes, reset")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ResetDataButton;
