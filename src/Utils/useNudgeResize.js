import { useEffect } from "react";

// AntD's Tabs decides how many tab labels fit (collapsing the rest into
// its own "more" dropdown) via an internal ResizeObserver, and caches
// that fit-count in its own React state rather than recomputing it from
// CSS on every render. On a genuinely cold page load that measurement
// can fire before this app's own CSS overrides for Tabs +
// tabBarExtraContent (see index.css) have actually been applied by the
// browser — leaving the tab bar stuck at whatever it measured against a
// not-yet-final layout, with no later trigger to redo it. One extra
// resize event shortly after mount gives it a second pass against the
// settled layout.
export function useNudgeResize(delay = 60) {
  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event("resize")), delay);
    return () => clearTimeout(t);
  }, []);
}
