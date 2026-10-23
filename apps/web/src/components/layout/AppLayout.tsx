import { Outlet, useLocation } from "react-router-dom";
// Style
import "./AppLayout.css";
// Components
import { Header, Sidebar, Footer, ScrollToTop } from ".";
// Context
import { LayoutProvider, useLayout } from "@/contexts/layout";
// Config
import { getPageTitle } from "@/config/navigation";
// Utils
import { cx } from "@/utils/cx";

function AppShell() {
  const { isCollapsed } = useLayout();
  const { pathname } = useLocation();

  return (
    <div className={cx("app-shell", isCollapsed && "collapsed")}>
      <ScrollToTop />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Sidebar />
      <div className="app-main">
        <Header title={getPageTitle(pathname)} />
        <main id="main-content" className="app-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export function AppLayout() {
  return (
    <LayoutProvider>
      <AppShell />
    </LayoutProvider>
  );
}
