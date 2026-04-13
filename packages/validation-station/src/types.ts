export type {
  IDeleteFieldValueParameters,
  IDeleteTableCellValueParameters,
  ISelectAndFocusFieldValueParams,
  ISetFieldValueParameters,
  ISetTableCellValueParameters,
  IValidationStationOptions,
} from "@uipath/du-shared-util-mfe";
import type {
  IDeleteFieldValueParameters,
  IDeleteTableCellValueParameters,
  ISelectAndFocusFieldValueParams,
  ISetFieldValueParameters,
  ISetTableCellValueParameters,
  IValidationStationOptions,
  ContentValidationData,
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
  setFieldValue?: ISetFieldValueParameters[];
  setTableCellValue?: ISetTableCellValueParameters[];
  deleteFieldValue?: IDeleteFieldValueParameters[];
  deleteTableCellValue?: IDeleteTableCellValueParameters[];
  selectAndFocusFieldValue?: ISelectAndFocusFieldValueParams;
}
