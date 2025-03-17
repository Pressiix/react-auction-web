import { useState, useEffect } from "react";
import type { BidColor, BidItem } from "../types/bid";

interface ColorPickerProps {
  itemId: string;
  bidItem: BidItem;
  bidColors: BidColor[];
  bidItemColorId: string | null;
  onColorChange: (colorId: string) => void;
  isLoading: boolean;
}

export default function ColorPicker({
  bidItem,
  bidColors,
  bidItemColorId,
  onColorChange,
  isLoading,
}: ColorPickerProps) {
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(
    () => {
      if (bidItemColorId) {
        const color = bidColors.find((c) => c.id === bidItemColorId);
        return color?.thumbnail || null;
      }
      return bidColors[0]?.thumbnail || null;
    },
  );

  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if (bidItemColorId) {
      const color = bidColors.find((c) => c.id === bidItemColorId);
      if (color) {
        setSelectedThumbnail(color.thumbnail);
        setIsImageLoading(false);
      }
    }
  }, [bidItemColorId, bidColors]);

  const handleColorSelect = (thumbnail: string, colorId: string) => {
    setSelectedThumbnail(thumbnail);
    onColorChange(colorId);
    setIsImageLoading(false);
  };

  return (
    <div className="my-30 flex flex-col items-center justify-between">
      <div className="flex w-full max-w-md flex-col items-center">
        <h1 className="font-lilita-one-white-stroke mb-4 text-center text-5xl">
          Color Picker
        </h1>

        <p className=".color-picker-sub-title mb-10 max-w-105 text-center">
          The color you choose will be the color of your auctioned egg. But
          don't worry! You can change it every time you place a new bid.
        </p>

        {/* Circular egg display */}
        <div
          className="list-item-bg relative mx-auto mb-12 flex h-64 w-64 items-center justify-center"
          style={{ width: "281px", height: "281px", borderRadius: "300px" }}
        >
          {isImageLoading || isLoading ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div
                id="loading-circle"
                className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"
              ></div>
            </div>
          ) : (
            <img
              src={selectedThumbnail || "/placeholder.svg?height=200&width=200"}
              alt={bidItem?.name || "Egg"}
              width={160}
              height={94}
              className="object-contain"
              onLoad={() => setIsImageLoading(false)}
            />
          )}
        </div>

        {/* Color selection buttons - first row */}
        <div className="mb-4 flex justify-center gap-4">
          {bidColors.slice(0, 4).map((color, index) => (
            <button
              key={color.id}
              onClick={() => handleColorSelect(color.thumbnail, color.id)}
              className={`h-16 w-16 rounded-full p-2 shadow-md transition-transform hover:scale-105 hover:shadow-lg ${
                selectedThumbnail === color.thumbnail ? "ring-4 ring-white" : ""
              }`}
              style={{
                transform:
                  selectedThumbnail === color.thumbnail
                    ? "scale(1.1)"
                    : "scale(1)",
              }}
              aria-label={`Select color ${index + 1}`}
            >
              <img
                src={color.icon}
                alt={`Color ${index + 1}`}
                className="h-full w-full rounded-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Color selection buttons - second row */}
        <div className="flex justify-center gap-4">
          {bidColors.slice(4).map((color, index) => (
            <button
              key={color.id}
              onClick={() => handleColorSelect(color.thumbnail, color.id)}
              className={`h-16 w-16 rounded-full p-2 shadow-md transition-transform hover:scale-105 hover:shadow-lg ${
                selectedThumbnail === color.thumbnail ? "ring-4 ring-white" : ""
              }`}
              style={{
                transform:
                  selectedThumbnail === color.thumbnail
                    ? "scale(1.1)"
                    : "scale(1)",
              }}
              aria-label={`Select color ${index + 5}`}
            >
              <img
                src={color.icon}
                alt={`Color ${index + 5}`}
                className="h-full w-full rounded-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
