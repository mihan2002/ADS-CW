-- Add performance indexes for bidding system
-- This migration adds indexes to improve query performance for the bidding feature

CREATE INDEX `target_day_idx` ON `bids` (`target_day`);
CREATE INDEX `status_idx` ON `bids` (`status`);
CREATE INDEX `day_idx` ON `feature_days` (`day`);
