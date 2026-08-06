import { UiPath } from "@uipath/uipath-typescript/core";
import { useCallback, useState } from "react";

const STORAGE_KEY_PREFIX = "uipath-ui-widgets.conv-agent-favorites";

const storageKeyForSdk = (sdk: UiPath): string => {
  const { orgName, tenantName } = sdk.config;
  return `${STORAGE_KEY_PREFIX}:${encodeURIComponent(orgName)}:${encodeURIComponent(tenantName)}`;
};

const load = (key: string): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(
      Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [],
    );
  } catch {
    return new Set();
  }
};

const save = (key: string, favorites: Set<string>) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(favorites)));
  } catch {
    // ignore quota / privacy-mode errors
  }
};

export interface UseFavoritesResult {
  favorites: Set<string>;
  toggle: (key: string) => void;
}

export const useFavorites = (sdk: UiPath): UseFavoritesResult => {
  const [favorites, setFavorites] = useState<Set<string>>(() =>
    load(storageKeyForSdk(sdk)),
  );

  const toggle = useCallback(
    (key: string) => {
      const storageKey = storageKeyForSdk(sdk);
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        save(storageKey, next);
        return next;
      });
    },
    [sdk],
  );

  return { favorites, toggle };
};
