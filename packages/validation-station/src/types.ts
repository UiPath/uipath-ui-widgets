import type {
  DeleteFieldValueByPath,
  IValidationStationOptions,
  SelectAndFocusFieldValueByPath,
  SetFieldValueByPath,
} from "@uipath/du-validation-station-wc";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import type { SaveValidatedDataResult } from "./saveValidatedDataUtil";

export type {
  DeleteFieldValueByPath,
  IValidationStationOptions,
  SaveValidatedDataResult,
  SelectAndFocusFieldValueByPath,
  SetFieldValueByPath,
};

export enum ValidationStationLanguage {
  German = "de",
  English = "en",
  Spanish = "es",
  SpanishMexico = "es-MX",
  French = "fr",
  Japanese = "ja",
  Korean = "ko",
  Portuguese = "pt",
  PortugueseBrazil = "pt-BR",
  Romanian = "ro",
  Russian = "ru",
  Turkish = "tr",
  ChineseSimplified = "zh-CN",
  ChineseTraditional = "zh-TW",
}

export interface BucketArtifacts {
  taxonomy: unknown;
  extractionResult: unknown;
  dom: unknown;
  text: string | undefined;
  customizationInfo: unknown;
  original: string | undefined;
}

export interface ValidationStationProps {
  sdk: UiPath;
  data: DuFramework.ContentValidationData;
  folderId?: number;
  theme?: "light" | "dark" | "light-hc" | "dark-hc";
  language?: ValidationStationLanguage;
  isReadonly?: boolean;
  enableSaveAsDraft?: boolean;
  options?: IValidationStationOptions;
  save?: { validate: boolean };
  discardChanges?: { value: boolean };
  setFieldValueByPath?: SetFieldValueByPath;
  selectAndFocusFieldValueByPath?: SelectAndFocusFieldValueByPath;
  deleteFieldValueByPath?: DeleteFieldValueByPath;
  /**
   * Fired after the save flow finishes (ProcessExtractedData + bucket upload).
   * `result.success` is `false` on any failure — the host app decides whether
   * to retry, complete the task, surface an error, etc.
   */
  onSaveComplete?: (result: SaveValidatedDataResult) => void;
}
