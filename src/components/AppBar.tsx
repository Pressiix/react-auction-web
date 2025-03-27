import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router";

interface NavItem {
  label: string;
  href?: string;
  path?: string;
}

interface AppBarProps {
  navItems: NavItem[];
}

const AppBar: React.FC<AppBarProps> = ({ navItems = [] }) => {
  const appName = `${import.meta.env.VITE_REACT_APP_TITLE}`;
  const [username, setUsername] = useState<string>("");
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (
      !userInfo &&
      !["/", "/forgot-password", "/password-reset"].includes(
        window.location.pathname,
      )
    ) {
      navigate("/signin");
    } else {
      setUsername(userInfo?.username || userInfo?.email || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  useEffect(() => {
    const basePath = location.pathname.split("/").slice(0, 2).join("/");
    setCurrentPath(basePath);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout()
      .then(() => {
        navigate("/signin");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200/20 bg-white/30 backdrop-blur-sm transition-colors duration-300 ease-in-out">
        <div className=" px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            {/* Left side - Hamburger, Logo and Navigation */}
            <div className="flex items-center">
              {/* Hamburger Menu Button */}
              <button
                className="mr-2 p-2 md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  ></path>
                </svg>
              </button>
              {/* Logo */}
              <div className="cursor-pointer" onClick={() => navigate("/")}>
                <img
                  src="/images/ootn/ootn-logo.png"
                  alt={appName}
                  className="h-8 w-auto"
                />
              </div>
            </div>

            {/* Right side - Navigation and User Section */}
            <div className="flex items-center">
              {/* Navigation Items - Desktop */}
              <div className="hidden space-x-8 md:flex">
                {navItems.map((item, index) => {
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (item.href) navigate(item.href);
                      }}
                      className={`text-primary cursor-pointer rounded-md px-3 py-2 transition-colors duration-200  ${
                        currentPath === item.href || currentPath === item.path
                          ? "font-lilita-one-white-stroke"
                          : "font-lilita-one-regular"
                      }`}
                      style={{
                        fontSize: `${currentPath === item.href || currentPath === item.path ? "24" : "20"}px`,
                        WebkitTextStrokeWidth: `${currentPath === item.href || currentPath === item.path ? "1.5" : "0"}px`,
                      }}
                    >
                      {item.label}
                    </div>
                  );
                })}
              </div>

              {/* User Section */}
              <div className="ml-4 flex items-center space-x-4">
                {userInfo ? (
                  <>
                    {/* User profile */}
                    <div className="flex items-center space-x-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: "#7c60aa" }}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        {username.charAt(0)}
                      </div>
                      <span
                        className="font-lilita-one-regular hidden text-sm font-medium text-white md:block"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        {username}
                      </span>
                    </div>
                  </>
                ) : (
                  <div
                    className="font-lilita-one-regular text-primary flex items-center space-x-2"
                    style={{ fontSize: "20px" }}
                  >
                    <a href="/signup" className="py-2 pr-0">
                      Sign Up
                    </a>
                    <span>/</span>
                    <a href="/signin" className="py-2 pl-0">
                      Sign In
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 right-0 left-0 z-50 bg-white/95 shadow-lg backdrop-blur-sm md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navItems.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  if (item.href) {
                    navigate(item.href);
                    setIsMobileMenuOpen(false);
                  }
                }}
                className={`text-primary block cursor-pointer rounded-md px-3 py-2 transition-colors duration-200   ${
                  currentPath === item.href || currentPath === item.path
                    ? "font-lilita-one-white-stroke"
                    : "font-lilita-one-regular"
                }`}
                style={{
                  fontSize: `${currentPath === item.href || currentPath === item.path ? "24" : "20"}px`,
                  WebkitTextStrokeWidth: `${currentPath === item.href || currentPath === item.path ? "1.5" : "0"}px`,
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Dropdown Portal */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="fixed top-14 right-0 z-50 mt-2 h-12 w-48 rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <a
            className="font-lilita-one-regular text-md block px-4 text-gray-700 hover:bg-gray-100"
            onClick={handleLogout}
          >
            Sign Out
          </a>
        </div>
      )}
    </>
  );
};

export default AppBar;
