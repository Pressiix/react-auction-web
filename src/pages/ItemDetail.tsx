import { useNavigate, useParams, useSearchParams } from "react-router";
import Page from "../components/Page";
import { useEffect, useRef, useState } from "react";
import BiddingForm from "../components/BiddingForm";
import { useRealtimeFeed } from "../hooks/useRealtimeFeed";
import { BidService } from "../services/BidService";
import { BidActivity, BidColor, BidItem, BidItemStatus } from "../types/bid";
import RealtimeFeed from "../components/RealtimeFeed";
import { useAuth } from "../hooks/useAuth";
import { getCurrentUnixTimestamp } from "../utils/DateTimeUtils";
import ConfirmBidModal from "../components/ConfirmBidModal";
import { invalidateUserActivities } from "../services/CacheService";
import ColorPicker from "../components/ColorPicker";

const ItemDetail: React.FC = () => {
  const { userInfo } = useAuth();
  const { itemId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Example of getting query parameters
  const [bidNumber, setBidNumber] = useState(
    Number(searchParams.get("bidNumber")),
  );
  const bidItemColorId = useRef<string>(
    searchParams.get("bidItemColorId") ?? "0",
  );

  useEffect(() => {
    let colorId = searchParams.get("bidItemColorId");
    if (!colorId) {
      searchParams.set("bidItemColorId", "0");
      setSearchParams(searchParams);
      colorId = "0";
    }
    bidItemColorId.current = colorId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bidItemColorId.current]);

  const [filteringBiddingNumbers, setFilteringBiddingNumbers] = useState<
    number[]
  >([]);

  const { feedList } = useRealtimeFeed(
    itemId ?? "",
    filteringBiddingNumbers,
    50,
  );
  const [appBidItem, setAppBidItem] = useState<BidItem>();
  const [appBidItemColors, setAppBidItemColors] = useState<BidColor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedBidItemColor = useRef<BidColor>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pendingBid = useRef<{ bidNumber: number; bidAmount: number } | null>(
    null,
  );

  const [bidJustConfirmed, setBidJustConfirmed] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  // Add ref for storing previous bid activity
  const previousSingleModeBidActivity = useRef<BidActivity>(undefined);

  // TODO(@watcharaphonp): This logic will be improved for multiple numbers
  useEffect(() => {
    if (bidNumber) setFilteringBiddingNumbers([bidNumber]);
  }, [bidNumber]);

  useEffect(() => {
    if (!itemId) return;

    const abortController = new AbortController();
    setIsLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const [item, itemColors] = await Promise.all([
          BidService.getBiditemById(itemId),
          BidService.getBiditemColorByItemId(itemId),
        ]);

        setAppBidItem(item);
        console.log(itemColors);
        setAppBidItemColors(itemColors);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
          console.error("Error fetching data:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [itemId]);

  useEffect(() => {
    if (!itemId) navigate("/404");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  useEffect(() => {
    if (appBidItem?.status === BidItemStatus.ENDED) {
      navigate(`/bid-end/${itemId}`);
    }
  }, [appBidItem?.status, itemId, navigate]);

  const handleColorChange = (colorId: string) => {
    bidItemColorId.current = colorId;
    searchParams.set("bidItemColorId", colorId);
    setSearchParams(searchParams);
    updateSelectedColorItem();
  };

  const updateSelectedColorItem = () => {
    if (!appBidItemColors.length || !bidItemColorId.current) return;

    selectedBidItemColor.current = appBidItemColors.find(
      (color) => color.id === bidItemColorId.current.toString(),
    );
  };

  useEffect(() => {
    if (!appBidItemColors.length || !bidItemColorId.current) return;

    updateSelectedColorItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bidItemColorId.current, appBidItemColors]);

  const handleBidNumberChange = (number: number) => {
    setBidNumber(number);
    searchParams.set("bidNumber", number.toString());
    setSearchParams(searchParams);
  };

  const handleShowAllNumbersChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.checked) {
      setFilteringBiddingNumbers([]);
    } else {
      if (bidNumber) {
        setFilteringBiddingNumbers([bidNumber]);
      }
    }
  };

  const handleFormSubmit = (bidNumber: number, bidAmount: number) => {
    pendingBid.current = { bidNumber, bidAmount };
    setIsModalOpen(true);
    setIsSubmitSuccess(false);
  };

  const handleConfirmBid = () => {
    if (!itemId || !userInfo.uid || !pendingBid.current) return;

    const { bidNumber, bidAmount } = pendingBid.current;

    const newBidActivity: Omit<BidActivity, "id"> = {
      itemId: itemId,
      bidNumber: bidNumber,
      amount: bidAmount,
      bidItemColorId: bidItemColorId.current,
      userId: userInfo.uid,
      createdAt: getCurrentUnixTimestamp(),
      name: userInfo.username ?? userInfo.firstName,
    };

    BidService.createBidActivity(newBidActivity)
      .then(() => {
        setBidJustConfirmed(true);
        // Reset the flag after a short delay
        setTimeout(() => setBidJustConfirmed(false), 1000);
      })
      .catch((err) => {
        console.error("Error creating bid activity:", err);
      });

    invalidateUserActivities(userInfo.uid);
    setIsModalOpen(false);

    setIsSubmitSuccess(true);
    pendingBid.current = null;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubmitSuccess(false);
    pendingBid.current = null;
  };

  // Modify the getLatestBidForNumber function to handle both modes
  const getLatestBidForNumber = () => {
    if (!feedList.length) return undefined;
    if (filteringBiddingNumbers.length === 0)
      return previousSingleModeBidActivity.current?.bidNumber === bidNumber
        ? previousSingleModeBidActivity.current
        : undefined;
    const latestBid =
      feedList.find((bid) => bid.bidNumber === bidNumber) || undefined;
    if (latestBid) {
      previousSingleModeBidActivity.current = latestBid;
    }
    return latestBid;
  };

  return (
    <Page>
      <div id="item-detail-container" className="mx-auto px-2 py-4 lg:px-16">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-4">
          {/* Column 1 - Image Card - takes up 4 columns (1/3) */}
          <div className="min-h-[40vh] md:col-span-4">
            {itemId && (
              <ColorPicker
                itemId={itemId}
                bidItem={
                  appBidItem ?? ({ name: "", description: "" } as BidItem)
                }
                bidColors={appBidItemColors}
                bidItemColorId={bidItemColorId.current}
                onColorChange={handleColorChange}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Column 2 - List Card - takes up 8 columns (2/3) */}
          <div className="flex flex-col gap-4 md:col-span-8">
            {/* First Container - Realtime Monitor */}
            <div
              className="card-fade-container flex h-[576px] flex-col rounded-lg"
              style={{ gap: "12px" }}
            >
              {/* Toggle Section */}
              <div className="px-4">
                <div className="w-full">
                  <div className="flex flex-col gap-2 px-4 md:flex-row md:items-center md:justify-between">
                    <span className="font-lilita-one-regular text-primary text-2xl md:text-3xl">
                      Bidding Realtime Monitor
                    </span>
                    <label className="flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-900 accent-gray-900"
                        checked={filteringBiddingNumbers.length === 0}
                        onChange={handleShowAllNumbersChange}
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        All Numbers
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Scrollable List Container */}
              <RealtimeFeed list={feedList} />
            </div>

            {appBidItem && (
              <div
                className="card-fade-container rounded-lg"
                style={{ gap: "16px !important" }}
              >
                <div className="bidding-form-title pl-4">
                  Select the egg number you want to bid on
                </div>
                <div className="bidding-form-sub-title pl-4">
                  {`The displayed price is the current bid for your selected
                  number, plus an additional ${appBidItem.biddingPoint.toLocaleString()} THB.`}
                </div>
                <BiddingForm
                  bidItem={appBidItem}
                  isSubmitSuccess={isSubmitSuccess}
                  bidNumber={Number(bidNumber)}
                  onBidNumberChange={handleBidNumberChange}
                  onFormSubmit={handleFormSubmit}
                  bidMode={filteringBiddingNumbers.length ? "single" : "all"}
                  latestBidActivity={getLatestBidForNumber()}
                  onBidConfirmed={bidJustConfirmed}
                  bidColors={appBidItemColors}
                  selectedColorId={bidItemColorId.current}
                  onColorChange={handleColorChange}
                />
              </div>
            )}
          </div>
        </div>

        <ConfirmBidModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          thumbnailUrl={selectedBidItemColor.current?.thumbnail ?? ""}
          bidNumber={pendingBid.current?.bidNumber.toString() ?? ""}
          bidColor={selectedBidItemColor.current}
          bidAmount={pendingBid.current?.bidAmount ?? 0}
          onConfirm={handleConfirmBid}
        />
      </div>
    </Page>
  );
};

export default ItemDetail;
