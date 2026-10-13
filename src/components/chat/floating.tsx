import { getSettings } from "@/server/settings";
import { FloatingActions } from "./floating-actions";

/** Reads the "available for work" setting (cached) and hands it to the floating buttons. */
export async function Floating() {
  const { availableForWork, availabilityLabel } = await getSettings();
  return <FloatingActions available={availableForWork} availabilityLabel={availabilityLabel} />;
}
