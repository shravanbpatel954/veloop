import { Gift, Star } from 'lucide-react';
import { useGiveaway } from '../../context/GiveawayContext';
import { hasJoinedPrize } from '../../utils/participation';
import PrizeCard from '../PrizeCard/PrizeCard';
import SectionHeading from '../ui/SectionHeading';
import Skeleton from '../ui/Skeleton';
import StateMessage from '../ui/StateMessage';
import styles from './FeaturedGiveaways.module.css';

export default function FeaturedGiveaways({ onViewWinners }) {
  const { current, giveaway, serverOffsetMs, syncWithServer, myStatus } = useGiveaway();
  const isLoading = current.status === 'loading';
  const prizes = giveaway?.prizes ?? [];

  return (
    <section className={styles.panel} id="prizes" aria-labelledby="prizes-title">
      <SectionHeading
        id="prizes-title"
        icon={Star}
        title="Featured Giveaways"
        subtitle="Every reward has its own draw, entry fee and rules. Open one to see the details before you join."
      />

      {isLoading ? (
        <div className={styles.grid} aria-busy="true">
          {[0, 1, 2].map((i) => <PrizeCardSkeleton key={i} />)}
        </div>
      ) : prizes.length === 0 ? (
        <StateMessage icon={Gift} title="No rewards listed yet" message="Prizes for this giveaway will appear here soon." compact />
      ) : (
        <ul className={styles.grid}>
          {prizes.map((prize) => (
            <li key={prize.id}>
              <PrizeCard
                prize={prize}
                giveaway={giveaway}
                serverOffsetMs={serverOffsetMs}
                joined={hasJoinedPrize(myStatus.data, prize.id)}
                onViewWinners={onViewWinners}
                onTimerComplete={syncWithServer}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PrizeCardSkeleton() {
  return (
    <div className={styles.skeleton}>
      <Skeleton height={150} radius={16} />
      <Skeleton width="70%" height={20} />
      <Skeleton width="90%" height={14} />
      <Skeleton height={44} radius={12} />
    </div>
  );
}
