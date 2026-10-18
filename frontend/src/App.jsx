import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GiveawayProvider } from './context/GiveawayContext';
import RewardsHomePage from './pages/RewardsHome/RewardsHomePage';
import GiveawayPage from './pages/Giveaway/GiveawayPage';
import GiveawayDetailsPage from './pages/GiveawayDetails/GiveawayDetailsPage';
import LoginPage from './pages/Login/LoginPage';

/** Jump to the top on navigation, unless the link targets a #section. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <GiveawayProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<RewardsHomePage />} />
          <Route path="/giveaway" element={<GiveawayPage />} />
          <Route path="/giveaway/:slug" element={<GiveawayDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage mode="signup" />} />
          <Route path="*" element={<Navigate to="/giveaway" replace />} />
        </Routes>
      </GiveawayProvider>
    </AuthProvider>
  );
}
