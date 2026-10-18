import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogIn, UserRound } from 'lucide-react';
import { isMockMode } from '../../api/giveawayApi';
import { useAuth } from '../../context/AuthContext';
import { PERSONAS } from '../../data/giveawayData';
import { describeError } from '../../utils/errorMessages';
import Navbar from '../../components/Navbar/Navbar';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import styles from './LoginPage.module.css';

/**
 * Mock mode: pick a demo account to test each user state.
 * Live mode: a simple email + password form that talks to POST /api/auth/login
 * (replace it with the existing VELOOP login when integrating).
 */
export default function LoginPage({ mode = 'login' }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from ?? '/giveaway';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const signIn = async (credentials) => {
    setBusy(true);
    setError(null);
    try {
      await login(credentials);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(describeError(err));
      setBusy(false);
    }
  };

  const title = mode === 'signup' ? 'Create your account' : 'Login to VELOOP Rewards';

  return (
    <>
      <Navbar backTo={returnTo} />
      <main className={styles.main}>
        <section className={styles.card} aria-labelledby="login-title">
          <h1 id="login-title">{title}</h1>

          {isMockMode ? (
            <>
              <p className={styles.sub}>
                {mode === 'signup' ? 'Sign-up is not part of this task. ' : ''}Choose a demo account to continue. Each one shows a different giveaway state.
              </p>
              <ul className={styles.personas}>
                {Object.values(PERSONAS).map((persona) => (
                  <li key={persona.id}>
                    <button type="button" disabled={busy} onClick={() => signIn({ userId: persona.id })}>
                      <span className={styles.avatar}><UserRound size={18} aria-hidden="true" /></span>
                      <span className={styles.who}><strong>{persona.displayName} <small>{persona.id}</small></strong><span>{persona.label}</span></span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div style={{ margin: '14px 0 20px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--purple-soft)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 8, letterSpacing: '0.05em' }}>
                  ⚡ Quick Demo Accounts (1-Click Login)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                  <button type="button" disabled={busy} onClick={() => signIn({ userId: 'VE10050', email: 'aarav@example.com', password: 'Password@123' })} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--text)', textAlign: 'left', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Aarav</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>850 VEs (Participant)</div>
                  </button>
                  <button type="button" disabled={busy} onClick={() => signIn({ userId: 'VE10077', email: 'meera@example.com', password: 'Password@123' })} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--text)', textAlign: 'left', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Meera</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>120 VEs (Low Bal)</div>
                  </button>
                  <button type="button" disabled={busy} onClick={() => signIn({ userId: 'VE10025', email: 'isha@example.com', password: 'Password@123' })} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--text)', textAlign: 'left', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Isha</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--gold)' }}>Winner (Claim Flow)</div>
                  </button>
                  <button type="button" disabled={busy} onClick={() => signIn({ userId: 'VE90001', email: 'admin@example.com', password: 'Password@123' })} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--text)', textAlign: 'left', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Admin</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--purple-soft)' }}>Draw Manager</div>
                  </button>
                </div>
              </div>

              <form onSubmit={(event) => { event.preventDefault(); signIn(form); }} className={styles.form}>
                <p className={styles.sub}>{mode === 'signup' ? 'Account creation is handled by the main VELOOP signup flow.' : 'Or sign in with custom credentials.'}</p>
                <Field label="Email" id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <Field label="Password" id="password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <Button type="submit" size="lg" block loading={busy}><LogIn size={18} aria-hidden="true" /> Login</Button>
              </form>
            </>
          )}

          {error && <p className={styles.error} role="alert"><strong>{error.title}.</strong> {error.message}</p>}
        </section>
      </main>
    </>
  );
}
