import React, { useLayoutEffect, useRef, useState } from "react";
import { Button, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import "./GridToolbar.css";

// Drop-in replacement for a plain `<div className="workforce-search-container">`
// toolbar row (Refresh / Search / Export / Add New, in whatever order and
// combination a given grid page already renders them as children) that
// keeps the row to exactly one line at any width — earlier children get
// priority to stay visible; whichever trailing ones don't fit collapse
// behind a "▾" button instead of wrapping onto a second/third line.
//
// Desktop is unaffected (everything already fits on one line there, so
// visibleCount === total and no collapse button renders at all) — this
// only changes behavior once the row would otherwise overflow.
// gap defaults to 0 — every existing toolbar already spaces its buttons
// via each Button's own inline marginLeft/marginRight, so this stays a
// true drop-in with no desktop spacing change. The overflow panel (see
// GridToolbar.css) strips those same inline margins and uses its own
// vertical gap instead, since horizontal margins don't apply once
// stacked.
const GridToolbar = ({ children, className, gap = 0 }) => {
  const items = React.Children.toArray(children);
  const visibleRef = useRef(null);
  const measureRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  useLayoutEffect(() => {
    const visibleEl = visibleRef.current;
    const measureEl = measureRef.current;
    if (!visibleEl || !measureEl) return;

    const recalc = () => {
      const available = visibleEl.clientWidth;
      const widths = Array.from(measureEl.children).map((el) => el.getBoundingClientRect().width);
      if (widths.length === 0) {
        setVisibleCount(0);
        return;
      }

      const totalWidth = widths.reduce((sum, w) => sum + w, 0) + gap * (widths.length - 1);
      if (totalWidth <= available) {
        setVisibleCount(widths.length);
        return;
      }

      // Doesn't all fit — walk forward reserving room for the "▾" collapse
      // trigger itself, so the last visible item doesn't butt right up
      // against (or get hidden behind) it.
      const moreWidth = 40;
      let sum = 0;
      let fit = 0;
      for (let i = 0; i < widths.length; i++) {
        const next = sum + widths[i] + (i > 0 ? gap : 0);
        if (next + gap + moreWidth <= available) {
          sum = next;
          fit = i + 1;
        } else break;
      }
      setVisibleCount(Math.max(1, fit));
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(visibleEl);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, gap]);

  const visible = items.slice(0, visibleCount);
  const overflow = items.slice(visibleCount);

  return (
    <div className={className}>
      <div className="grid-toolbar-visible" ref={visibleRef} style={{ gap }}>
        {visible}
        {overflow.length > 0 && (
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            dropdownRender={() => <div className="grid-toolbar-overflow-panel">{overflow}</div>}
          >
            <Button
              type="default"
              icon={<DownOutlined />}
              className="grid-toolbar-more"
              aria-label="More toolbar actions"
            />
          </Dropdown>
        )}
      </div>
      {/* Off-screen full-size clone of every item, used only to measure
          natural widths — never visible, never interactive. */}
      <div className="grid-toolbar-measure" ref={measureRef} style={{ gap }} aria-hidden="true">
        {items}
      </div>
    </div>
  );
};

export default GridToolbar;
