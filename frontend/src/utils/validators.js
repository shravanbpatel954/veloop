/** Client-side checks for the claim forms. The backend validates again. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[6-9]\d{9}$/; // Indian mobile numbers
const PIN = /^\d{6}$/;

export const EMPTY_ADDRESS_FORM = { fullName: '', phone: '', address: '', city: '', state: '', pinCode: '' };
export const EMPTY_EMAIL_FORM = { email: '' };

export function validateClaim(formType, values) {
  const errors = {};

  if (formType === 'email') {
    if (!EMAIL.test(values.email.trim())) errors.email = 'Enter a valid email address.';
    return errors;
  }

  if (values.fullName.trim().length < 2) errors.fullName = 'Enter your full name.';
  if (!PHONE.test(values.phone.trim())) errors.phone = 'Enter a valid 10-digit mobile number.';
  if (values.address.trim().length < 8) errors.address = 'Enter your complete address.';
  if (values.city.trim().length < 2) errors.city = 'Enter your city.';
  if (values.state.trim().length < 2) errors.state = 'Enter your state.';
  if (!PIN.test(values.pinCode.trim())) errors.pinCode = 'PIN code must be 6 digits.';
  return errors;
}
