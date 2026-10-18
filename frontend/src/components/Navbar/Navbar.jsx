import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Coins, LogIn, LogOut, Sparkles, User, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGiveaway } from '../../context/GiveawayContext';
import { formatNumber } from '../../utils/currency';
import Logo from '../Logo/Logo';
import Button from '../ui/Button';
import styles from './Navbar.module.css';

const QUICK_PERSONAS = [
  { id: 'VE10050', name: 'Aarav', email: 'aarav@example.com', desc: '850 VEs' },
  { id: 'VE10077', name: 'Meera', email: 'meera@example.com', desc: '120 VEs' },
  { id: 'VE10025', name: 'Isha', email: 'isha@example.com', desc: 'Winner' },
  { id: 'VE90001', name: 'Admin', email: 'admin@example.com', desc: 'Admin' },
];

export default function Navbar({ backTo }) {
  const { user, login, logout } = useAuth();
  const { myStatus } = useGiveaway();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const balances = myStatus?.data?.balances ?? user?.wallet ?? { VE: 850, SVE: 1200, TOKEN: 5000 };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchPersona = async (persona) => {
    try {
      await login({ email: persona.email, password: 'Password@123', userId: persona.id });
      setDropdownOpen(false);
    } catch {
      // Ignore
    }
  };

  return (
    <header className={styles.nav}>
      <div className={`page-container ${styles.inner}`}>
        {backTo ? (
          <Link to={backTo} className={styles.back}>
            <ArrowLeft size={18} aria-hidden="true" />
            <span className={styles.backFull}>Giveaway Home</span>
            <span className={styles.backShort}>Giveaway</span>
          </Link>
        ) : (
          <Logo />
        )}

        {backTo && <span className={styles.centerLogo}><Logo /></span>}

        <nav className={styles.links} aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Rewards Hub
          </NavLink>
          <NavLink to="/giveaway" className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Giveaways
          </NavLink>
        </nav>

        <div className={styles.account} ref={dropdownRef}>
          {user && (
            <div className={styles.balancePills}>
              <span className={styles.pill} title="Virtual Entries (VE)">
                <Coins size={13} color="var(--purple-soft)" />
                <strong>{formatNumber(balances.VE ?? 0)}</strong> VEs
              </span>
              <span className={styles.pill} title="Super Virtual Entries (SVE)">
                <Sparkles size={13} color="var(--green)" />
                <strong>{formatNumber(balances.SVE ?? 0)}</strong> SVEs
              </span>
              <span className={styles.pill} title="Reward Tokens">
                <Zap size={13} color="var(--gold)" />
                <strong>{formatNumber(balances.TOKEN ?? 0)}</strong>
              </span>
            </div>
          )}

          {user ? (
            <>
              <button
                type="button"
                className={styles.userBtn}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-label="User account menu"
              >
                <span className={styles.avatar} aria-hidden="true">
                  {user.displayName?.[0] ?? 'U'}
                </span>
                <span className={styles.userId}>{user.displayName || user.id}</span>
                <ChevronDown size={14} style={{ opacity: 0.7 }} />
              </button>

              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropHeader}>
                    <div className={styles.dropName}>
                      <span>{user.displayName || user.id}</span>
                      {user.role === 'admin' && <span className={styles.dropRole}>Admin</span>}
                    </div>
                    <div className={styles.dropEmail}>{user.email || `${user.id}@veloop.app`}</div>
                  </div>

                  <div className={styles.dropBalances}>
                    <div className={styles.dropBalanceRow}>
                      <span>Virtual Entries (VEs):</span>
                      <span>{formatNumber(balances.VE ?? 0)}</span>
                    </div>
                    <div className={styles.dropBalanceRow}>
                      <span>Super VEs (SVEs):</span>
                      <span>{formatNumber(balances.SVE ?? 0)}</span>
                    </div>
                    <div className={styles.dropBalanceRow}>
                      <span>Reward Tokens:</span>
                      <span>{formatNumber(balances.TOKEN ?? 0)}</span>
                    </div>
                  </div>

                  <div className={styles.dropPersonaSection}>
                    <div className={styles.dropPersonaLabel}>Switch Demo Persona</div>
                    <div className={styles.personaPillGroup}>
                      {QUICK_PERSONAS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className={`${styles.personaPill} ${user.id === p.id ? styles.personaPillActive : ''}`}
                          onClick={() => handleSwitchPersona(p)}
                        >
                          {p.name} ({p.desc})
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="button" className={styles.logoutBtn} onClick={() => { logout(); setDropdownOpen(false); }}>
                    <LogOut size={15} /> Log Out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Button as={Link} to="/login" state={{ from: location.pathname }} size="sm" variant="secondary">
              <LogIn size={15} aria-hidden="true" /> Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
