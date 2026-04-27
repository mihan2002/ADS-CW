import * as React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import {
  cancelBid,
  getAppearanceCount,
  getBidStatus,
  getBiddingHistory,
  getMonthlyLimit,
  placeBid,
  updateBid,
} from "../services/api/alumni";
import type { BidRecord } from "../types/api";

export default function BiddingPage() {
  const { user } = useAuth();
  const [amount, setAmount] = React.useState("");
  const [currentBid, setCurrentBid] = React.useState<BidRecord | null>(null);
  const [history, setHistory] = React.useState<BidRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [appearanceSummary, setAppearanceSummary] = React.useState("");
  const [limitSummary, setLimitSummary] = React.useState("");

  const loadBiddingData = React.useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [status, bids, appearance, limit] = await Promise.all([
        getBidStatus(user.id),
        getBiddingHistory(user.id),
        getAppearanceCount(user.id),
        getMonthlyLimit(user.id),
      ]);
      setCurrentBid(status);
      setHistory(bids);
      setAppearanceSummary(`Monthly wins: ${appearance.monthlyCount}, total wins: ${appearance.totalCount}`);
      setLimitSummary(`Current count: ${limit.currentCount}/${limit.limit}, remaining: ${limit.remainingSlots}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bidding data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadBiddingData();
  }, [loadBiddingData]);

  const parsedAmount = Number(amount);

  const submitBid = async () => {
    if (!user || !parsedAmount || parsedAmount <= 0) return;
    try {
      await placeBid(user.id, parsedAmount);
      setAmount("");
      await loadBiddingData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bid");
    }
  };

  const submitUpdate = async () => {
    if (!user || !currentBid || !parsedAmount || parsedAmount <= 0) return;
    try {
      await updateBid(user.id, currentBid.id, parsedAmount);
      setAmount("");
      await loadBiddingData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update bid");
    }
  };

  const submitCancel = async () => {
    if (!user || !currentBid) return;
    try {
      await cancelBid(user.id, currentBid.id);
      await loadBiddingData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel bid");
    }
  };

  return (
    <PageContainer title="Bidding">
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Card>
              <CardContent>
                <Typography variant="h6">Current Bid</Typography>
                <Typography>
                  {currentBid ? `LKR ${currentBid.amount} (${currentBid.status})` : "No active bid yet"}
                </Typography>
                <Typography color="text.secondary">{appearanceSummary}</Typography>
                <Typography color="text.secondary">{limitSummary}</Typography>
              </CardContent>
            </Card>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <TextField
                label="Bid Amount"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
              <Button variant="contained" onClick={submitBid}>
                Place Bid
              </Button>
              <Button variant="outlined" onClick={submitUpdate} disabled={!currentBid}>
                Update Bid
              </Button>
              <Button color="error" variant="outlined" onClick={submitCancel} disabled={!currentBid}>
                Cancel Bid
              </Button>
            </Stack>

            <Card>
              <CardContent>
                <Typography variant="h6">Bid History</Typography>
                {history.length === 0 ? (
                  <Typography color="text.secondary">No bidding history found.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {history.map((bid) => (
                      <Typography key={bid.id} variant="body2">
                        {new Date(bid.created_at).toLocaleString()} - LKR {bid.amount} ({bid.status})
                      </Typography>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Stack>
    </PageContainer>
  );
}
