import type { FC } from "react";
import { useCapture } from "../../hooks/useCapture";
import type { ReviewPart } from "../../models/capture";
import { ReasonChips } from "./ReasonChips";

export const PartReasons: FC<{
  part: ReviewPart;
  question: string;
  options: readonly string[];
  placeholder?: string;
}> = ({ part, question, options, placeholder }) => {
  const { locked, toggleWhy, editNote } = useCapture();
  return (
    <ReasonChips
      question={question}
      options={options}
      pick={{ why: part.why, note: part.note }}
      disabled={locked}
      placeholder={placeholder}
      onToggle={(why) => toggleWhy(part.id, why)}
      onNote={(note) => editNote(part.id, note)}
    />
  );
};
