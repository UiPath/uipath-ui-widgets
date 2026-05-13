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
import { useTranslation } from "react-i18next";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (comment: string) => void;
  onCancel: () => void;
}

export const FeedbackDialog = ({
  open,
  onOpenChange,
  onSubmit,
  onCancel,
}: FeedbackDialogProps) => {
  const { t } = useTranslation();
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("feedback_title_required")}</DialogTitle>
        </DialogHeader>
        <Textarea
          value={comment}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setComment(e.target.value)
          }
          placeholder={t("feedback_placeholder")}
        />
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit}>{t("submit")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
