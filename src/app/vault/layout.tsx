import type { ReactNode } from "react";
import { VaultTheme } from "@/components/VaultTheme";
import { VaultDock } from "@/components/vault/VaultDock";
import { getDeskContact, telHref, waHref } from "@/lib/site";

/**
 * The Vault's shell.
 *
 * ⚠️ `VaultTheme` MOVED HERE FROM THE PAGE, and that is what makes the division
 * hold together. It was mounted inside `/vault` itself, so a client-side
 * navigation to `/vault/request` unmounted it — its cleanup deletes the theme
 * attribute — and the private request desk rendered in the light marketplace
 * palette. A layout persists across navigations between its own routes, which
 * is exactly the lifetime the theme needs.
 *
 * The note in `VaultTheme` about a nested layout being unable to reach `<html>`
 * still stands and is why it remains a client component doing one imperative
 * thing. This layout does not set the attribute; it just decides how long the
 * component that does stays mounted.
 *
 * §18's dock lives here for the same reason — one instance for the whole
 * division, reading the same `platform_contacts.jamin_desk` record the app's
 * Support screen reads, so the number can never disagree between them.
 */
export default async function VaultLayout({ children }: { children: ReactNode }) {
  const desk = await getDeskContact();

  return (
    <>
      <VaultTheme />
      {children}
      <VaultDock
        tel={telHref(desk.mobile)}
        wa={waHref(
          desk.whatsapp,
          "Hello Jamin Properties — I would like to speak to The Vault privately.",
        )}
        email={desk.email ? `mailto:${desk.email}?subject=${encodeURIComponent("The Vault — private enquiry")}` : null}
      />
    </>
  );
}
