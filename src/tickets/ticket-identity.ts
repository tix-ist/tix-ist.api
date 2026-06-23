import { Prisma } from '@prisma/client';
import { randomBytes, randomInt } from 'node:crypto';

/**
 * Ticket-number alphabet with ambiguous characters removed (no 0/O, 1/I/L) so a
 * number is easy to read and type. Mirrors the source app's generator.
 */
const TICKET_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function randomFromAlphabet(alphabet: string, length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[randomInt(alphabet.length)];
  }
  return out;
}

/**
 * Human-readable, collision-resistant ticket number: `TKT-<base36 timestamp>-<10 rand>`.
 * The random part (10 chars of a 32-symbol alphabet ≈ 50 bits) makes collisions
 * negligible; the unique constraint on `Ticket.ticketNumber` is the backstop.
 */
export function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `TKT-${timestamp}-${randomFromAlphabet(TICKET_ALPHABET, 10)}`;
}

/**
 * High-entropy QR payload. Distinct from the (guessable) ticket number so a QR can't
 * be forged by enumerating numbers; the QR image is rendered client-side from this.
 */
export function generateQrToken(): string {
  return randomBytes(24).toString('base64url');
}

/** Build the `createMany` rows to mint `quantity` unassigned tickets for a registration. */
export function buildTicketRows(params: {
  registrationId: string;
  eventId: string;
  ticketTypeId: string;
  quantity: number;
}): Prisma.TicketCreateManyInput[] {
  return Array.from({ length: params.quantity }, () => ({
    registrationId: params.registrationId,
    eventId: params.eventId,
    ticketTypeId: params.ticketTypeId,
    ticketNumber: generateTicketNumber(),
    qrCodeData: generateQrToken(),
  }));
}
