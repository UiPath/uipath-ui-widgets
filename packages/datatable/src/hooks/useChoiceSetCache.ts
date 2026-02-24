import {
  ChoiceSets,
  ChoiceSetGetResponse,
} from "@uipath/uipath-typescript/entities";
import { useCallback } from "react";

class ChoiceSetCache {
  private static cache = new Map<string, ChoiceSetGetResponse[]>();

  static async getValues(
    choiceSetService: ChoiceSets,
    choiceSetId: string,
  ): Promise<ChoiceSetGetResponse[]> {
    const cached = this.cache.get(choiceSetId);
    if (cached) {
      return cached;
    }
    const response = await choiceSetService.getById(choiceSetId);
    const values = response.items;
    this.cache.set(choiceSetId, values);
    return values;
  }

  static clearCache(choiceSetId?: string): void {
    if (choiceSetId) {
      this.cache.delete(choiceSetId);
    } else {
      this.cache.clear();
    }
  }
}

export const useChoiceSetCache = (choiceSetService: ChoiceSets) => {
  const getValues = useCallback(
    async (choiceSetId: string) => {
      return ChoiceSetCache.getValues(choiceSetService, choiceSetId);
    },
    [choiceSetService],
  );

  const clearCache = useCallback((choiceSetId?: string) => {
    ChoiceSetCache.clearCache(choiceSetId);
  }, []);

  return { getValues, clearCache };
};
