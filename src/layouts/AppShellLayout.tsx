import { useState, useEffect } from "react";
import { Box } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Outlet } from "react-router-dom";
import SideNav from "./SideNav";
import BackofficeHeader from "./HeaderBar";

const SIDEBAR_WIDTH = 240;
const SIDEBAR_MARGIN = 10;

export default function AppShellLayout() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile drawer on route change / resize to desktop
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const sidebarVisible = isMobile ? mobileOpen : !collapsed;

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen((o) => !o);
    } else {
      setCollapsed((c) => !c);
    }
  };

  return (
    <Box style={{ minHeight: "100vh", background: "var(--content-bg)" }}>
      {/* Mobile overlay backdrop */}
      {isMobile && mobileOpen && (
        <Box className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <Box
        style={{
          position: "fixed",
          top: isMobile ? 0 : SIDEBAR_MARGIN,
          left: isMobile ? 0 : SIDEBAR_MARGIN,
          bottom: isMobile ? 0 : SIDEBAR_MARGIN,
          width: SIDEBAR_WIDTH,
          zIndex: 100,
          transform: sidebarVisible ? "translateX(0)" : `translateX(-${SIDEBAR_WIDTH + SIDEBAR_MARGIN * 2}px)`,
          transition: "transform 250ms ease",
        }}
      >
        <Box
          style={{
            height: "100%",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <SideNav />
        </Box>
      </Box>

      {/* Main content area */}
      <Box
        style={{
          marginLeft: !isMobile && sidebarVisible ? SIDEBAR_WIDTH + SIDEBAR_MARGIN * 2 : 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 250ms ease",
        }}
      >
        {/* Header */}
        <Box
          component="header"
          style={{
            height: 56,
            background: "transparent",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
          }}
        >
          <BackofficeHeader onToggleNavbar={handleToggle} />
        </Box>

        {/* Main content */}
        <Box
          component="main"
          style={{
            flex: 1,
            padding: isMobile ? "16px 12px 24px" : "0 24px 24px",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
