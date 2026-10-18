import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, SearchX } from 'lucide-react';
import { useGiveaway } from '../../context/GiveawayContext';
import { useJoinGiveaway } from '../../hooks/useJoinGiveaway';
import { hasJoinedPrize } from '../../utils/participation';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import GiveawayLoader from '../../components/GiveawayLoader/GiveawayLoader';
import { PrizeHeader, PrizeVisual } from '../../components/details/PrizeDetailsHero';
import EntryPanel from '../../components/details/EntryPanel';
import GiveawayWorks from '../../components/details/GiveawayWorks';
import { AboutPrize, ImportantInfo, ParticipationRules, TermsSection } from '../../components/details/PrizeInfoSections';
import { ConfirmJoinModal, LoginRequiredModal } from '../../components/details/JoinModals';
import DemoPanel from '../../components/DemoPanel/DemoPanel';
import Button from '../../components/ui/Button';
import StateMessage from '../../components/ui/StateMessage';
import styles from './GiveawayDetailsPage.module.css';

/**
 * /giveaway/:slug  -  everything a user needs to decide, then the join flow:
 * review -> check balance -> confirm modal -> backend call -> success.
 * Joining never happens from the main Giveaway page.
 */
export default function GiveawayDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { current, giveaway, serverOffsetMs, syncWithServer, myStatus, user, reloadMyStatus } = useGiveaway();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const prize = giveaway?.prizes.find((item) => item.slug === slug);
  const join = useJoinGiveaway({ giveawayId: giveaway?.id, prizeId: prize?.id, onJoined: reloadMyStatus });

  if (current.status === 'loading' && !current.data) return <GiveawayLoader />;

  if (current.status === 'error') {
    return (
      <Shell>
        <StateMessage icon={AlertTriangle} title="Unable to load giveaway" message="We couldn't load the giveaway information. Please try again." action={<Button onClick={() => current.reload()}>Try Again</Button>} />
      </Shell>
    );
  }

  if (!giveaway || !prize) {
    return (
      <Shell>
        <StateMessage icon={SearchX} title="Giveaway not found" message="This giveaway doesn't exist or is no longer available." action={<Button as={Link} to="/giveaway">Back to Giveaway Home</Button>} />
      </Shell>
    );
  }

  const joined = hasJoinedPrize(myStatus.data, prize.id);

  const openConfirm = () => {
    join.reset();
    setConfirmOpen(true);
  };

  return (
    <>
      <Navbar backTo="/giveaway" />
      <main className={`page-container ${styles.stack}`}>
        <div className="row g-4">
          <div className="col-12 col-lg-5"><PrizeVisual prize={prize} /></div>
          <div className="col-12 col-lg-7">
            <div className={styles.info}>
              <PrizeHeader prize={prize} giveaway={giveaway} serverOffsetMs={serverOffsetMs} onTimerComplete={syncWithServer} />
              <EntryPanel
                prize={prize}
                giveaway={giveaway}
                user={user}
                myStatus={myStatus.data}
                statusLoading={myStatus.status === 'loading'}
                joined={joined}
                onJoin={openConfirm}
                onLogin={() => setLoginOpen(true)}
                onEarn={() => navigate('/giveaway#how-it-works')}
                onViewWinners={() => navigate('/giveaway#winners')}
              />
            </div>
          </div>
        </div>

        <GiveawayWorks />

        <div className="row g-4">
          <div className="col-12 col-lg-7"><AboutPrize prize={prize} /></div>
          <div className="col-12 col-lg-5"><ParticipationRules giveaway={giveaway} /></div>
        </div>

        <TermsSection giveaway={giveaway} prize={prize} />
        <ImportantInfo giveaway={giveaway} prize={prize} />
      </main>
      <Footer />

      <LoginRequiredModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <ConfirmJoinModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        prize={prize}
        balances={myStatus.data?.balances}
        join={join}
        onViewGiveaway={() => navigate('/giveaway')}
      />
      <DemoPanel />
    </>
  );
}

function Shell({ children }) {
  return (
    <>
      <Navbar backTo="/giveaway" />
      <main className="page-container" style={{ paddingTop: 72 }}>{children}</main>
      <DemoPanel />
    </>
  );
}
