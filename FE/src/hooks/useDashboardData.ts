import * as React from "react";
import { getAlumniList, getAlumniProfile, getBiddingHistory, getTomorrowSlot } from "../services/api/alumni";
import type { AlumniFullProfile, AlumniProfile, BidRecord, SlotStatus } from "../types/api";
import { getErrorMessage } from "../utils/errorHandler";

export function useDashboardData() {
  const [profiles, setProfiles] = React.useState<AlumniProfile[]>([]);
  const [details, setDetails] = React.useState<AlumniFullProfile[]>([]);
  const [allBids, setAllBids] = React.useState<BidRecord[]>([]);
  const [slotStatus, setSlotStatus] = React.useState<SlotStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isActive = true;
    async function fetchData() {
      try {
        setLoading(true);
        const alumni = await getAlumniList();
        if (!isActive) return;
        setProfiles(alumni);

        const detailResults = await Promise.allSettled(alumni.map((item) => getAlumniProfile(item.user_id)));
        if (!isActive) return;
        const completedDetails = detailResults
          .filter((result): result is PromiseFulfilledResult<AlumniFullProfile> => result.status === "fulfilled")
          .map((result) => result.value);
        setDetails(completedDetails);

        const bidResults = await Promise.allSettled(alumni.map((item) => getBiddingHistory(item.user_id)));
        if (!isActive) return;
        const flatBids = bidResults
          .filter((result): result is PromiseFulfilledResult<BidRecord[]> => result.status === "fulfilled")
          .flatMap((result) => result.value);
        setAllBids(flatBids);

        const tomorrowSlot = await getTomorrowSlot();
        if (!isActive) return;
        setSlotStatus(tomorrowSlot);
      } catch (err) {
        if (isActive) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }
    fetchData();
    return () => {
      isActive = false;
    };
  }, []);

  return { profiles, details, allBids, slotStatus, loading, error };
}
