import type {
  ICompactBusinessRulesStandaloneWcEventMap,
  ICompactBusinessRulesStandaloneWcJsxProps,
} from "@uipath/du-validation-station-wc";
import { useWcRef } from "../bindWcEvents.js";
import { DU_WC_TAGS } from "../loadValidationStationWc.js";
import { renderWcElement, resolveArtifacts } from "./shared.js";
import type { CompactBusinessRulesProps } from "./types.js";
import { useWcElement } from "./useWcElement.js";

/**
 * React wrapper for `<ui-du-compact-business-rules-standalone-wc-element>` — a
 * read-only panel surfacing the evaluated business rules for the shared store.
 * Pair it with a fields-form / table-editor via a shared `instanceId`.
 */
export const CompactBusinessRules: React.FC<CompactBusinessRulesProps> = ({
  instanceId,
  theme,
  language,
  isReadonly,
  persistent,
  className,
  style,
  options,
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
  onBusinessRulesToggle,
  onBusinessRuleClick,
  ...dataSource
}) => {
  const { artifacts, error, wcReady, tag, commonProps } = useWcElement({
    baseTag: DU_WC_TAGS.compactBusinessRules,
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
  const ref = useWcRef<ICompactBusinessRulesStandaloneWcEventMap>(
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
      businessRulesToggle: onBusinessRulesToggle,
      businessRuleClick: onBusinessRuleClick,
    },
    persistent,
  );

  const gate = resolveArtifacts(error, wcReady, artifacts);
  if (!gate.ready) return gate.fallback;
  const { taxonomy, extractionResult, customizationInfo } = gate.artifacts;

  const props: ICompactBusinessRulesStandaloneWcJsxProps = {
    ...commonProps,
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
