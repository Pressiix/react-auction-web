export enum BidItemStatus {
  ACTIVE = "active",
  ENDED = "ended",
}

export interface BidActivity {
  amount: number;
  bidItemColorId: string;
  bidNumber: number;
  createdAt: number; // Firebase timestamp (milliseconds since epoch)
  itemId: string;
  name: string;
  userId: string;
  id: string;
}

type BidColor = {
  id: string;
  name: string;
  thumbnail: string;
  bidItemId: string;
  code: string;
  icon: string;
};

type BidItem = {
  description: string;
  id: string;
  name: string;
  numberEndedAt: number;
  numberStartedAt: number;
  status: string; // TODO: try BidItemStatus
  initialPrice: number;
  biddingPoint: number;
};

export type { BidColor, BidItem };
