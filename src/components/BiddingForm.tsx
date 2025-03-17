import { useEffect, useState, useMemo, FormEvent, useRef } from "react";
import Select from "react-select";
import { BidActivity, BidItem, BidColor } from "../types/bid";
import { BidService } from "../services/BidService";
import { useAuth } from "../hooks/useAuth";
import PrimaryButton from "./PrimaryButton";
import arrowDropDown from "../assets/icons/arrow_drop_down.svg";

interface ItemNumberSelectorOption {
  value: number;
  label: string;
}

type BidMode = "all" | "single";

interface BiddingFormProps {
  bidItem: BidItem;
  bidNumber: number;
  latestBidActivity?: BidActivity;
  bidMode: BidMode;
  onBidNumberChange: (number: number) => void;
  onFormSubmit: (bidNumber: number, bidAmount: number) => void;
  onBidConfirmed?: boolean; // Add this prop
  isSubmitSuccess: boolean;
  bidColors: BidColor[];
  selectedColorId: string;
  onColorChange: (colorId: string) => void;
}

export default function BiddingForm({
  bidItem,
  bidNumber,
  bidMode,
  bidColors,
  selectedColorId,
  latestBidActivity = {
    id: "",
    itemId: bidItem.id,
    bidNumber,
    amount: bidItem?.initialPrice ?? 0,
    bidItemColorId:
      bidColors.find((color) => color.id === selectedColorId)?.id ?? "",
    userId: "",
    createdAt: 0,
    name: "",
  },
  onBidNumberChange,
  onFormSubmit,
  onBidConfirmed,
  isSubmitSuccess = false,

  onColorChange,
}: BiddingFormProps) {
  const { userInfo } = useAuth();
  const biddingPoint = bidItem.biddingPoint ?? 100;
  const [topBidPrice, setTopBidPrice] = useState(bidItem.initialPrice);
  const [bidAmount, setBidAmount] = useState(bidItem.initialPrice);
  const [selectedNumber, setSelectedNumber] = useState<number | undefined>(
    bidNumber,
  );
  const prevMode = useRef(bidMode);
  const lastProcessedBidId = useRef<string>("");
  const [latesAmount, setLatestAmount] = useState<number>(0);
  const [formError, setFormError] = useState<string>();
  const [isValidBidAmount, setIsValidBidAmount] = useState(false);
  const [isDecrementEnabled, setIsDecrementEnabled] = useState(false);
  const [minBidPrice, setMinBidPrice] = useState<number>(bidItem?.initialPrice);

  useEffect(() => {
    if (bidMode === "single")
      setLatestAmount(latestBidActivity?.amount ?? bidItem.initialPrice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bidMode]);

  useEffect(() => {
    if (latesAmount && bidMode === "all") {
      setBidAmount(latesAmount + biddingPoint);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latesAmount]);

  // Generate options based on bidItem's number range
  const itemNumberOptions = useMemo(() => {
    if (!bidItem) return [];

    const start = bidItem.numberStartedAt;
    const end = bidItem.numberEndedAt;

    return Array.from({ length: end - start + 1 }, (_, i) => ({
      value: start + i,
      label: `No. ${start + i}`,
    }));
  }, [bidItem]);

  // Get current selected option
  const currentValue = useMemo(() => {
    if (!selectedNumber || !itemNumberOptions.length) return null;
    return (
      itemNumberOptions.find((option) => option.value === selectedNumber) ||
      null
    );
  }, [selectedNumber, itemNumberOptions]);

  // Combined bid amount fetching logic
  const updateBidAmountForNumber = async (number: number) => {
    try {
      const topBid = await BidService.getTopBidAmountByBidNumberAndItemId(
        number,
        bidItem.id,
      );

      const currentTopBidAmount = topBid ? topBid : bidItem.initialPrice;

      setTopBidPrice(currentTopBidAmount);
      setBidAmount(currentTopBidAmount);
      if (topBid) {
        incrementBid();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isSubmitSuccess && latestBidActivity?.id !== "") {
      setMinBidPrice(bidAmount + biddingPoint);
    }
  }, [isSubmitSuccess]);

  useEffect(() => {
    if (bidAmount === bidItem.biddingPoint) {
      setMinBidPrice(bidItem.initialPrice);
      setBidAmount(bidItem.initialPrice);
    }
  }, [bidAmount === bidItem.biddingPoint]);

  useEffect(() => {
    if (latestBidActivity?.id === "") setMinBidPrice(latestBidActivity?.amount);
  }, [latestBidActivity?.id === ""]);

  // Bid amount modification handlers
  const updateBidAmount = (modifier: number) => {
    let currentPrice = bidAmount;
    setBidAmount((prev) => {
      const newAmount = prev + modifier;

      // First ensure we don't go below initial price
      if (
        newAmount <
        (latestBidActivity?.amount
          ? latestBidActivity?.id
            ? latestBidActivity?.amount + biddingPoint
            : latestBidActivity?.amount
          : bidItem.initialPrice)
      ) {
        currentPrice = latestBidActivity?.amount
          ? latestBidActivity?.amount + biddingPoint
          : bidItem.initialPrice;
        return currentPrice;
      }
      // Then handle the top bid price check
      currentPrice =
        topBidPrice < newAmount
          ? Math.max(topBidPrice + biddingPoint, newAmount)
          : newAmount;
      // if (latestBidActivity?.amount > minBidPrice) {
      //   setMinBidPrice(latestBidActivity?.amount);
      // }

      return currentPrice;
    });
  };

  useEffect(() => {
    setIsDecrementEnabled(bidAmount > minBidPrice);
  }, [bidAmount, minBidPrice]);

  const incrementBid = () => {
    return updateBidAmount(biddingPoint);
  };
  const decrementBid = () => updateBidAmount(-biddingPoint);

  useEffect(() => {
    if (bidNumber) {
      updateBidAmountForNumber(bidNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bidNumber]);
  const handleNumberChange = (option: ItemNumberSelectorOption | null) => {
    const newNumber = option?.value;

    if (newNumber && bidItem.id) {
      setSelectedNumber(newNumber);
      onBidNumberChange(newNumber);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedNumber) {
      onFormSubmit(selectedNumber, bidAmount);
    }
  };

  // Reset lastProcessedBidId when a bid is confirmed
  useEffect(() => {
    if (onBidConfirmed) {
      lastProcessedBidId.current = "";
    }
  }, [onBidConfirmed]);

  useEffect(() => {
    const latestBidAmount = latestBidActivity?.amount;

    // Reset or keep current bid amount when switching modes
    if (prevMode.current !== bidMode) {
      prevMode.current = bidMode;
      if (
        bidMode === "single" &&
        latestBidAmount &&
        latestBidActivity?.id !== ""
      ) {
        setBidAmount(latestBidAmount + biddingPoint);
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestBidActivity]);

  useEffect(() => {
    const latestBidAmount = latestBidActivity?.amount;

    // Skip processing if this is right after a confirmed bid
    if (onBidConfirmed) {
      return;
    }

    // Only process new bids in single mode
    if (
      bidMode === "single" &&
      latestBidActivity &&
      lastProcessedBidId.current.length &&
      latestBidActivity.id !== lastProcessedBidId.current &&
      latestBidAmount &&
      latestBidActivity.userId === userInfo.uid
    ) {
      lastProcessedBidId.current = latestBidActivity.id;
      setTopBidPrice(latestBidAmount);
      setBidAmount(latestBidAmount + biddingPoint);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestBidActivity, bidMode, onBidConfirmed]);

  useEffect(() => {
    if (bidMode === "single") setIsValidBidAmount(bidAmount >= minBidPrice);
  }, [bidAmount, latestBidActivity?.amount, bidItem.initialPrice]);

  useEffect(() => {
    const standardPrice = latestBidActivity?.amount ?? bidItem.initialPrice;
    if (
      bidAmount <= standardPrice &&
      bidMode === "single" &&
      latestBidActivity?.amount &&
      latestBidActivity?.id !== ""
    ) {
      setFormError(
        `Your bid price must be greater than ${standardPrice.toLocaleString()}`,
      );
      setIsValidBidAmount(false);
    } else {
      setFormError(undefined);
    }
  }, [bidAmount, latestBidActivity?.amount, bidItem.initialPrice]);

  useEffect(() => {
    if (isSubmitSuccess) {
      incrementBid();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitSuccess]);

  const colorOptions = useMemo(
    () =>
      bidColors.map((color) => ({
        value: color.id,
        label: color.name,
        thumbnail: color.thumbnail,
      })),
    [bidColors],
  );

  const currentColorValue = useMemo(
    () => colorOptions.find((option) => option.value === selectedColorId),
    [colorOptions, selectedColorId],
  );

  const CustomColorOption = ({ data, innerProps }: any) => (
    <div
      {...innerProps}
      className="flex cursor-pointer items-center p-2 hover:bg-gray-100"
    >
      {/* <img
        src={data.thumbnail}
        alt={data.label}
        className="mr-2 h-8 w-8 rounded object-cover"
      /> */}
      <span>{data.label}</span>
    </div>
  );

  const CustomDropdownIndicator = () => (
    <div className="flex items-center">
      <img src={arrowDropDown} alt="arrow down" className="h-4 w-4" />
    </div>
  );

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      border: "none",
      boxShadow: "none",
      backgroundColor: "white",
      borderRadius: "12px",
      width: "100%",
      fontFamily: "LINE Seed Sans TH",
      fontWeight: 700,
      fontSize: "16px",
      textTransform: "capitalize",
      color: "#333",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: "transparent",
      color: state.isSelected ? "#333" : "#333",
      "&:active": {
        backgroundColor: "#f3f4f6",
      },
    }),
    menu: (base: any) => ({
      ...base,
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      border: "none",
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      padding: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      "> svg": {
        display: "none",
      },
    }),
    container: (base: any) => ({
      ...base,
      position: "relative",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  // Update useEffect for latestBidActivity changes
  useEffect(() => {
    if (bidMode === "single" && latestBidActivity?.id !== "") {
      setTopBidPrice(latestBidActivity.amount);
      setMinBidPrice(latestBidActivity.amount + biddingPoint);
      if (latestBidActivity?.userId === userInfo.uid) {
        setBidAmount(latestBidActivity.amount + biddingPoint);
      }
    } else if (!latestBidActivity) {
      setTopBidPrice(bidItem.initialPrice);
      setBidAmount(bidItem.initialPrice);
    }
  }, [latestBidActivity, bidMode, bidItem.initialPrice, biddingPoint]);

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
      <div className="flex flex-col gap-4">
        {/* Mobile layout */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
          <Select
            styles={selectStyles}
            className="bidding-form-dropdown w-full"
            id="bidNumber"
            options={itemNumberOptions}
            value={currentValue}
            onChange={handleNumberChange}
            isSearchable={true}
            isDisabled={!bidItem || bidMode === "all"}
            components={{
              DropdownIndicator: CustomDropdownIndicator,
            }}
          />
          <Select
            styles={selectStyles}
            className="bidding-form-dropdown w-full"
            options={colorOptions}
            value={currentColorValue}
            isDisabled={bidMode === "all"}
            onChange={(option) => option && onColorChange(option.value)}
            components={{
              Option: CustomColorOption,
              DropdownIndicator: CustomDropdownIndicator,
            }}
            isSearchable={false}
          />

          {/* Amount and increment/decrement controls */}
          <input
            id="bidAmount"
            type="text"
            readOnly
            disabled={bidMode === "all"}
            value={`${bidAmount.toLocaleString()} THB`}
            style={{ color: `${bidMode === "all" ? "#7a7979" : ""}` }}
            className={`bidding-form-input w-full rounded-md md:col-span-1 ${bidMode === "all" ? "text-gray-400" : ""}`}
          />
          <div className="grid w-full grid-cols-2 gap-2">
            <PrimaryButton
              type="button"
              disabled={
                (!isDecrementEnabled && bidAmount === minBidPrice) ||
                bidMode === "all"
              }
              className={`decrement-button w-full ${!isDecrementEnabled ? "-disabled" : ""}`}
              onClick={decrementBid}
            >
              {`-${biddingPoint}`}
            </PrimaryButton>

            <PrimaryButton
              className="increment-button w-full"
              type="button"
              disabled={bidMode === "all"}
              onClick={incrementBid}
            >
              {`+${biddingPoint}`}
            </PrimaryButton>
          </div>
        </div>

        {/* Bid button */}
        <div className="mt-2">
          {formError && (
            <div className="text-center text-red-600">{formError}</div>
          )}
          <PrimaryButton
            type="submit"
            disabled={!isValidBidAmount || bidMode === "all"}
            isShowShadow
            className="w-full px-3 py-2 text-base md:text-lg"
          >
            Bid
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}
