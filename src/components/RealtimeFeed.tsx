import { useEffect, useState, useRef } from "react";
import { BidActivity } from "../types/bid";
import { useAuth } from "../hooks/useAuth";

interface RealtimeFeedProps {
  list: BidActivity[];
  filterNumbers?: number[];
}

export default function RealtimeFeed({ list }: RealtimeFeedProps) {
  const { userInfo } = useAuth();
  const [filteredList, setFilteredList] = useState<BidActivity[]>([]);
  const prevListLengthRef = useRef(filteredList.length);
  const [isFeedListUpdated, setIsFeedListUpdated] = useState(false);

  useEffect(() => {
    if (prevListLengthRef.current !== list.length) {
      setIsFeedListUpdated(true);
      setTimeout(() => {
        setIsFeedListUpdated(false);
      }, 600);
      prevListLengthRef.current = list.length;
    }

    setFilteredList(list);
  }, [list]);

  return filteredList.length ? (
    <div className="flex h-[70%] flex-col md:h-[85%]">
      <div className="h-[100%] flex-1 overflow-scroll p-2 md:p-4">
        <div className="space-y-2">
          {filteredList.map((item, index) => {
            const isTopBidder = index === 0;
            return (
              <div
                key={`${item.createdAt}-${item.bidNumber}-${item.amount}`}
                className={`${item.userId !== userInfo?.uid ? "feed-list-item-container" : "feed-list-item-container-focus"} flex justify-between rounded-lg last:border-b-0 ${
                  isFeedListUpdated && isTopBidder ? "bg-yellow-100" : ""
                }`}
              >
                <div className="inline-flex items-center gap-1 md:gap-2">
                  <span className="bid-number-chips px-1.5 py-0.5 md:px-2">
                    {`No.${item.bidNumber}`}
                  </span>
                  <span
                    className={`bidder-name-text truncate sm:max-w-[120px] md:max-w-[300px]`}
                  >
                    {`${item.name} Bidded`}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className={`bid-amount-text`}>
                    {item.amount?.toLocaleString()}
                  </span>
                  <div className="bid-item-currency">THB</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ) : (
    <div className="py-[20vh] text-center">not found</div>
  );
}
