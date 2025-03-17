import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export const CACHE_KEYS = {
  userActivities: (userId: string) => ["user-activities", userId],
  appActivities: () => ["app-activities"],
  bidItems: () => ["bid-items"],
  bidItemColors: () => ["bid-item-colors"],
};

export const invalidateUserActivities = (userId: string) => {
  queryClient.invalidateQueries({
    queryKey: CACHE_KEYS.userActivities(userId),
  });
};

export const invalidateAppActivities = () => {
  queryClient.invalidateQueries({
    queryKey: CACHE_KEYS.appActivities(),
  });
};

export const invalidateBidItems = () => {
  queryClient.invalidateQueries({
    queryKey: CACHE_KEYS.bidItems(),
  });
};

export const invalidateBidItemColors = () => {
  queryClient.invalidateQueries({
    queryKey: CACHE_KEYS.bidItemColors(),
  });
};
