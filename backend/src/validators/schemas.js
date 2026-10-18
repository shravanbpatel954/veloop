import { z } from 'zod';

const trimmed = (min, max) => z.string().trim().min(min).max(max);

export const joinSchema = z.object({
  // Only the prize is accepted. Any extra field (amount, currency, userId...) is stripped.
  prizeId: z.string().trim().min(3).max(40),
});

export const addressClaimSchema = z.object({
  prizeId: z.string().trim().min(3).max(40),
  fullName: trimmed(2, 80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  address: trimmed(8, 250),
  city: trimmed(2, 60),
  state: trimmed(2, 60),
  pinCode: z.string().trim().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
});

export const emailClaimSchema = z.object({
  prizeId: z.string().trim().min(3).max(40),
  email: z.string().trim().toLowerCase().email().max(120),
});

/** The server picks the schema from the prize's claimType; the client can't choose. */
export const claimSchemaFor = (claimType) => (claimType === 'EMAIL' ? emailClaimSchema : addressClaimSchema);

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(100),
});

export const createGiveawaySchema = z.object({
  giveawayId: z.string().min(3).max(30),
  title: trimmed(3, 120),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  rules: z.array(z.object({ id: z.string(), title: z.string(), body: z.string() })).default([]),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  eligibility: z.array(z.string()).default([]),
  prizes: z.array(z.object({
    prizeId: z.string(),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string(),
    position: z.number().int().positive(),
    positionLabel: z.string().optional(),
    imageKey: z.string().optional(),
    accent: z.string().optional(),
    description: z.string().optional(),
    longDescription: z.string().optional(),
    winnerCount: z.number().int().positive(),
    type: z.enum(['PHYSICAL', 'GIFT_CARD', 'DIGITAL']),
    claimType: z.enum(['ADDRESS', 'EMAIL']),
    entry: z.object({ currency: z.enum(['VE', 'SVE', 'TOKEN']), amount: z.number().int().positive() }),
  })).min(1),
}).refine((data) => data.endAt > data.startAt, { message: 'endAt must be after startAt', path: ['endAt'] });

export const claimStatusSchema = z.object({ status: z.enum(['PROCESSING', 'COMPLETED']) });
