import { Link } from 'react-router-dom';
import styles from './Logo.module.css';

export default function Logo() {
  return (
    <Link to="/" className={styles.logo} aria-label="VELOOP Rewards home">
      <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
        <defs>
          <linearGradient id="vr-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f5b942" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path d="M5 10l8.5 20L20 16l6.5 14L35 10" fill="none" stroke="url(#vr-mark)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={styles.text}>
        <strong>VELOOP</strong>
        <small>REWARDS</small>
      </span>
    </Link>
  );
}
