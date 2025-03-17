import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import debounce from "lodash/debounce";
import Page from "../components/Page";
import HorizontalDivider from "../components/HorizontalDivider";
import type { BidActivity, BidColor, BidItem } from "../types/bid";
import { useAuth } from "../hooks/useAuth";
import { getCurrentUnixTimestamp } from "../utils/DateTimeUtils";
import { useUserActivities } from "../hooks/useUserActivities";
import { useAppActivities } from "../hooks/useAppActivities";
import { BidService } from "../services/BidService";
import {
  invalidateBidItems,
  invalidateBidItemColors,
} from "../services/CacheService";
import { useBidItems } from "../hooks/useBidItems";
 
interface ItemCardProps {
  item: BidActivity;
}
 
const BiddingList: React.FC = () => {
  const { userInfo } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
 
  // Replace state declarations with hook
  const {
    bidItems: bidItemList,
    bidItemColors: bidItemColorList,
    isLoading,
  } = useBidItems();
 
  // App Bid Transactions
  const [appBiddingList, setAppBiddingList] = useState<BidActivity[]>([]);
  // User Bid Transactions
  const [userBiddingList, setUserBiddingList] = useState<BidActivity[]>([]);

  
 
  const [filteredUserBiddingList, setFilteredUserBiddingList] = useState<
    BidActivity[]
  >([]);
  const [biddingList, setBiddingList] = useState<Record<string, BidActivity>>();
  const [filteredBiddingList, setFilteredBiddingList] = useState<
    Record<string, BidActivity>
  >({});
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [bidItemList, setBidItemList] = useState<Record<string, BidItem>>({});
  // const [bidItemColorList, setBidItemColorList] = useState<
  //   Record<string, BidColor>
  // >({});

  useEffect(() => {
    console.log("bidItemList",bidItemList)
    console.log("bidItemColorList",bidItemColorList)
  },[bidItemList,bidItemColorList])
  // useEffect(() => {
  //   const fetchMasterData = async () => {
  //     // setIsLoading(true);
  //     if (Object.keys(bidItemList).length === 0) {
  //       invalidateBidItems();
  //       invalidateBidItemColors();
  //       const bidItems = await BidService.getBidItems();
  //       setBidItemList(bidItems);
 
  //       if (Object.keys(bidItemColorList).length === 0) {
  //         const bidItemColors = await BidService.getBidItemColors();
  //         setBidItemColorList(bidItemColors);
  //       }
  //     }
  //     setIsLoading(false);
  //   };
 
  //   fetchMasterData();
  // }, [
  //   Object.keys(bidItemList).length === 0,
  //   Object.keys(bidItemColorList).length === 0,
  // ]);
 
  // Add user activities query
  const { data: userActivities } = useUserActivities(
    userInfo?.uid,
    bidItemList,
  );
 
  useEffect(() => {
    if (userActivities) {
      setUserBiddingList(userActivities);
    }
  }, [userActivities]);
 
  // Add app activities query
  const { data: appActivities } = useAppActivities(bidItemList);
 
  useEffect(() => {
    if (appActivities && appActivities?.length !== 0) {
      setAppBiddingList(appActivities);
    }
  }, [appActivities]);
 
  // Add initial setup for filteredBiddingList
  useEffect(() => {
    if (biddingList) {
      setFilteredBiddingList(biddingList);
    }
  }, [biddingList]);
 
  // search bidNumber
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFilter = useCallback(
    debounce((search: string) => {
      if (userInfo?.uid)
        setFilteredUserBiddingList(
          userBiddingList.filter((item) =>
            item.bidNumber.toString().includes(search.trim()),
          ),
        );
      setFilteredBiddingList(
        // filter biddingList that keys is include
        Object.keys(biddingList || {}).reduce(
          (acc, key) => {
            if (key.includes(search.trim())) {
              acc[key] = biddingList![key];
            }
            return acc;
          },
          {} as Record<string, BidActivity>,
        ),
      );
    }, 300),
    [userBiddingList, biddingList],
  );
 
  useEffect(() => {
    debouncedFilter(searchTerm);
    return () => {
      debouncedFilter.cancel();
    };
  }, [searchTerm, debouncedFilter]);
 
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
 
  // Set up bidding list section
  useEffect(() => {
    const objectList: Record<string, BidActivity> = {};
    Object.values(bidItemList).map((item) => {
      for (let i = item.numberStartedAt; i <= item.numberEndedAt; i++) {
        objectList[i] =
          appBiddingList.find((bidding) => bidding.bidNumber === i) ??
          ({
            // random number and character
            id: Math.random().toString(36).substring(7),
            amount: 0,
            name: userInfo?.username,
            bidNumber: i,
            createdAt: getCurrentUnixTimestamp(),
            itemId: item.id,
            bidItemColorId:
              Object.values(bidItemColorList).find(
                (color) => color.bidItemId === item.id,
              )?.id ?? 0,
            userId: userInfo?.uid,
          } as BidActivity);
      }
    });
    setBiddingList(objectList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appBiddingList, Object.keys(bidItemList).length > 0]);
 
  const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
    const navigate = useNavigate();
    const bidItemColor: BidColor = bidItemColorList[item.bidItemColorId];
    const bidItem: BidItem = bidItemList[bidItemColor?.bidItemId];
 
    return bidItem ? (
      <div
        className="flex flex-col items-center rounded-lg transition-shadow hover:shadow-lg"
        onClick={() => {
          return navigate(
            `/bid-items/${bidItem.id}?bidNumber=${item.bidNumber}&bidItemColorId=${item.bidItemColorId}`,
          );
        }}
      >
        <div className="relative h-48 w-full">
          <div className="item-thumbnail list-item-bg m-auto flex items-center justify-center">
            <img
              src="/images/ootn/normal-egg.png"
              alt={item.bidNumber.toString()}
              className="h-full w-full rounded-t-lg object-contain"
            />
          </div>
        </div>
        <div className="flex flex-1 items-center p-4 ">
          <div className="bidding-list-item-title">{`No.${item.bidNumber}`}</div>
        </div>
      </div>
    ) : (
      <></>
    );
  };
 
  return (
    <Page isShowCover>
      <div className="relative">
        <div className="bidding-list-page-cover" />
        <div className="biding-list-page-cover-logo-container">
          <div className="biding-list-page-cover-logo-1" />
          <div className="biding-list-page-cover-logo-2" />
        </div>
        <div className="biding-list-page-cover-logo-caption">
          “HATCH THE MYSTERY, FIND YOUR TREASURE!”
        </div>
        <div className="egg-img-cover-section">
          <div className="first-egg-img-cover" />
          <div className="second-egg-img-cover" />
          <div className="third-egg-img-cover" />
          <div className="fourth-egg-img-cover" />
          <div className="fifth-egg-img-cover" />
          <div className="sixth-egg-img-cover" />
          <div className="seventh-egg-img-cover" />
        </div>
      </div>
 
      <div className="min-h-screen  px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Search Section */}
            <div className="mx-auto my-[150px] mb-[70px] max-w-7xl">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search No."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-number-input"
                />
              </div>
            </div>
 
            {/* Your Bidding Section Title */}
            {userInfo?.uid && filteredUserBiddingList.length !== 0 && (
              <>
                <div className="mx-auto mb-12 flex max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
                  <div className="w-full">
                    <HorizontalDivider
                      style={{
                        backgroundColor: "#7C60AA",
                        height: "3px",
                      }}
                    />
                  </div>
                  <div className="font-lilita-one-white-stroke text-primary shrink-0 text-4xl">
                    Your Bidding
                  </div>
                  <div className="w-full">
                    <HorizontalDivider
                      style={{
                        backgroundColor: "#7C60AA",
                        height: "3px",
                      }}
                    />
                  </div>
                </div>
 
                {/* Your Bidding Content */}
                <div className="mx-auto mb-16 max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="relative">
                    <div
                      className="overflow-y-auto"
                      style={{
                        height: `${filteredUserBiddingList.length > 5 ? "600" : "300"}px`,
                      }}
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8 xl:grid-cols-5">
                        {filteredUserBiddingList.map((item) => (
                          <ItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
 
            {/* Bidding List Section Title */}
            <div className="mx-auto mb-12 flex max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
              <div className="w-full">
                <HorizontalDivider
                  style={{
                    backgroundColor: "#7C60AA",
                    height: "3px",
                  }}
                />
              </div>
              <h1 className="font-lilita-one-white-stroke text-primary shrink-0 text-4xl">
                Bidding List
              </h1>
              <div className="w-full">
                <HorizontalDivider
                  style={{
                    backgroundColor: "#7C60AA",
                    height: "3px",
                  }}
                />
              </div>
            </div>
 
            {/* Bidding List Content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="relative">
                <div
                  className={`overflow-y-auto`}
                  style={{
                    height: `${filteredUserBiddingList.length !== 0 ? "600" : "950"}px`,
                  }}
                >
                  {filteredBiddingList && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8 xl:grid-cols-5">
                      {Object.keys(filteredBiddingList).map((number) => (
                        <ItemCard
                          key={filteredBiddingList[number].id}
                          item={filteredBiddingList[number]}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Page>
  );
};
 
export default BiddingList;
 
 