import { Entities, EntityRecord } from "@uipath/uipath-typescript/entities";
import { useCallback } from "react";

class EntityRecordsCache {
  private static cache = new Map<string, EntityRecord[]>();

  static async getRecords(
    entityService: Entities,
    entityId: string,
  ): Promise<EntityRecord[]> {
    const cached = this.cache.get(entityId);
    if (cached) {
      return cached;
    }
    const records = (await entityService.getRecordsById(entityId)).items;
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

export const useEntityRecordsCache = (entityService: Entities) => {
  const getRecords = useCallback(
    async (entityId: string) => {
      return EntityRecordsCache.getRecords(entityService, entityId);
    },
    [entityService],
  );

  const clearCache = useCallback((entityId?: string) => {
    EntityRecordsCache.clearCache(entityId);
  }, []);

  return { getRecords, clearCache };
};
