import { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { giveawayApi } from '../../api/giveawayApi';
import { describeError } from '../../utils/errorMessages';
import { getPrizeType } from '../../utils/prizeTypes';
import { EMPTY_ADDRESS_FORM, EMPTY_EMAIL_FORM, validateClaim } from '../../utils/validators';
import Button from '../ui/Button';
import Field from '../ui/Field';
import Modal from '../ui/Modal';
import styles from './PrizeClaimModal.module.css';

/**
 * Claim form. Which form appears is decided by the prize type (see
 * utils/prizeTypes.js): physical prizes collect a delivery address, gift
 * cards and digital rewards only collect an email.
 */
export default function PrizeClaimModal({ open, onClose, prize, giveaway, onSubmitted }) {
  const type = getPrizeType(prize);
  const formType = type.claimForm;
  const blank = formType === 'email' ? EMPTY_EMAIL_FORM : EMPTY_ADDRESS_FORM;

  const [values, setValues] = useState(blank);
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState('form'); // form | submitting | done
  const [apiError, setApiError] = useState(null);

  // Start fresh every time the modal opens.
  useEffect(() => {
    if (open) {
      setValues(blank);
      setErrors({});
      setPhase('form');
      setApiError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prize?.id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateClaim(formType, values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setPhase('submitting');
    setApiError(null);
    try {
      await giveawayApi.submitClaim(giveaway.id, { prizeId: prize.id, details: values });
      setPhase('done');
      onSubmitted?.();
    } catch (error) {
      setApiError(describeError(error));
      setPhase('form');
    }
  };

  if (!prize) return null;

  return (
    <Modal open={open} onClose={onClose} dismissible={phase !== 'submitting'} title={phase === 'done' ? 'Claim Submitted ✓' : type.claimTitle} labelledBy="claim-title">
      {phase === 'done' ? (
        <div className={styles.done}>
          <CheckCircle2 size={44} aria-hidden="true" />
          <p>Thank you! Our team will verify your details and process <strong>{prize.name}</strong>.</p>
          <Button block onClick={onClose}>Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <p className={styles.intro}>You won <strong>{prize.name}</strong></p>

          {formType === 'email' ? (
            <Field label="Email Address" id="email" type="email" autoComplete="email" placeholder="you@example.com" value={values.email} onChange={handleChange} error={errors.email} hint="Enter the email where you want to receive your gift card." />
          ) : (
            <>
              <Field label="Full Name" id="fullName" autoComplete="name" value={values.fullName} onChange={handleChange} error={errors.fullName} />
              <Field label="Phone Number" id="phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="10-digit mobile number" value={values.phone} onChange={handleChange} error={errors.phone} />
              <Field label="Complete Address" id="address" as="textarea" autoComplete="street-address" value={values.address} onChange={handleChange} error={errors.address} />
              <div className={styles.row}>
                <Field label="City" id="city" autoComplete="address-level2" value={values.city} onChange={handleChange} error={errors.city} />
                <Field label="State" id="state" autoComplete="address-level1" value={values.state} onChange={handleChange} error={errors.state} />
                <Field label="PIN Code" id="pinCode" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={values.pinCode} onChange={handleChange} error={errors.pinCode} />
              </div>
            </>
          )}

          <p className={styles.privacy}><ShieldCheck size={15} aria-hidden="true" /> {type.claimNote} Your details are never shown publicly.</p>

          {apiError && <p className={styles.apiError} role="alert"><strong>{apiError.title}.</strong> {apiError.message}</p>}

          <Button type="submit" size="lg" block loading={phase === 'submitting'}>
            {phase === 'submitting' ? 'Submitting claim...' : 'Submit Claim'}
          </Button>
        </form>
      )}
    </Modal>
  );
}
