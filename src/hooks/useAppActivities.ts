import { useQuery } from "@tanstack/react-query";
import { BidService } from "../services/BidService";
import { CACHE_KEYS } from "../services/CacheService";
import type { BidActivity, BidItem } from "../types/bid";

export const useAppActivities = (items: Record<string, BidItem>) => {
  return useQuery({
    queryKey: CACHE_KEYS.appActivities(),
    queryFn: async () => {
      const activities: BidActivity[] = [];
      for (const item of Object.values(items)) {
        if (!item.id) continue;

        const itemActivities = await BidService.getBiddingActivityListByItemId(
          item.id,
        );
        activities.push(...itemActivities);
      }

      return activities;
    },
    enabled: Object.keys(items).length > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
