import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  Flame,
  Gift,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  TrendingUp,
  Trophy,
  Wallet,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGiveaway } from '../../context/GiveawayContext';
import { artwork } from '../../utils/prizeImages';
import { formatNumber } from '../../utils/currency';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import GiveawayBanner from '../../components/GiveawayBanner/GiveawayBanner';
import DemoPanel from '../../components/DemoPanel/DemoPanel';
import styles from './RewardsHomePage.module.css';

const EARN_ACTIVITIES = [
  {
    id: 'checkin',
    title: 'Daily Check-in Streak',
    desc: 'Log in every day to claim bonus VEs. Reach 7 days for a mystery prize box.',
    reward: '+50 VEs',
    time: 'Instant',
    icon: Flame,
    color: '#f97316',
    action: 'Claim Today',
  },
  {
    id: 'survey',
    title: 'Verified Partner Survey',
    desc: 'Answer a quick 2-minute survey on reward preferences and shopping habits.',
    reward: '+150 VEs',
    time: '2 mins',
    icon: Sparkles,
    color: '#a855f7',
    action: 'Start Survey',
  },
  {
    id: 'refer',
    title: 'Invite Friends to VELOOP',
    desc: 'Share your personal code with friends. Both of you receive entries when they join.',
    reward: '+250 VEs & 500 Tokens',
    time: 'Per friend',
    icon: Zap,
    color: '#3b82f6',
    action: 'Copy Code',
  },
  {
    id: 'shop',
    title: 'Partner Merchant Cashback',
    desc: 'Shop online with partnered brands to earn high-tier Super Virtual Entries (SVEs).',
    reward: 'Up to 500 SVEs',
    time: 'Cashback',
    icon: TrendingUp,
    color: '#34d399',
    action: 'Explore Brands',
  },
];

const FEATURED_VOUCHERS = [
  {
    slug: 'amazon-2000',
    title: '₹2,000 Amazon Gift Card',
    fee: '500 VEs',
    category: 'Voucher Draw',
    image: artwork.amazon2000,
    badge: 'Lucky Draw',
  },
  {
    slug: 'amazon-500',
    title: '₹500 Amazon Gift Card',
    fee: '300 VEs',
    category: 'Voucher Draw',
    image: artwork.amazon500,
    badge: 'Popular',
  },
  {
    slug: 'amazon-20',
    title: '₹20 Amazon Gift Card',
    fee: '2,000 Tokens',
    category: 'Token Redemption',
    image: artwork.amazon20,
    badge: '10 Winners',
  },
  {
    slug: 'airpods',
    title: 'AirPods Pro 2',
    fee: '500 SVEs',
    category: 'Gadget Draw',
    image: artwork.airpods,
    badge: '5 Winners',
  },
];

export default function RewardsHomePage() {
  const { user } = useAuth();
  const { myStatus } = useGiveaway();
  const [claimedStreak, setClaimedStreak] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const balances = myStatus?.data?.balances ?? user?.wallet ?? { VE: 850, SVE: 1200, TOKEN: 5000 };

  const handleClaim = (id) => {
    if (id === 'checkin') {
      setClaimedStreak(true);
    } else if (id === 'refer') {
      navigator.clipboard?.writeText('VELOP-GIVEAWAY-2026');
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <>
      <Navbar />
      <main className={`page-container ${styles.container}`}>
        {/* User Hub & Balances */}
        <section className={styles.userHub} aria-label="Your Rewards Account">
          <span className={styles.hubGlow} aria-hidden="true" />
          <div className={styles.hubTop}>
            <div className={styles.userProfile}>
              <div className={styles.avatarRing} aria-hidden="true">
                {user?.displayName?.[0] ?? 'V'}
              </div>
              <div className={styles.userInfo}>
                <h1>
                  {user ? `Welcome back, ${user.displayName}` : 'VELOP Rewards Hub'}
                  <span className={styles.tierPill}>
                    <Star size={12} fill="currentColor" /> Gold Member
                  </span>
                </h1>
                <p className={styles.subText}>
                  {user
                    ? `Account ID: ${user.id} · Level 4 Elite · 2,450 XP`
                    : 'Earn entries, collect VEs, and win premium Apple gadgets and Amazon vouchers.'}
                </p>
              </div>
            </div>

            <div className={styles.streakBadge}>
              <Flame size={26} />
              <div>
                <strong>{claimedStreak ? '6-Day Streak! 🔥' : '5-Day Streak Active'}</strong>
                <small>{claimedStreak ? '+50 VEs credited to wallet' : '+50 VEs ready to claim'}</small>
              </div>
            </div>
          </div>

          <div className={styles.walletsGrid}>
            <div className={styles.walletCard}>
              <div className={styles.walletHeader}>
                <span>Virtual Entries (VE)</span>
                <Coins size={16} color="var(--purple-soft)" />
              </div>
              <div className={styles.walletAmount}>{formatNumber(balances.VE ?? 0)} <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>VEs</small></div>
              <span className={styles.walletDesc}>Used for iPhone 15 Pro & Apple Watch draws</span>
            </div>

            <div className={styles.walletCard}>
              <div className={styles.walletHeader}>
                <span>Super VEs (SVE)</span>
                <Sparkles size={16} color="var(--green)" />
              </div>
              <div className={styles.walletAmount}>{formatNumber(balances.SVE ?? 0)} <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>SVEs</small></div>
              <span className={styles.walletDesc}>High-tier entries for AirPods Pro 2 draws</span>
            </div>

            <div className={styles.walletCard}>
              <div className={styles.walletHeader}>
                <span>Reward Tokens</span>
                <Zap size={16} color="var(--gold)" />
              </div>
              <div className={styles.walletAmount}>{formatNumber(balances.TOKEN ?? 0)} <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tokens</small></div>
              <span className={styles.walletDesc}>Instant redemption for Amazon gift cards</span>
            </div>
          </div>
        </section>

        {/* Live Community Activity Marquee */}
        <div className={styles.tickerWrap} aria-label="Recent activity">
          <span className={styles.tickerTag}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} /> Live Activity
          </span>
          <div className={styles.tickerText}>
            <span className={styles.tickerItem}>🏆 VE****50 entered iPhone 15 Pro draw</span>
            <span className={styles.tickerItem}>🎁 VE****25 won Apple Watch Series 9</span>
            <span className={styles.tickerItem}>⚡ VE****77 claimed Daily Streak bonus (+50 VEs)</span>
            <span className={styles.tickerItem}>🛍️ VE****42 redeemed ₹2,000 Amazon Voucher</span>
            <span className={styles.tickerItem}>✨ VE****18 completed Survey (+150 VEs)</span>
            {/* Duplicated for seamless loop */}
            <span className={styles.tickerItem}>🏆 VE****50 entered iPhone 15 Pro draw</span>
            <span className={styles.tickerItem}>🎁 VE****25 won Apple Watch Series 9</span>
            <span className={styles.tickerItem}>⚡ VE****77 claimed Daily Streak bonus (+50 VEs)</span>
            <span className={styles.tickerItem}>🛍️ VE****42 redeemed ₹2,000 Amazon Voucher</span>
          </div>
        </div>

        {/* Section 5 & 6: The Grand Giveaway Banner */}
        <GiveawayBanner />

        {/* Ways to Earn Entries */}
        <section aria-labelledby="earn-heading">
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="earn-heading">
                <Coins size={22} color="var(--gold)" /> Ways to Earn Entries & VEs
              </h2>
              <p>Complete eligible activities daily to grow your balances and enter more draws.</p>
            </div>
            <Link to="/giveaway#how-it-works" style={{ color: 'var(--purple-soft)', fontSize: '0.88rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Full Rules & Timeline <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.earnGrid}>
            {EARN_ACTIVITIES.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className={styles.earnCard}>
                  <div className={styles.earnTop}>
                    <div className={styles.earnIcon} style={{ background: `${activity.color}22`, color: activity.color }}>
                      <Icon size={22} />
                    </div>
                    <div className={styles.earnMeta}>
                      <h3>{activity.title}</h3>
                      <p>{activity.desc}</p>
                    </div>
                  </div>

                  <div className={styles.earnBottom}>
                    <span className={styles.earnReward}>
                      <Gift size={15} /> {activity.reward}
                    </span>
                    <button
                      type="button"
                      className={styles.claimBtn}
                      onClick={() => handleClaim(activity.id)}
                    >
                      {activity.id === 'checkin' && claimedStreak ? (
                        <>Claimed <CheckCircle2 size={14} color="var(--green)" /></>
                      ) : activity.id === 'refer' && copiedCode ? (
                        <>Copied Code ✓</>
                      ) : (
                        activity.action
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Vouchers & Rewards Showcase */}
        <section aria-labelledby="vouchers-heading">
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="vouchers-heading">
                <Ticket size={22} color="var(--purple-soft)" /> Instant Draws & Gift Vouchers
              </h2>
              <p>Every reward has its own transparent draw. Join directly from the prize page.</p>
            </div>
            <Link to="/giveaway" style={{ color: 'var(--purple-soft)', fontSize: '0.88rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              View All 6 Prizes <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.voucherGrid}>
            {FEATURED_VOUCHERS.map((voucher) => (
              <Link key={voucher.slug} to={`/giveaway/${voucher.slug}`} className={styles.voucherCard}>
                <div className={styles.voucherThumb}>
                  <img src={voucher.image} alt={voucher.title} loading="lazy" />
                </div>
                <div className={styles.voucherInfo}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--purple-soft)', textTransform: 'uppercase' }}>
                    {voucher.badge}
                  </span>
                  <h4>{voucher.title}</h4>
                  <div className={styles.voucherFee}>
                    <Coins size={15} /> Entry: {voucher.fee}
                  </div>
                </div>
                <div className={styles.voucherAction}>
                  <span>Review & Join</span>
                  <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <DemoPanel />
    </>
  );
}
