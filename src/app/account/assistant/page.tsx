import { Assistant } from "@/components/account/Assistant";
import { getProperties } from "@/lib/properties";

/** The catalogue is public and fetched on the server; the conversation itself
 *  happens entirely in the browser against the signed-in session. */
export const revalidate = 3600;

export default async function AssistantPage() {
  const all = await getProperties();
  return <Assistant all={all} />;
}
