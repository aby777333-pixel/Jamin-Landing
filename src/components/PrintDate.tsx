"use client";

import { useSyncExternalStore } from "react";

/**
 * Today's date, formatted the way the print mastheads write it — taken in
 * the BROWSER, never on the server.
 *
 * 🚨 WHY THIS EXISTS (report 18, 2026-09-03): the site-visit checklist wrote
 * `new Date()` in a server component that is statically regenerated once an
 * hour at most, so "Sheet taken" showed the day the page was last BUILT —
 * 25 Aug on a sheet printed on the 29th. A cached page cannot know when it
 * is read; only the client can, so the date is rendered here on mount.
 *
 * `useSyncExternalStore` rather than state-in-effect (the repo's eslint bans
 * setState in an effect body). The server snapshot is empty, so the static
 * HTML carries "Sheet taken" with no date and hydration fills it in — the
 * masthead is print-only, so nothing ever flashes on screen.
 */
const FMT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const subscribe = () => () => {};
const today = () => FMT.format(new Date());
const none = () => "";

export function PrintDate() {
  const date = useSyncExternalStore(subscribe, today, none);
  return <>{date}</>;
}
