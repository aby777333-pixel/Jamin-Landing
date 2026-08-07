import { ShortlistView } from "@/components/account/ShortlistView";
import { getProperties } from "@/lib/properties";

/**
 * The catalogue is public, so it is fetched on the server and passed down — but
 * WHICH of them a visitor has saved is private and read only in the browser.
 * That split is what keeps a private list out of the static cache.
 */
export const revalidate = 3600;

export default async function ShortlistPage() {
  const all = await getProperties();
  return <ShortlistView all={all} />;
}
