import type {
  ICompactTableEditorStandaloneWcEventMap,
  ICompactTableEditorStandaloneWcJsxProps,
} from "@uipath/du-validation-station-wc";
import { useWcRef } from "../bindWcEvents.js";
import { DU_WC_TAGS } from "../loadValidationStationWc.js";
import { renderWcElement, resolveArtifacts } from "./shared.js";
import type { CompactTableEditorProps } from "./types.js";
import { useWcElement } from "./useWcElement.js";

/**
 * React wrapper for `<ui-du-compact-table-editor-standalone-wc-element>` — an
 * inline editor for a single extracted table. Edit-only (no save flow): persist
 * via `onExtractionResultChanged` / `onFieldValueChanged` / `onDirtyChange`. It
 * renders a table only while a table field is selected in the store — select
 * one via `selectAndFocusFieldValueByPath` (use `valueIndex: -1` to target the
 * table itself) or from a sibling element sharing the same `instanceId`.
 */
export const CompactTableEditor: React.FC<CompactTableEditorProps> = ({
  instanceId,
  theme,
  language,
  isReadonly,
  persistent,
  className,
  style,
  options,
  isTableSelectionEnabled,
  isDrawingTableSelectionCells,
  applyTableSelection,
  setFieldValueByPath,
  selectAndFocusFieldValueByPath,
  deleteFieldValueByPath,
  discardChanges,
  onLoaded,
  onDirtyChange,
  onDocumentTypeChanged,
  onExtractionResultChanged,
  onFieldValueSelected,
  onFieldValueChanged,
  onBusinessRulesEvaluated,
  onSetFieldValueByPathResult,
  onSelectAndFocusFieldValueByPathResult,
  onDeleteFieldValueByPathResult,
  onTableSelectionEvent,
  onClosed,
  ...dataSource
}) => {
  const { artifacts, error, wcReady, tag, commonProps } = useWcElement({
    baseTag: DU_WC_TAGS.compactTableEditor,
    dataSource,
    common: {
      instanceId,
      theme,
      language,
      isReadonly,
      persistent,
      className,
      style,
    },
  });
  const ref = useWcRef<ICompactTableEditorStandaloneWcEventMap>(
    {
      loaded: onLoaded,
      dirty: onDirtyChange,
      documentTypeChanged: onDocumentTypeChanged,
      extractionResultChanged: onExtractionResultChanged,
      fieldValueSelected: onFieldValueSelected,
      fieldValueChanged: onFieldValueChanged,
      businessRulesEvaluated: onBusinessRulesEvaluated,
      setFieldValueByPathResult: onSetFieldValueByPathResult,
      selectAndFocusFieldValueByPathResult:
        onSelectAndFocusFieldValueByPathResult,
      deleteFieldValueByPathResult: onDeleteFieldValueByPathResult,
      tableSelectionEvent: onTableSelectionEvent,
      closed: onClosed,
    },
    persistent,
  );

  const gate = resolveArtifacts(error, wcReady, artifacts);
  if (!gate.ready) return gate.fallback;
  const { taxonomy, extractionResult, customizationInfo } = gate.artifacts;

  const props: ICompactTableEditorStandaloneWcJsxProps = {
    ...commonProps,
    isTableSelectionEnabled,
    isDrawingTableSelectionCells,
    applyTableSelection,
    options,
    discardChanges,
    setFieldValueByPath,
    selectAndFocusFieldValueByPath,
    deleteFieldValueByPath,
    taxonomy,
    extractionResult,
    customizationInfo,
  };

  return renderWcElement(tag, props, ref);
};
