import { TeamMember } from '@prisma/client';

/** Assignable modules (SETTINGS is intentionally owner-only, not in this list). */
export const MODULE_NAMES = [
  'OVERVIEW',
  'ATTENDEES',
  'TICKETS',
  'SCHEDULE',
  'SPEAKERS',
  'CFP',
  'COMMUNICATIONS',
  'CHECKIN',
] as const;

export type ModuleName = (typeof MODULE_NAMES)[number];

/** The membership context resolved for the current request. */
export interface MembershipContext {
  membership: TeamMember;
  isOwner: boolean;
}
