import { useState, useEffect } from "react";
import {
  ref,
  query,
  orderByChild,
  equalTo,
  onValue,
  DataSnapshot,
  limitToLast,
  // QueryConstraint,
} from "firebase/database";
import { FirebaseService } from "../services/FirebaseService";
import { BidActivity } from "../types/bid";

// Add type for sort direction
type SortDirection = "asc" | "desc";

/**
 * Custom hook to fetch and monitor bid activity for a specific item
 * @param itemId The ID of the item to fetch bid activity for
 * @returns An array of bid activities
 */
export const useRealtimeFeed = (
  itemId: string,
  bidNumbers: number[] = [],
  limit: number = 15,
): { feedList: BidActivity[] } => {
  const [feedList, setFeedList] = useState<BidActivity[]>([]);

  // Updated where function to handle array queries
  // const where = (
  //   field: string,
  //   values: string | number | number[],
  // ): QueryConstraint[] => {
  //   if (Array.isArray(values)) {
  //     // For array queries, we'll just use orderByChild and handle filtering in memory
  //     return [orderByChild(field), limitToLast(limit)];
  //   }
  //   return [orderByChild(field), equalTo(values), limitToLast(limit)];
  // };

  // Updated sorting helper function
  const sortBy = <T extends Record<K, any>, K extends keyof T>(
    array: T[],
    key: K,
    direction: SortDirection = "asc",
  ): T[] => {
    return [...array].sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];
      return direction === "asc"
        ? valueA < valueB
          ? -1
          : valueA > valueB
            ? 1
            : 0
        : valueA > valueB
          ? -1
          : valueA < valueB
            ? 1
            : 0;
    });
  };

  // Add new utility function for single value query
  const fetchSingleValue = (
    dbRef: any,
    field: string,
    value: string | number,
    onData: (data: BidActivity[]) => void,
  ) => {
    const singleQuery = query(
      dbRef,
      orderByChild(field),
      equalTo(value),
      limitToLast(limit),
    );

    return onValue(singleQuery, (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val()) as BidActivity[];
        onData(data);
      } else {
        setFeedList([]);
      }
    });
  };

  // Add this utility function before useEffect
  const getMaxAmountPerBidNumber = (
    activities: BidActivity[],
  ): BidActivity[] => {
    const groupedByBidNumber = activities.reduce(
      (acc, activity) => {
        if (!acc[activity.bidNumber]) {
          acc[activity.bidNumber] = activity;
        } else if (activity.amount > acc[activity.bidNumber].amount) {
          acc[activity.bidNumber] = activity;
        }
        return acc;
      },
      {} as Record<number, BidActivity>,
    );

    return Object.values(groupedByBidNumber);
  };

  useEffect(() => {
    try {
      const db = FirebaseService.getFirebaseDatabase();
      if (!db) {
        throw new Error("Firebase database is null after initialization check");
      }

      const bidActivityRef = ref(db, "bid-activity");
      const unsubscribes: Array<() => void> = [];

      if (Array.isArray(bidNumbers) && bidNumbers.length > 0) {
        // Handle array of values
        let combinedResults: BidActivity[] = [];
        const seenIds = new Set<string>();

        bidNumbers.forEach((value) => {
          const unsubscribe = fetchSingleValue(
            bidActivityRef,
            "bidNumber",
            value,
            (data) => {
              // Deduplicate results based on some unique identifier (e.g., timestamp or id)
              combinedResults = [
                ...combinedResults,
                ...data.filter((item) => {
                  if (!seenIds.has(item.createdAt.toString())) {
                    seenIds.add(item.createdAt.toString());
                    return true;
                  }
                  return false;
                }),
              ];

              const sortedResults = sortBy<BidActivity, "amount">(
                combinedResults,
                "amount",
                "desc",
              );
              setFeedList(sortedResults);
            },
          );
          unsubscribes.push(unsubscribe);
        });
      } else {
        // Handle single value query - removed limitToLast from initial query
        const singleQuery = query(
          bidActivityRef,
          orderByChild("itemId"),
          equalTo(itemId),
        );

        const handleData = (snapshot: DataSnapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const bidActivityArray = Object.values(data) as BidActivity[];
            // Group by bidNumber and get max amount for each - limit is applied inside this function
            const maxAmountPerBidNumber =
              getMaxAmountPerBidNumber(bidActivityArray);

            // Sort by amount in descending order
            const sortedResults = sortBy<BidActivity, "amount">(
              maxAmountPerBidNumber,
              "amount",
              "desc",
            );

            setFeedList(sortedResults);
          } else {
            setFeedList([]);
          }
        };

        const unsubscribe = onValue(singleQuery, handleData);
        unsubscribes.push(unsubscribe);
      }

      // Clean up all listeners
      return () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      };
    } catch (error) {
      console.error("Firebase initialization error:", error);
      setFeedList([]);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, bidNumbers, limit]);

  return { feedList };
};
