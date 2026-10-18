import { AuditLog } from '../models/AuditLog.js';

/** Audit writes must never break the request they describe. */
export async function audit(entry, { session } = {}) {
  try {
    await AuditLog.create([entry], session ? { session } : undefined);
  } catch (error) {
    console.error('audit log failed', error.message);
  }
}
