import type {
  ICompactFieldsFormStandaloneWcEventMap,
  ICompactFieldsFormStandaloneWcJsxProps,
} from "@uipath/du-validation-station-wc";
import { useWcRef } from "../bindWcEvents.js";
import { DU_WC_TAGS } from "../loadValidationStationWc.js";
import { createSaveHandlers } from "../saveHandlers.js";
import { renderWcElement, resolveArtifacts } from "./shared.js";
import type { CompactFieldsFormProps } from "./types.js";
import { useWcElement } from "./useWcElement.js";

/**
 * React wrapper for `<ui-du-compact-fields-form-standalone-wc-element>` — the
 * extraction-fields panel without a document viewer. The only save-capable
 * subcomponent: given `sdk` + `data` + a folder id it persists the submit and
 * draft flows itself, exactly as `ValidationStation` does, and reports through
 * the same callbacks either way.
 */
export const CompactFieldsForm: React.FC<CompactFieldsFormProps> = ({
  sdk,
  data,
  folderId,
  artifacts: providedArtifacts,
  documentId: documentIdProp,
  instanceId,
  theme,
  language,
  isReadonly,
  persistent,
  className,
  style,
  options,
  save,
  enableSaveAsDraft = true,
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
  onSaveResult,
  onSubmit,
  onSaveAsDraft,
  onReportException,
}) => {
  const {
    artifacts,
    error,
    wcReady,
    tag,
    commonProps,
    canPersist,
    resolvedFolderId,
  } = useWcElement({
    baseTag: DU_WC_TAGS.compactFieldsForm,
    dataSource: {
      sdk,
      data,
      folderId,
      artifacts: providedArtifacts,
      documentId: documentIdProp,
    },
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

  const { handleSubmit, handleSaveAsDraft, handleException } =
    createSaveHandlers(
      { sdk, data, resolvedFolderId, canPersist },
      { onSubmit, onSaveAsDraft, onReportException },
    );

  const ref = useWcRef<ICompactFieldsFormStandaloneWcEventMap>(
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
      saveResult: onSaveResult,
      saveValidatedDataRequest: handleSubmit,
      saveValidatedDataAsDraftRequest: handleSaveAsDraft,
      saveExceptionReportRequest: handleException,
    },
    persistent,
  );

  const gate = resolveArtifacts(error, wcReady, artifacts);
  if (!gate.ready) return gate.fallback;
  const { taxonomy, extractionResult, customizationInfo } = gate.artifacts;

  const props: ICompactFieldsFormStandaloneWcJsxProps = {
    ...commonProps,
    enableSaveAsDraft,
    options,
    save,
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
