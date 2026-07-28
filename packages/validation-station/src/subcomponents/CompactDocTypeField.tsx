import type {
  ICompactDocTypeFieldStandaloneWcEventMap,
  ICompactDocTypeFieldStandaloneWcJsxProps,
} from "@uipath/du-validation-station-wc";
import { useWcRef } from "../bindWcEvents.js";
import { DU_WC_TAGS } from "../loadValidationStationWc.js";
import { renderWcElement, resolveArtifacts } from "./shared.js";
import type { CompactDocTypeFieldProps } from "./types.js";
import { useWcElement } from "./useWcElement.js";

/**
 * React wrapper for `<ui-du-compact-doc-type-field-standalone-wc-element>` — a
 * lightweight document-type selector. Share its store with a fields-form /
 * viewer via a common `instanceId` so a document-type change propagates.
 */
export const CompactDocTypeField: React.FC<CompactDocTypeFieldProps> = ({
  instanceId,
  theme,
  language,
  isReadonly,
  persistent,
  className,
  style,
  options,
  onLoaded,
  onDocumentTypeChanged,
  onPanelOpenChange,
  ...dataSource
}) => {
  const { artifacts, error, wcReady, tag, commonProps } = useWcElement({
    baseTag: DU_WC_TAGS.compactDocTypeField,
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
  const ref = useWcRef<ICompactDocTypeFieldStandaloneWcEventMap>(
    {
      loaded: onLoaded,
      documentTypeChanged: onDocumentTypeChanged,
      panelOpenChange: onPanelOpenChange,
    },
    persistent,
  );

  const gate = resolveArtifacts(error, wcReady, artifacts);
  if (!gate.ready) return gate.fallback;
  const { taxonomy, extractionResult, customizationInfo } = gate.artifacts;

  const props: ICompactDocTypeFieldStandaloneWcJsxProps = {
    ...commonProps,
    options,
    taxonomy,
    extractionResult,
    customizationInfo,
  };

  return renderWcElement(tag, props, ref);
};
