import { BidColor, BidItem, BidActivity } from "../types/bid";
import { FirebaseService } from "./FirebaseService";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "../utils/LocalStorage";

export class BidService {
  private static readonly COLLECTION_PATH = "bid-item";
  private static readonly COLOR_COLLECTION = "bid-item-color";
  private static db: any;

  private static async ensureDatabase() {
    if (!this.db) {
      this.db = await FirebaseService.getFirebaseDatabase();
    }
    FirebaseService.ensureInitialized();
  }

  public static async getBidItems(): Promise<Record<string, BidItem>> {
    try {
      await this.ensureDatabase();
      const items: BidItem[] = await FirebaseService.getDocuments(
        this.COLLECTION_PATH,
      );

      const bidItemList = items.reduce((acc: Record<string, BidItem>, item) => {
        acc[item.id] = item;
        return acc;
      }, {});

      return bidItemList;
    } catch (error) {
      throw new Error(`Error fetching bid item: ${(error as Error).message}`);
    }
  }

  public static async getBiditemById(itemId: string): Promise<BidItem> {
    try {
      await this.ensureDatabase();
      const item = await FirebaseService.getDocumentById(
        this.COLLECTION_PATH,
        itemId,
      );
      if (!item) throw new Error("Bid item not found");
      return item as BidItem;
    } catch (error) {
      throw new Error(`Error fetching bid item: ${(error as Error).message}`);
    }
  }

  public static async getBidItemColors(): Promise<Record<string, BidColor>> {
    try {
      await this.ensureDatabase();
      const items: BidColor[] =
        await FirebaseService.getDocuments("bid-item-color");

      const bidItemColorList = items.reduce(
        (acc: Record<string, BidColor>, item) => {
          acc[item.id] = item;
          return acc;
        },
        {},
      );

      return bidItemColorList;
    } catch (error) {
      throw new Error(`Error fetching bid item: ${(error as Error).message}`);
    }
  }

  public static async getBiditemColorByItemId(
    itemId: string,
  ): Promise<BidColor[]> {
    try {
      await this.ensureDatabase();
      const colors = await FirebaseService.getDocuments(this.COLOR_COLLECTION, {
        bidItemId: itemId,
      });
      if (!colors.length) throw new Error("No colors found for this item");
      return colors as BidColor[];
    } catch (error) {
      throw new Error(
        `Error fetching bid item colors: ${(error as Error).message}`,
      );
    }
  }

  public static async getBiddingActivityListByItemId(
    itemId: string,
    userId?: string,
  ): Promise<any[]> {
    try {
      await this.ensureDatabase();
      const items = await FirebaseService.getDocuments(
        "bid-activity",
        userId
          ? {
              itemId,
              userId,
            }
          : {
              itemId,
            },
      );

      // Group by bidNumber and find highest bid for each
      const highestBids = items.reduce((acc: { [key: number]: any }, curr) => {
        if (!acc[curr.bidNumber] || acc[curr.bidNumber].amount < curr.amount) {
          acc[curr.bidNumber] = curr;
        }
        return acc;
      }, {});

      // Convert the object back to array
      return Object.values(highestBids);
    } catch (error) {
      throw new Error(`Error fetching bid item: ${(error as Error).message}`);
    }
  }

  public static async getFinalBiddingActivityList(
    itemId: string,
  ): Promise<BidActivity[]> {
    try {
      // Check if data is available in local storage
      const cachedData = getLocalStorageItem(
        `finalBiddingActivityList_${itemId}`,
      );
      if (cachedData) {
        return JSON.parse(cachedData) as BidActivity[];
      }

      await this.ensureDatabase();
      const items: BidActivity[] = await FirebaseService.getDocuments(
        "bid-activity",
        {
          itemId,
        },
      );

      // Group by bidNumber and find highest bid for each
      const highestBids = items.reduce((acc: { [key: number]: any }, curr) => {
        if (!acc[curr.bidNumber] || acc[curr.bidNumber].amount < curr.amount) {
          acc[curr.bidNumber] = curr;
        }
        return acc;
      }, {});

      // Convert the object back to array
      const finalBids = Object.values(highestBids) as BidActivity[];
      const sortedBids = finalBids.sort((a, b) => b.amount - a.amount);

      // Cache the result in local storage
      setLocalStorageItem(
        `finalBiddingActivityList_${itemId}`,
        JSON.stringify(sortedBids),
      );

      return sortedBids;
    } catch (error) {
      throw new Error(`Error fetching bid item: ${(error as Error).message}`);
    }
  }

  public static async getTopBidAmountByBidNumberAndItemId(
    bidNumber: number,
    itemId: string,
  ): Promise<number> {
    try {
      await this.ensureDatabase();
      const activities = await FirebaseService.getDocuments("bid-activity", {
        bidNumber,
        itemId,
      });

      if (!activities.length) return 0;

      // Find the highest bid amount
      const topBid = activities.reduce((max, curr) => {
        return curr.amount > max ? curr.amount : max;
      }, 0);

      return topBid;
    } catch (error) {
      throw new Error(
        `Error fetching top bid amount: ${(error as Error).message}`,
      );
    }
  }

  public static async createBidActivity(
    activity: Omit<BidActivity, "id">,
  ): Promise<void> {
    try {
      await this.ensureDatabase();
      const activityData = {
        amount: activity.amount,
        bidItemColorId: activity.bidItemColorId,
        bidNumber: activity.bidNumber,
        createdAt: activity.createdAt,
        itemId: activity.itemId,
        name: activity.name,
        userId: activity.userId,
      };
      await FirebaseService.addDocument("bid-activity", activityData);
    } catch (error) {
      throw new Error(
        `Error creating bid activity: ${(error as Error).message}`,
      );
    }
  }
}
