import { useAuth } from "../hooks/useAuth";
import AppBar from "./AppBar";
import Footer from "./Footer";

export default function Page({
  children,
  isShowCover = false,
}: {
  children: React.ReactNode;
  isShowCover?: boolean;
}) {
  const { isLoading } = useAuth();

  return isLoading ? (
    <></>
  ) : (
    <>
      <AppBar
        navItems={[
          {
            label: "Home",
            href: "/",
          },
        ]}
      />
      <div className={`${isShowCover ? "" : "pt-16"}`}>{children}</div>
      <Footer />
    </>
  );
}
