import { useState, useEffect } from "react";
import { BidColor, BidItem } from "../types/bid";

interface ItemDetailCardProps {
  itemId: string;
  bidItem: BidItem;
  bidColors: BidColor[];
  bidItemColorId: string | null;
  onColorChange: (colorId: string) => void;
  isLoading: boolean;
}

export default function ItemDetailCard({
  bidItem,
  bidColors,
  bidItemColorId,
  onColorChange,
  isLoading,
}: ItemDetailCardProps) {
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
      }
    }
  }, [bidItemColorId, bidColors]);

  const handleColorSelect = (thumbnail: string, colorId: string) => {
    setSelectedThumbnail(thumbnail);
    onColorChange(colorId);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-md">
      <div className="relative aspect-square w-full bg-gray-100">
        {(isImageLoading || isLoading) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          </div>
        )}
        {!isLoading && selectedThumbnail && (
          <img
            src={selectedThumbnail}
            alt={`${bidItem.name}`}
            className="absolute h-full w-full object-contain"
            onLoad={() => setIsImageLoading(false)}
          />
        )}
      </div>
      <div className="h-3/5 overflow-y-auto p-4 md:p-6">
        <div className="mb-4">
          {isLoading ? (
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200"></div>
          ) : (
            <h2 className="text-xl font-bold text-gray-800 md:text-2xl">
              {bidItem.name}
            </h2>
          )}
        </div>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200"></div>
          </div>
        ) : (
          <p
            id="item-description"
            className="mb-4 text-sm break-words text-gray-600 md:text-base"
          >
            {bidItem.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {bidColors.map((color, index) => (
            <button
              key={color.id}
              onClick={() => handleColorSelect(color.thumbnail, color.id)}
              className={`h-16 w-16 rounded-lg border-2 hover:ring-2 hover:ring-orange-300 
                ${selectedThumbnail === color.thumbnail ? "border-orange-500" : "border-gray-200"}`}
            >
              <img
                src={color.thumbnail}
                alt={`Color ${index + 1}`}
                className="h-full w-full rounded-lg object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
