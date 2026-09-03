import React, { useState } from "react";
import { RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useLeftNavData } from "./LeftTabs";
import "./MobileNav.css";

// Renders a titled section's items (e.g. Create's "Customers" column).
const SectionedLinks = ({ sections, onNavigate }) => (
  <div className="mobile-nav-panel-body">
    {sections.map((section) => (
      <div key={section.title}>
        <div className="mobile-nav-section-title">{section.title}</div>
        {section.items.map((it) => (
          <Link key={it.label} to={it.to} className="mobile-nav-link" onClick={onNavigate}>
            {it.label}
          </Link>
        ))}
      </div>
    ))}
  </div>
);

// Renders a flat, un-sectioned item list (e.g. Team's flyout).
const FlatLinks = ({ items, onNavigate }) => (
  <div className="mobile-nav-panel-body">
    {items.map((it) => (
      <Link key={it.label} to={it.to} className="mobile-nav-link" onClick={onNavigate}>
        {it.label}
      </Link>
    ))}
  </div>
);

// Touch-friendly stand-in for the desktop rail's hover flyouts (see
// LeftTabs.jsx) — rendered inside MainLayout's mobile Drawer. Same
// role-filtered data (useLeftNavData), same destinations, just an
// accordion instead of hover-to-reveal, since touch has no hover.
const MobileNav = ({ onNavigate }) => {
  const {
    railItemsTop,
    railItemsPinned,
    visibleCreateColumns,
    visibleAccountingColumns,
    visibleImmigrationSections,
    visibleTeamItems,
    visibleCustomersSections,
    visibleVendorsSections,
    visibleReportsSections,
  } = useLeftNavData();

  // One panel open at a time, same as the desktop rail only ever showing
  // one flyout.
  const [expandedKey, setExpandedKey] = useState(null);
  const toggle = (key) => setExpandedKey((cur) => (cur === key ? null : key));

  // The Create/Accounting mega-menus are laid out in desktop-only columns
  // (see CREATE_MENU_COLUMNS/ACCOUNTING_MENU_COLUMNS) — the drawer is one
  // vertical list, so those columns simply flatten back into their
  // underlying sections, in the same order.
  const createSections = visibleCreateColumns.flat();
  const accountingSections = visibleAccountingColumns.flat();

  // Maps each rail item's key to the same submenu content its desktop
  // flyout shows — null means "no submenu" (either a plain link, like
  // Home, or a placeholder rail icon that's inert today on desktop too,
  // like Bookmarks/Expenses/Customize — mirrored here rather than fixed,
  // since giving mobile-only functionality would be its own change).
  const panelFor = (key) => {
    switch (key) {
      case "create":
        return createSections.length ? <SectionedLinks sections={createSections} onNavigate={onNavigate} /> : null;
      case "accounting":
        return accountingSections.length ? <SectionedLinks sections={accountingSections} onNavigate={onNavigate} /> : null;
      case "immigration":
        return visibleImmigrationSections.length ? <SectionedLinks sections={visibleImmigrationSections} onNavigate={onNavigate} /> : null;
      case "reports":
        return visibleReportsSections.length ? <SectionedLinks sections={visibleReportsSections} onNavigate={onNavigate} /> : null;
      case "team":
        return visibleTeamItems.length ? <FlatLinks items={visibleTeamItems} onNavigate={onNavigate} /> : null;
      case "customers":
        return visibleCustomersSections.length ? <SectionedLinks sections={visibleCustomersSections} onNavigate={onNavigate} /> : null;
      case "vendors":
        return visibleVendorsSections.length ? <SectionedLinks sections={visibleVendorsSections} onNavigate={onNavigate} /> : null;
      default:
        return null;
    }
  };

  const renderRow = (item) => {
    const panel = panelFor(item.key);

    if (item.to && !panel) {
      return (
        <Link key={item.key} to={item.to} className="mobile-nav-row" onClick={onNavigate}>
          <span className="mobile-nav-row-icon">{item.icon}</span>
          <span className="mobile-nav-row-label">{item.label}</span>
        </Link>
      );
    }

    if (!panel) {
      return (
        <div key={item.key} className="mobile-nav-row mobile-nav-row-inert">
          <span className="mobile-nav-row-icon">{item.icon}</span>
          <span className="mobile-nav-row-label">{item.label}</span>
        </div>
      );
    }

    const isOpen = expandedKey === item.key;
    return (
      <div key={item.key} className="mobile-nav-group">
        <button
          type="button"
          className="mobile-nav-row mobile-nav-row-toggle"
          onClick={() => toggle(item.key)}
          aria-expanded={isOpen}
        >
          <span className="mobile-nav-row-icon">{item.icon}</span>
          <span className="mobile-nav-row-label">{item.label}</span>
          <RightOutlined className={`mobile-nav-chevron ${isOpen ? "mobile-nav-chevron-open" : ""}`} />
        </button>
        {isOpen && panel}
      </div>
    );
  };

  return (
    <nav className="mobile-nav">
      {railItemsTop.map(renderRow)}
      {railItemsPinned.length > 0 && <div className="mobile-nav-divider" />}
      {railItemsPinned.map(renderRow)}
    </nav>
  );
};

export default MobileNav;
