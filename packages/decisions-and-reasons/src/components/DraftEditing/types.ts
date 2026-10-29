import type {
  FieldRenderProps,
  ReviewProps,
  ValueField,
} from "../../models/props";

export interface DraftEditingProps
  extends ReviewProps, FieldRenderProps<ValueField> {
  fields: ValueField[];
}
