import React from "react";
import { BidActivity, BidColor } from "../types/bid";
import { BidService } from "../services/BidService";
import Page from "../components/Page";
import RealtimeFeed from "../components/RealtimeFeed";
import { useParams } from "react-router";
import ItemVertical from "../components/ItemVertical";

const BidEnd: React.FC = () => {
  const { itemId } = useParams();

  const useBidData = (itemId: string | undefined) => {
    const [finalBidedItems, setFinalBidedItems] = React.useState<BidActivity[]>(
      [],
    );
    const [topHighestBid, setHighestBid] = React.useState<BidActivity | null>(
      null,
    );
    const [bidColors, setAppBidItemColors] = React.useState<BidColor[]>([]);
    const bidItemColorId = "";

    const selectedThumbnail = React.useMemo(() => {
      if (bidItemColorId) {
        const color = bidColors.find((c: BidColor) => c.id === bidItemColorId);
        return color?.thumbnail || null;
      }
      return bidColors[0]?.thumbnail || null;
    }, [bidItemColorId, bidColors]);

    const selectedColorName = React.useMemo(() => {
      if (bidItemColorId) {
        const color = bidColors.find((c: BidColor) => c.id === bidItemColorId);
        return color?.name || null;
      }
      return bidColors[0]?.name || null;
    }, [bidItemColorId, bidColors]);

    React.useEffect(() => {
      if (!itemId) return;

      const fetchItems = async (id: string) => {
        const finalBidedItems =
          await BidService.getFinalBiddingActivityList(id);
        setFinalBidedItems(finalBidedItems);
      };

      fetchItems(itemId);
    }, [itemId]);

    React.useEffect(() => {
      if (finalBidedItems.length !== 0) {
        const highestBid = finalBidedItems.reduce((prev, current) => {
          return prev.amount > current.amount ? prev : current;
        });
        setHighestBid(highestBid);
      }
    }, [finalBidedItems]);

    React.useEffect(() => {
      const fetchBidItemColors = async () => {
        const colors = await BidService.getBiditemColorByItemId(itemId || "");
        setAppBidItemColors(colors);
      };

      fetchBidItemColors();
    }, [itemId]);

    return {
      finalBidedItems,
      topHighestBid,
      bidColors: bidColors,
      selectedThumbnail,
      selectedColorName,
    };
  };

  const {
    finalBidedItems,
    topHighestBid,
    selectedThumbnail,
    selectedColorName,
  } = useBidData(itemId);

  // TODO: make it to layout & re-use on item-detail page.
  return (
    <Page>
      <div className="mx-auto min-h-[calc(100vh-4rem)] px-2 py-4 lg:px-36">
        <div className="py-8">
          <div className="font-lilita-one-regular text-primary text-center text-3xl">
            Auction has ended! 🎉
          </div>
          <div className="bid-end-sub-title text-center text-xl">
            Thank you for being part of this exciting auction!
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-4">
          {/* Column 1 - Image Card - takes up 4 columns (1/3) */}
          {topHighestBid ? (
            <div className="min-h-[40vh] md:col-span-4">
              {itemId && (
                <ItemVertical
                  bidActivity={topHighestBid}
                  selectedThumbnail={selectedThumbnail as string}
                  selectedColorName={selectedColorName as string}
                />
              )}
            </div>
          ) : (
            <></>
          )}

          {/* Column 2 - List Card - takes up 8 columns (2/3) */}
          <div className="flex flex-col md:col-span-8">
            {/* First Container - Realtime Monitor */}
            <div
              className="card-fade-container py-auto flex h-[576px] flex-col rounded-lg"
              style={{ gap: "12px" }}
            >
              <div className="font-lilita-one-regular text-primary text-center text-3xl">
                🏆 Our Top Winners 🏆
              </div>
              {/* Scrollable List Container */}
              <RealtimeFeed list={finalBidedItems} />
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default BidEnd;
