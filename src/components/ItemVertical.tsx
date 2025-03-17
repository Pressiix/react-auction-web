// FIXME: this file duplicate from ColorPicker if have time make it re-use

import { BidActivity } from "../types/bid";

interface ItemVerticalProps {
  bidActivity: BidActivity;
  selectedThumbnail: string;
  selectedColorName: string;
}

export default function ItemVertical({ selectedThumbnail }: ItemVerticalProps) {
  return (
    <div className="my-30 flex min-h-screen flex-col items-center justify-between">
      <div className="flex w-full max-w-md flex-col items-center">
        <div
          className="list-item-bg  mx-auto mb-12 flex h-64 w-64 items-center justify-center"
          style={{ width: "281px", height: "281px", borderRadius: "300px" }}
        >
          <img
            src={selectedThumbnail || "/placeholder.svg?height=200&width=200"}
            alt={"Egg"}
            width={160}
            height={94}
            className="object-contain"
          />
        </div>

        <h1 className="font-lilita-one-white-stroke mb-4 text-center text-4xl">
          Congratulations!
        </h1>
        <h1 className="bidding-form-title mb-4 text-center text-3xl">
          to all winners
        </h1>
      </div>
    </div>
  );
}
