import { useQuery } from "@tanstack/react-query";
import { BidService } from "../services/BidService";
import { CACHE_KEYS } from "../services/CacheService";
import type { BidItem, BidColor } from "../types/bid";

export const useBidItems = () => {
  const { data: items = {}, isLoading: isLoadingItems } = useQuery({
    queryKey: CACHE_KEYS.bidItems(),
    queryFn: async () => {
      const items = await BidService.getBidItems();
      return items;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const { data: colors = {}, isLoading: isLoadingColors } = useQuery({
    queryKey: CACHE_KEYS.bidItemColors(),
    queryFn: async () => {
      const colors = await BidService.getBidItemColors();
      return colors;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    bidItems: items as Record<string, BidItem>,
    bidItemColors: colors as Record<string, BidColor>,
    isLoading: isLoadingItems || isLoadingColors,
  };
};
