import PrimaryText from "./PrimaryText";
export default function Modal({
  img,
  title,
  subTitle,
  description,
  children,
  style = {},
  className,
  hasCloseButton = false,
  closeFromOverlay = false,
  onModalClose = () => true,
}: {
  img?: string;
  title: string;
  subTitle?: string;
  description?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  hasCloseButton?: boolean;
  closeFromOverlay?: boolean;
  onModalClose?: (value: boolean) => void;
}) {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeFromOverlay && e.target === e.currentTarget) {
      onModalClose(true);
    }
  };

  return (
    <div
      className="modal-overlay fixed inset-0 flex items-center justify-center bg-black/50"
      onClick={handleOverlayClick}
    >
      <div className="relative mx-4">
        {/* Modal container with purple border */}
        <div
          className={`overflow-hidden rounded-3xl border-4 border-[#7c60aa] bg-white p-6 shadow-xl ${className}`}
          style={style}
        >
          {hasCloseButton && (
            <button
              className="modal-close-button absolute top-4 right-4 text-2xl font-bold "
              onClick={() => onModalClose(true)}
            >
              ×
            </button>
          )}
          {img && (
            <div className="mb-4 flex justify-center">
              <img
                className="h-[250px] w-full max-w-[606px] object-contain"
                src={img}
                alt="egg complete"
              />
            </div>
          )}
          <PrimaryText title={title} />
          <div className="mb-8">
            <div className="font-['LINE Seed Sans TH'] text-center text-2xl leading-9 font-normal text-black capitalize">
              {subTitle}
            </div>
            {description && (
              <div className="font-['LINE Seed Sans TH'] text-center text-2xl leading-9 font-normal text-black capitalize">
                {description}
              </div>
            )}
          </div>
          {children}
          {/* Close button with countdown */}
        </div>
      </div>
    </div>
  );
}
