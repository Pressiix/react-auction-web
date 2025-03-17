import type React from "react";
import Modal from "./Modal";
import PrimaryButton from "./PrimaryButton";
import { BidColor } from "../types/bid";

interface ConfirmBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  bidNumber: string;
  bidColor?: BidColor;
  bidAmount: number;
  thumbnailUrl: string;
  onConfirm: () => void;
}

const ConfirmBidModal: React.FC<ConfirmBidModalProps> = ({
  isOpen,
  onClose,
  bidNumber,
  bidColor,
  bidAmount,
  thumbnailUrl,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <Modal title="Confirm Your Bid" className="sm:w-[300px] md:w-[680px]">
      <div className="confirm-bid-modal-body flex flex-col items-center gap-4 pb-6 md:flex-row md:items-start md:gap-16">
        <img src={thumbnailUrl} className="h-[201px] w-[134px] md:w-auto" />
        <div
          id="bid-item-detail"
          className="grid w-full grid-cols-2 gap-2 md:w-auto"
        >
          <p className="confirm-bid-modal-text">No.</p>
          <p className="confirm-bid-modal-text font-medium">{bidNumber}</p>
          <p className="confirm-bid-modal-text">Color</p>
          <p className="confirm-bid-modal-text flex font-medium">
            <img
              className="my-auto h-[24px] w-[24px] pr-2"
              src={bidColor?.icon}
            />
            {bidColor?.name ?? ""}
          </p>
          <p className="confirm-bid-modal-text">Price</p>
          <p className="confirm-bid-modal-text font-medium">
            {bidAmount.toLocaleString()} THB
          </p>
        </div>
      </div>
      <div className="confirm-bid-modal-bottom flex justify-center">
        <PrimaryButton variant="outlined" onClick={onClose}>
          Back
        </PrimaryButton>
        <PrimaryButton
          isShowShadow
          style={{ width: "100%" }}
          onClick={onConfirm}
        >
          Confirm
        </PrimaryButton>
      </div>
    </Modal>
  );
};

export default ConfirmBidModal;
