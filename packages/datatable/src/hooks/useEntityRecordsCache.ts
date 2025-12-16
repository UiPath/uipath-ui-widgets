import { EntityRecord, UiPath } from '@uipath/uipath-typescript';
import { useCallback, useRef, useEffect } from 'react';

class EntityRecordsCache {
  private static cache = new Map<string, EntityRecord[]>();

  static async getRecords(sdk: UiPath, entityId: string): Promise<EntityRecord[]> {
    const cached = this.cache.get(entityId);
    if (cached) {
      return cached;
    }
    const records = (await sdk.entities.getRecordsById(entityId)).items;
    this.cache.set(entityId, records);
    return records;
  }

  static clearCache(entityId?: string): void {
    if (entityId) {
      this.cache.delete(entityId);
    } else {
      this.cache.clear();
    }
  }
}

export const useEntityRecordsCache = (sdk: UiPath) => {
  const sdkRef = useRef(sdk);

  useEffect(() => {
    sdkRef.current = sdk;
  }, [sdk]);

  const getRecords = useCallback(async (entityId: string) => {
    return EntityRecordsCache.getRecords(sdkRef.current, entityId);
  }, []);

  const clearCache = useCallback((entityId?: string) => {
    EntityRecordsCache.clearCache(entityId);
  }, []);

  return { getRecords, clearCache };
};
