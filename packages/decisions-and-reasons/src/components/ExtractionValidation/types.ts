import type {
  FieldRenderProps,
  ReviewProps,
  ValueField,
} from "../../models/props";

export type DocumentLineItem = { id: string; fields: ValueField[] };

export interface ExtractionValidationProps
  extends ReviewProps, FieldRenderProps<ValueField> {
  fields: ValueField[];
  lineItems?: DocumentLineItem[];
}
