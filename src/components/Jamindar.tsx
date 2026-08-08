import { JamindarDock, type JamindarProperty } from "./JamindarDock";
import {
  getProperties,
  isSellable,
  locationLine,
  phaseLabel,
  propertyHref,
} from "@/lib/properties";

/**
 * Server half of the assistant: it hands the client the smallest slice of the
 * catalogue that a result card needs.
 *
 * Two reasons it is shaped this way rather than passing `Property[]`:
 * every page in the site renders this, so the full ~60-column row would be
 * serialised into the payload of every route; and `lib/properties` lists its
 * allowed columns explicitly so an admin-only field cannot leak — narrowing
 * again here keeps that promise at the boundary the browser actually sees.
 *
 * A dead database must not take the site down with it, so a failed read simply
 * means the assistant renders with no cards rather than throwing.
 */
export async function Jamindar() {
  let properties: JamindarProperty[] = [];
  try {
    properties = (await getProperties()).map((p) => ({
      id: p.id,
      href: propertyHref(p),
      title: p.title,
      location: locationLine(p),
      phase: phaseLabel(p),
      sellable: isSellable(p),
    }));
  } catch {
    properties = [];
  }

  return <JamindarDock properties={properties} />;
}
