import { Routes, Route } from 'react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PrivateRoute } from '@/components/PrivateRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { OverviewPage } from '@/pages/dashboard/OverviewPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import { AlumniExplorerPage } from '@/pages/alumni/AlumniExplorerPage';
import { AlumniProfilePage } from '@/pages/alumni/AlumniProfilePage';
import { BiddingPage } from '@/pages/bidding/BiddingPage';

function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected dashboard routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="alumni" element={<AlumniExplorerPage />} />
          <Route path="alumni/:userId" element={<AlumniProfilePage />} />
          <Route path="bidding" element={<BiddingPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
