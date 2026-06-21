import { type DependencyList } from 'react';

/**
 * Conditionally join class names (clsx-style, dependency-free).
 * Falsy values are dropped, so `cx('a', cond && 'b')` is safe.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

type StyleSheet = Record<string, unknown>;

/**
 * useStyles — co-locate a component's Tailwind class strings in a `*.styles.ts`
 * file and pull them in with a single call, the way react-jss's `useStyles`
 * worked. Styles are plain Tailwind class strings (static utilities or `cx(...)`
 * for conditionals), so there is zero runtime CSS and the rendered UI is
 * byte-for-byte identical to inline classNames.
 *
 *   // static sheet
 *   const s = useStyles(galleryStyles);
 *
 *   // sheet that depends on props/state
 *   const s = useStyles(() => makeSidebarStyles(collapsed), [collapsed]);
 *
 * The work is just string concatenation, so the sheet is recomputed inline on
 * each render (no memoization needed). The optional `deps` argument exists only
 * for call-site parity with the hook ergonomics and is intentionally unused.
 */
export function useStyles<T extends StyleSheet>(sheet: T): T;
export function useStyles<T extends StyleSheet>(factory: () => T, deps?: DependencyList): T;
export function useStyles<T extends StyleSheet>(sheetOrFactory: T | (() => T)): T {
  return typeof sheetOrFactory === 'function' ? (sheetOrFactory as () => T)() : sheetOrFactory;
}
