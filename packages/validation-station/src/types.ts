export type {
  DeleteFieldValueByPath,
  IValidationStationOptions,
  SelectAndFocusFieldValueByPath,
  SetFieldValueByPath,
} from "@uipath/du-shared-util-mfe";
import type {
  ContentValidationData,
  DeleteFieldValueByPath,
  IValidationStationOptions,
  SelectAndFocusFieldValueByPath,
  SetFieldValueByPath,
} from "@uipath/du-shared-util-mfe";
import type { UiPath } from "@uipath/uipath-typescript/core";

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
  data: ContentValidationData;
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
   * Base URL where the validation station web component assets
   * (main.js, polyfills.js) are served. Defaults to
   * "node_modules/@uipath/du-validation-station-wc", which works with Vite's
   * dev server. For production builds, copy the contents of
   * node_modules/@uipath/du-validation-station-wc into your public assets and
   * point this prop at that location.
   */
  wcAssetsUrl?: string;
}
