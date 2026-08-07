import { getNavFacets } from "@/lib/site";
import { HeaderShell } from "./HeaderShell";

/**
 * Server half of the header: the menu is built from the phases and districts
 * that actually contain properties, so a link here can never point at an empty
 * or non-existent page. The previous hard-coded nav pointed at /projects/completed,
 * /legal and /guide — none of which existed. Dead controls are exactly what the
 * owner's standing rule forbids.
 */
export async function SiteHeader() {
  const facets = await getNavFacets();
  return <HeaderShell facets={facets} />;
}
