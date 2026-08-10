import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
} from "@uipath/apollo-wind";
import { type ChangeEvent, useState } from "react";
import { useWidgetTranslation } from "../i18n/useWidgetTranslation";

interface FeedbackDialogProps {
  open: boolean;
  isPositive: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (comment: string) => void;
  onCancel: () => void;
}

export const FeedbackDialog = ({
  open,
  isPositive,
  onOpenChange,
  onSubmit,
  onCancel,
}: FeedbackDialogProps) => {
  const { t } = useWidgetTranslation();
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onSubmit(comment);
    setComment("");
  };

  const handleCancel = () => {
    setComment("");
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isPositive
              ? t("feedback_title_optional")
              : t("feedback_title_required")}
          </DialogTitle>
        </DialogHeader>
        <Textarea
          value={comment}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setComment(e.target.value)
          }
          placeholder={t("feedback_placeholder")}
          className="placeholder:text-[var(--color-foreground-de-emp)] placeholder:opacity-100"
        />
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isPositive && comment.trim() === ""}
          >
            {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
