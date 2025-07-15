import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark((prev) => !prev);
  const isDashboardOrDetail = location.pathname === "/dashboard" || location.pathname.startsWith("/detail");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header
      className="w-full px-4 py-4 border-b shadow-sm"
      style={{
        backgroundColor: "var(--color-bg)",
        borderColor: "var(--color-border)",
        color: "var(--color-text)",
      }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-xl font-semibold"
          style={{ color: "var(--color-primary)" }}
        >
          URL Analyzer
        </Link>
        <nav className="space-x-4 text-sm sm:text-base flex items-center">
          {!isDashboardOrDetail ? (
            <>
              <Link
                to="/login"
                className="transition-colors"
                style={{ color: "var(--color-text)" }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color =
                    "var(--color-primary)")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "var(--color-text)")
                }
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-xl transition-colors"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-bg)",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.backgroundColor =
                    "var(--color-primary-hover)")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.backgroundColor =
                    "var(--color-primary)")
                }
              >
                Sign Up
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="p-2 rounded-md transition"
              title="Logout"
              style={{
                backgroundColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
            </button>
          )}

          {!["/", "/login", "/signup"].includes(location.pathname) && (
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="ml-6 p-2 rounded-md transition"
              style={{
                backgroundColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              {isDark ? "🌙" : "☀️"}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
