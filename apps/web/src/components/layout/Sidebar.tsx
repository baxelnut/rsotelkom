import { useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
// Style
import "./Sidebar.css";
// Components
import { Icon } from "../ui/icon/Icon";
// Context & hooks
import { useAuth } from "@/contexts/auth";
import { useLayout } from "@/contexts/layout";
import { useLogoSrc } from "@/hooks";
// Config
import { SIDEBAR_MENUS, isNavGroup, type NavItem } from "@/config/navigation";
// Utils
import { cx } from "@/utils/cx";

interface SidebarProps {
  links?: NavItem[];
}

const slugOf = (label: string) => label.toLowerCase().replace(/\s+/g, "-");

export function Sidebar({ links = SIDEBAR_MENUS }: SidebarProps) {
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();
  const {
    isDesktop,
    isCollapsed,
    isMobileMenuOpen,
    toggleSidebar,
    setCollapsed,
    closeMobileMenu,
  } = useLayout();
  const getLogoSrc = useLogoSrc(); // Existing hook returns a getter (not a string) and takes no arguments
  const logoSrc = isCollapsed ? "/favicon.svg" : getLogoSrc();

  const visibleLinks = useMemo(
    () => links.filter((item) => !item.adminOnly || isAdmin),
    [links, isAdmin],
  );

  // Group that owns the current route
  const activeGroup = visibleLinks
    .filter(isNavGroup)
    .find((group) =>
      group.children.some((c) => pathname.startsWith(c.path)),
    )?.label;

  // undefined = follow the route, "" = everything closed, otherwise a label.
  // Reset to "follow the route" whenever the path changes.
  const [expanded, setExpanded] = useState<string | undefined>(undefined);
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setExpanded(undefined);
  }
  const openLabel = expanded ?? activeGroup ?? "";

  const toggleGroup = (label: string) => {
    if (isCollapsed) {
      // Icon-only rail: widen first, then show the submenu
      setCollapsed(false);
      setExpanded(label);
      return;
    }
    setExpanded(openLabel === label ? "" : label);
  };

  return (
    <>
      <div
        className={cx("sidebar-backdrop", isMobileMenuOpen && "is-visible")}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      <nav
        id="app-sidebar"
        className={cx(
          "sidebar",
          isCollapsed && "collapsed",
          isMobileMenuOpen && "mobile-open",
        )}
        aria-label="Main navigation"
      >
        <div className="sidebar__header">
          <Link
            to="/"
            className="sidebar__logo"
            onClick={closeMobileMenu}
            aria-label="Home"
          >
            <img key={logoSrc} src={logoSrc} alt="Telkom Indonesia" />
          </Link>
        </div>

        <ul className="sidebar__menu">
          {visibleLinks.map((item) => {
            const title = isCollapsed ? item.label : undefined;

            if (!isNavGroup(item)) {
              return (
                <li key={item.label}>
                  <NavLink
                    to={item.path}
                    title={title}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      cx("sidebar__link", isActive && "active")
                    }
                  >
                    <Icon iconName={item.icon} size={18} />
                    {!isCollapsed && (
                      <span className="sidebar__label">{item.label}</span>
                    )}
                  </NavLink>
                </li>
              );
            }

            const isOpen = openLabel === item.label;
            const submenuId = `submenu-${slugOf(item.label)}`;

            return (
              <li key={item.label}>
                <button
                  type="button"
                  className={cx(
                    "sidebar__link",
                    activeGroup === item.label && "has-active-child",
                  )}
                  title={title}
                  aria-expanded={isCollapsed ? undefined : isOpen}
                  aria-controls={isCollapsed ? undefined : submenuId}
                  onClick={() => toggleGroup(item.label)}
                >
                  <Icon iconName={item.icon} size={18} />
                  {!isCollapsed && (
                    <>
                      <span className="sidebar__label">{item.label}</span>
                      <Icon
                        className="sidebar__chevron"
                        iconName="chevronRight"
                        size={14}
                        fillRule="evenodd"
                      />
                    </>
                  )}
                </button>

                {!isCollapsed && (
                  <div
                    id={submenuId}
                    className={cx("sidebar__submenu", isOpen && "open")}
                  >
                    <ul>
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <NavLink
                            to={child.path}
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                              cx("sidebar__sublink", isActive && "active")
                            }
                          >
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {isDesktop && (
          <div className="sidebar__footer">
            <button
              type="button"
              className="btn ghost icon sm sidebar__collapse"
              onClick={toggleSidebar}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!isCollapsed}
            >
              <Icon
                iconName={isCollapsed ? "chevronRight" : "chevronLeft"}
                size={16}
                fillRule="evenodd"
              />
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
