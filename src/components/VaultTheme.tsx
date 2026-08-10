"use client";

import { useEffect } from "react";

/**
 * Flips the whole interface to onyx for the duration of the Vault (§6.6).
 *
 * ⚠️ IT HAS TO BE THE ROOT ELEMENT, which is why this is a client component
 * doing one imperative thing rather than a nested layout. Only the root layout
 * renders `<html>`, and a nested `app/vault/layout.tsx` cannot add an attribute
 * to it — but the header and the footer are siblings of `main`, so scoping the
 * theme to a wrapper inside the page would leave them in the light palette
 * while the page went dark. §6.6 asks for the entire interface.
 *
 * ⚠️ It carries no markup and no state, so it costs one effect and nothing
 * else. Every token is already declared in royal.css under
 * `[data-theme="vault"]`, and every Tailwind colour utility compiles to
 * `var(--color-…)`, so nothing in the tree needs a conditional — the same
 * mechanism the Crown card uses one level down.
 *
 * ⚠️ The cleanup is not optional. Without it, navigating out of the Vault
 * leaves the rest of the site onyx — client-side routing does not reload the
 * document, so nothing else would ever put it back.
 */
export function VaultTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = "vault";
    return () => {
      delete root.dataset.theme;
    };
  }, []);

  return null;
}
