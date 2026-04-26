import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { biddingApi } from '@/services/api/biddingApi';
import { alumniApi } from '@/services/api/alumniApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Bid, SlotStatus, MonthlyLimit } from '@/types';
import { Gavel, CalendarCheck, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function BiddingPage() {
  const user = useAuthStore((s) => s.user);
  const [bids, setBids] = useState<Bid[]>([]);
  const [currentBid, setCurrentBid] = useState<Bid | null>(null);
  const [slotStatus, setSlotStatus] = useState<SlotStatus | null>(null);
  const [monthlyLimit, setMonthlyLimit] = useState<MonthlyLimit | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [updateAmount, setUpdateAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);

  const userId = user?.id;

  const fetchData = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [bidsRes, statusRes, slotRes, limitRes] = await Promise.all([
        biddingApi.getBiddingHistory(userId),
        biddingApi.getBidStatus(userId),
        alumniApi.getTomorrowSlot(),
        alumniApi.getMonthlyLimit(userId),
      ]);
      setBids(bidsRes.data.data);
      setCurrentBid(statusRes.data.data);
      setSlotStatus(slotRes.data.data);
      setMonthlyLimit(limitRes.data.data);
    } catch {
      toast.error('Failed to load bidding data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handlePlaceBid = async () => {
    if (!userId) return;
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await biddingApi.placeBid(userId, amount);
      toast.success('Bid placed successfully!');
      setBidAmount('');
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBid = async () => {
    if (!userId || !selectedBid) return;
    const amount = parseFloat(updateAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await biddingApi.updateBid(userId, selectedBid.id, amount);
      toast.success('Bid updated successfully!');
      setShowUpdateModal(false);
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBid = async () => {
    if (!userId || !selectedBid) return;

    setIsSubmitting(true);
    try {
      await biddingApi.cancelBid(userId, selectedBid.id);
      toast.success('Bid cancelled');
      setShowCancelModal(false);
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to cancel bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-surface-100">
          <span className="gradient-text">Bidding</span>
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Bid for the featured alumni spotlight slot
        </p>
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Slot Status */}
        <Card padding="md" hover={false}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${slotStatus?.isOpen ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
              <CalendarCheck size={20} className={slotStatus?.isOpen ? 'text-emerald-400' : 'text-rose-400'} />
            </div>
            <div>
              <p className="text-xs text-surface-500">Tomorrow's Slot</p>
              <p className={`text-sm font-semibold ${slotStatus?.isOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
                {slotStatus?.isOpen ? 'Open' : 'Assigned'}
              </p>
            </div>
          </div>
        </Card>

        {/* Current Bid Status */}
        <Card padding="md" hover={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-primary-400" />
            </div>
            <div>
              <p className="text-xs text-surface-500">Current Bid</p>
              {currentBid ? (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-surface-100">${currentBid.amount}</p>
                  <Badge status={currentBid.status as 'pending' | 'won' | 'cancelled'} />
                </div>
              ) : (
                <p className="text-sm text-surface-400">No active bid</p>
              )}
            </div>
          </div>
        </Card>

        {/* Monthly Limit */}
        <Card padding="md" hover={false}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${monthlyLimit?.hasReachedLimit ? 'bg-rose-500/20' : 'bg-amber-500/20'}`}>
              <AlertCircle size={20} className={monthlyLimit?.hasReachedLimit ? 'text-rose-400' : 'text-amber-400'} />
            </div>
            <div>
              <p className="text-xs text-surface-500">Monthly Limit</p>
              <p className="text-sm font-semibold text-surface-100">
                {monthlyLimit ? `${monthlyLimit.currentCount}/${monthlyLimit.limit} used` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Place Bid */}
      <Card padding="md" hover={false}>
        <h2 className="flex items-center gap-2 text-base font-semibold text-surface-100 mb-4">
          <Gavel size={20} className="text-primary-400" /> Place a Bid
        </h2>
        <div className="flex gap-3">
          <Input
            placeholder="Enter bid amount ($)"
            type="number"
            min="0.01"
            step="0.01"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="flex-1"
            id="bid-amount"
          />
          <Button onClick={handlePlaceBid} isLoading={isSubmitting} disabled={!slotStatus?.isOpen}>
            Place Bid
          </Button>
        </div>
        {!slotStatus?.isOpen && (
          <p className="text-xs text-rose-400 mt-2">Bidding is closed — tomorrow's slot is already assigned.</p>
        )}
      </Card>

      {/* Bid History */}
      <Card padding="md" hover={false}>
        <h2 className="flex items-center gap-2 text-base font-semibold text-surface-100 mb-4">
          <Clock size={20} className="text-surface-400" /> Bid History
        </h2>

        {bids.length === 0 ? (
          <EmptyState title="No Bids Yet" description="Place your first bid to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-700">
                  <th className="text-left py-3 px-2 text-surface-400 font-medium">ID</th>
                  <th className="text-left py-3 px-2 text-surface-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-2 text-surface-400 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-surface-400 font-medium">Date</th>
                  <th className="text-right py-3 px-2 text-surface-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid) => (
                  <tr key={bid.id} className="border-b border-surface-800 hover:bg-surface-800/30 transition-colors">
                    <td className="py-3 px-2 text-surface-300">#{bid.id}</td>
                    <td className="py-3 px-2 text-surface-200 font-medium">${bid.amount}</td>
                    <td className="py-3 px-2">
                      <Badge status={bid.status as 'pending' | 'won' | 'cancelled'} />
                    </td>
                    <td className="py-3 px-2 text-surface-400">
                      {new Date(bid.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {bid.status === 'pending' && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBid(bid);
                              setUpdateAmount(bid.amount);
                              setShowUpdateModal(true);
                            }}
                          >
                            Update
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBid(bid);
                              setShowCancelModal(true);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Update Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Update Bid Amount"
      >
        <div className="space-y-4">
          <Input
            label="New Amount"
            type="number"
            min="0.01"
            step="0.01"
            value={updateAmount}
            onChange={(e) => setUpdateAmount(e.target.value)}
            id="update-bid-amount"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBid} isLoading={isSubmitting}>
              Update Bid
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Bid"
      >
        <div className="space-y-4">
          <p className="text-sm text-surface-400">
            Are you sure you want to cancel bid #{selectedBid?.id} for ${selectedBid?.amount}?
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
              Keep Bid
            </Button>
            <Button variant="danger" onClick={handleCancelBid} isLoading={isSubmitting}>
              Cancel Bid
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
