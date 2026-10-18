import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarClock, Gift } from 'lucide-react';
import { useGiveaway } from '../../context/GiveawayContext';
import { useScrollToHash } from '../../hooks/useScrollToHash';
import { getUserState } from '../../utils/participation';
import { buildWinnerMessages } from '../../utils/winnerMessages';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import GiveawayLoader from '../../components/GiveawayLoader/GiveawayLoader';
import GiveawayHero from '../../components/GiveawayHero/GiveawayHero';
import UserStatusCard from '../../components/UserStatusCard/UserStatusCard';
import WinnerClaimCard from '../../components/WinnerClaimCard/WinnerClaimCard';
import GiveawayStats from '../../components/GiveawayStats/GiveawayStats';
import FeaturedGiveaways from '../../components/FeaturedGiveaways/FeaturedGiveaways';
import HowToParticipate from '../../components/HowToParticipate/HowToParticipate';
import WinnerSlider from '../../components/WinnerSlider/WinnerSlider';
import WinnersTabs from '../../components/WinnersTabs/WinnersTabs';
import TrustSection from '../../components/TrustSection/TrustSection';
import GiveawayRules from '../../components/GiveawayRules/GiveawayRules';
import FAQ from '../../components/FAQ/FAQ';
import DemoPanel from '../../components/DemoPanel/DemoPanel';
import Button from '../../components/ui/Button';
import StateMessage from '../../components/ui/StateMessage';
import { scrollToSection } from '../../components/ActionButton/ActionButton';
import styles from './GiveawayPage.module.css';

export default function GiveawayPage() {
  const { current, giveaway, nextGiveaway, serverOffsetMs, syncWithServer, winners, previous, myStatus, user, isDemoData, reloadMyStatus } = useGiveaway();

  useScrollToHash(current.status === 'success');

  const userState = getUserState({ user, myStatus: myStatus.data, giveaway });
  const sliderMessages = useMemo(
    () => buildWinnerMessages({ currentWinners: winners.data?.winners, previous: previous.data?.giveaways }),
    [winners.data, previous.data],
  );

  // First load: the themed loader. Later reloads keep the page and show skeletons.
  if (current.status === 'loading' && !current.data) {
    return <GiveawayLoader />;
  }

  if (current.status === 'error') {
    return (
      <>
        <Navbar />
        <main className="page-container" style={{ paddingTop: 80 }}>
          <StateMessage
            icon={AlertTriangle}
            title="Unable to load giveaway"
            message="We couldn't load the giveaway information. Please try again."
            action={<Button onClick={() => current.reload()}>Try Again</Button>}
          />
        </main>
        <DemoPanel />
      </>
    );
  }

  const winnings = myStatus.data?.winnings ?? [];

  return (
    <>
      <Navbar />
      <main>
        <GiveawayHero giveaway={giveaway} nextGiveaway={nextGiveaway} userState={userState} serverOffsetMs={serverOffsetMs} onTimerComplete={syncWithServer} loading={current.status === 'loading'} />

        <div className={`page-container ${styles.stack}`}>
          {userState === 'winner' && winnings.map((winning) => {
            const prize = giveaway.prizes.find((item) => item.id === winning.prizeId);
            return prize ? <WinnerClaimCard key={winning.prizeId} winning={winning} prize={prize} giveaway={giveaway} onClaimed={reloadMyStatus} /> : null;
          })}

          <UserStatusCard userState={userState} user={user} myStatus={myStatus.data} loading={myStatus.status === 'loading'} giveaway={giveaway} nextGiveaway={nextGiveaway} />

          {!giveaway && current.status === 'success' ? (
            <StateMessage icon={CalendarClock} title="No current giveaway" message="The next giveaway is being prepared. Check back soon." />
          ) : (
            <>
              <GiveawayStats />

              <div className="row g-4">
                <div className="col-12 col-xl-8"><FeaturedGiveaways onViewWinners={() => scrollToSection('winners')} /></div>
                <div className="col-12 col-xl-4"><HowToParticipate /></div>
              </div>

              <WinnerSlider messages={sliderMessages} isDemoData={isDemoData} />
              <WinnersTabs />

              {userState === 'non-winner' && (
                <section className={styles.notice} aria-label="Next giveaway">
                  <Gift size={26} aria-hidden="true" />
                  <div>
                    <h2>Didn&apos;t win this time?</h2>
                    <p>Keep participating for the next giveaway.</p>
                  </div>
                  <Button as={Link} to="#prizes" variant="secondary" onClick={(event) => { event.preventDefault(); scrollToSection('prizes'); }}>
                    Explore Next Giveaway <ArrowRight size={16} aria-hidden="true" />
                  </Button>
                </section>
              )}

              <TrustSection />
              <div className="row g-4">
                <div className="col-12 col-lg-6"><GiveawayRules /></div>
                <div className="col-12 col-lg-6"><FAQ /></div>
              </div>

              <section className={styles.finalCta}>
                <h2>Ready for your chance to win?</h2>
                <p>Review a reward, check the entry fee and join when you&apos;re ready.</p>
                <Button size="lg" onClick={() => scrollToSection('prizes')}>Browse Rewards <ArrowRight size={18} aria-hidden="true" /></Button>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
      <DemoPanel />
    </>
  );
}
