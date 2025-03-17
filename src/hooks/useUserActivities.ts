import { useQuery } from "@tanstack/react-query";
import { BidService } from "../services/BidService";
import { CACHE_KEYS } from "../services/CacheService";
import type { BidActivity, BidItem } from "../types/bid";

export const useUserActivities = (
  userId: string | undefined,
  items: Record<string, BidItem>,
) => {
  return useQuery({
    queryKey: CACHE_KEYS.userActivities(userId || ""),
    queryFn: async () => {
      if (!userId) return [];

      const activities: BidActivity[] = [];
      for (const item of Object.values(items)) {
        if (!item.id) continue;

        const userItemActivities =
          await BidService.getBiddingActivityListByItemId(item.id, userId);
        activities.push(...userItemActivities);
      }

      return activities;
    },
    enabled: !!userId && Object.keys(items).length > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
