import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Shared hooks used across features. Kept in one module so features don't
 * each grow their own copy of the same 10 lines.
 */

/* -------------------------------------------------------------------------- */
/* Responsive breakpoints — the single source of truth for JS-side layout      */
/* -------------------------------------------------------------------------- */

export const BREAKPOINTS = {
  /** Below: bottom tab bar + single column. */
  mobile: 768,
  /** Below: two columns collapse to one. */
  tablet: 1024,
  /** Above: full desktop rail and multi-column grids. */
  desktop: 1280,
};

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(query).matches
      : false
  );

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mql = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** True on phone-sized viewports (drives the tab bar vs sidebar switch). */
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.mobile - 1}px)`);
}

export function useIsCompact() {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.tablet - 1}px)`);
}

/** Honours the OS "reduce motion" setting (used to skip JS-driven animation). */
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/* -------------------------------------------------------------------------- */
/* Async data                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * useAsync — minimal fetch state machine: data / loading / error + refetch.
 *
 * `deps` controls re-fetching (like useEffect). The latest request wins: a
 * stale response that resolves after a newer one is discarded, which matters
 * for the filter-driven list pages.
 */
export function useAsync(loader, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(immediate);
  const requestId = useRef(0);
  const loaderRef = useRef(loader);

  // Keep the newest closure without making it a dependency of the fetch
  // (callers pass inline arrow functions).
  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const run = useCallback(async ({ quiet = false } = {}) => {
    const id = (requestId.current += 1);
    if (!quiet) setLoading(true);
    try {
      const result = await loaderRef.current();
      if (id === requestId.current) {
        setData(result);
        setError('');
      }
      return result;
    } catch (err) {
      if (id === requestId.current) {
        setError(err?.message || 'Une erreur est survenue');
      }
      return null;
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!immediate) return;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return useMemo(
    () => ({ data, error, loading, refetch: run, setData }),
    [data, error, loading, run]
  );
}

/* -------------------------------------------------------------------------- */
/* Misc                                                                        */
/* -------------------------------------------------------------------------- */

/** Debounced mirror of a value — used by the transaction search field. */
export function useDebounced(value, delay = 220) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/** Calls `handler` when a click lands outside the referenced element. */
export function useClickOutside(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const onPointerDown = (event) => {
      const node = ref.current;
      if (!node || node.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [ref, handler, active]);
}

/** Escape-to-close for overlays. */
export function useEscapeKey(handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') handler(event);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handler, active]);
}

/**
 * Locks body scroll while an overlay is open, and compensates for the
 * disappearing scrollbar so the layout doesn't jump.
 */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [active]);
}

/** Traps Tab focus inside an overlay element. */
export function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return undefined;
    const node = ref.current;
    const previous = document.activeElement;

    const focusables = () =>
      Array.from(
        node.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    // Move focus in on open.
    const first = focusables()[0];
    if (first) first.focus();

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
      if (previous && previous.focus) previous.focus();
    };
  }, [ref, active]);
}

/**
 * Reads the theme's canvas colours so canvas-rendered charts stay in sync with
 * the palette (Chart.js cannot resolve CSS custom properties).
 */
export function useThemeChartColors(isDark) {
  const [colors, setColors] = useState(() => readChartColors());

  useEffect(() => {
    setColors(readChartColors());
  }, [isDark]);

  return colors;
}

function readChartColors() {
  if (typeof window === 'undefined') {
    return { income: '#15803d', expense: '#c2261f', grid: 'rgba(0,0,0,.08)', tick: '#5a6473' };
  }
  const styles = getComputedStyle(document.documentElement);
  const read = (name, fallback) => (styles.getPropertyValue(name) || fallback).trim();
  return {
    income: read('--chart-income', '#15803d'),
    expense: read('--chart-expense', '#c2261f'),
    grid: read('--chart-grid', 'rgba(0,0,0,.08)'),
    tick: read('--chart-tick', '#5a6473'),
  };
}
