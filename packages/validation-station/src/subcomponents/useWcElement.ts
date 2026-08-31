import type { CSSProperties } from "react";
import { convertToPersistentTag } from "../loadValidationStationWc.js";
import {
  useResolvedArtifacts,
  type ResolvedArtifacts,
  type DuArtifactsSource,
} from "../useResolvedArtifacts.js";
import { ValidationStationLanguage, type DuTheme } from "../types.js";
import { useWcReady } from "../useWcReady.js";
import { wcStyle } from "./shared.js";

/** Presentation + linking props common to every subcomponent wrapper. */
export interface WcElementCommon {
  instanceId?: string;
  theme?: DuTheme;
  language?: ValidationStationLanguage;
  isReadonly?: boolean;
  persistent?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** The common JSX prop block every DU standalone element accepts. */
interface WcCommonProps {
  className?: string;
  style?: Record<string, string | number>;
  "instance-id"?: string;
  documentId?: string;
  theme: DuTheme;
  language: ValidationStationLanguage;
  isReadonly: boolean;
}

export interface WcElementState extends ResolvedArtifacts {
  wcReady: boolean;
  /** Tag actually rendered — the base tag, or its persistent variant. */
  tag: string;
  commonProps: WcCommonProps;
}

/**
 * Shared plumbing for the five subcomponent wrappers: resolves artifacts
 * (pre-fetched or self-fetched), waits for the **actually-rendered** element tag
 * (base vs persistent variant) to upgrade, and assembles the common JSX prop
 * block with defaults applied once. Each wrapper supplies only its event map
 * (via {@link useWcRef}) and element-specific props.
 */
export function useWcElement(params: {
  baseTag: string;
  dataSource: DuArtifactsSource;
  common: WcElementCommon;
}): WcElementState {
  const { baseTag, dataSource, common } = params;
  const persistent = common.persistent ?? false;
  const tag = persistent ? convertToPersistentTag(baseTag) : baseTag;

  const { artifacts, error, documentId } = useResolvedArtifacts(dataSource);
  // Gate on the tag actually rendered, not always the base tag.
  const wcReady = useWcReady(tag);

  const commonProps: WcCommonProps = {
    className: common.className,
    style: wcStyle(common.style),
    "instance-id": common.instanceId,
    documentId,
    theme: common.theme ?? "light",
    language: common.language ?? ValidationStationLanguage.English,
    isReadonly: common.isReadonly ?? false,
  };

  return {
    artifacts,
    error,
    documentId,
    wcReady,
    tag,
    commonProps,
  };
}
