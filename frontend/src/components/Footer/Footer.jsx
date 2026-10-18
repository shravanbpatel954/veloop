import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import styles from './Footer.module.css';

/** The `#` links are placeholders until VELOOP's legal pages are linked in. */
const LINKS = [
  { label: 'Giveaway Home', to: '/giveaway' },
  { label: 'Rules', to: '/giveaway#rules' },
  { label: 'Terms', to: '#' },
  { label: 'Privacy', to: '#' },
  { label: 'Support', to: '#' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`page-container ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo />
          <p>Have questions? Contact VELOOP Rewards support.</p>
        </div>
        <nav className={styles.links} aria-label="Footer">
          {LINKS.map((link) => (
            <Link key={link.label} to={link.to}>{link.label}</Link>
          ))}
        </nav>
      </div>
      <p className={styles.copy}>© {new Date().getFullYear()} VELOOP Rewards. Giveaway details on this page are subject to the published rules.</p>
    </footer>
  );
}
