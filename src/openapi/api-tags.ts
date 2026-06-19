/**
 * Single source of truth for OpenAPI tags. Controllers reference {@link ApiTag}
 * constants via `@ApiTags(...)`; `API_TAGS` supplies the rich, markdown-capable
 * descriptions that `buildDocumentConfig` registers with `DocumentBuilder.addTag`.
 *
 * Registering every contracted tag up front is forward-looking: renderers only show
 * a tag group once it has operations, so unused tags stay inert (descriptions ready)
 * until their feature modules land.
 */
export const ApiTag = {
  Auth: 'Auth',
  Users: 'Users',
  Events: 'Events',
  TicketTypes: 'TicketTypes',
  Registrations: 'Registrations',
  Tickets: 'Tickets',
  Attendees: 'Attendees',
  Schedule: 'Schedule',
  Speakers: 'Speakers',
  CFP: 'CFP',
  Communications: 'Communications',
  Team: 'Team',
  CheckIn: 'CheckIn',
  Uploads: 'Uploads',
  Webhooks: 'Webhooks',
  Jobs: 'Jobs',
  Health: 'Health',
} as const;

export type ApiTagName = (typeof ApiTag)[keyof typeof ApiTag];

export interface ApiTagDefinition {
  name: ApiTagName;
  description: string;
}

export const API_TAGS: readonly ApiTagDefinition[] = [
  {
    name: ApiTag.Auth,
    description:
      'Authentication and session lifecycle. Register and log in with email + password to ' +
      'receive a short-lived **access token** and a rotating **refresh token**; exchange the ' +
      'refresh token for a new pair, or revoke it on logout. Tokens are bearer JWTs.',
  },
  {
    name: ApiTag.Users,
    description:
      "The authenticated user's own profile (`/me`): view and update profile details, change " +
      'password, and review a summary of their events.',
  },
  {
    name: ApiTag.Events,
    description:
      'Event lifecycle — the root resource everything else hangs off. Create and manage events, ' +
      'custom registration fields, and the `draft → published → archived` status flow.',
  },
  {
    name: ApiTag.TicketTypes,
    description:
      'Purchasable ticket tiers for an event: name, price (integer minor units), quantity and ' +
      'sale window. Availability is derived from issued tickets.',
  },
  {
    name: ApiTag.Registrations,
    description:
      'Orders/purchases for an event. Public self-registration is concurrency-safe (row-locked to ' +
      'prevent overselling); organizers can also add, list, cancel and export registrations.',
  },
  {
    name: ApiTag.Tickets,
    description:
      'Individual admission tickets issued from a registration: QR identity, optimistic-locked ' +
      'assignment to attendees, and lookup by ticket number.',
  },
  {
    name: ApiTag.Attendees,
    description:
      'People attending (distinct from the buyer): custom-field responses, email deliverability ' +
      'state, CSV import, and list export.',
  },
  {
    name: ApiTag.Schedule,
    description:
      'Sessions/agenda for an event — tracks, timing, and speaker assignments, with overlap ' +
      'detection and optimistic-locked edits.',
  },
  {
    name: ApiTag.Speakers,
    description:
      'Speaker profiles for an event and their assignment to schedule sessions.',
  },
  {
    name: ApiTag.CFP,
    description:
      'Call for Papers: public proposal submission, organizer review, and accept/reject ' +
      '(acceptance creates a speaker profile).',
  },
  {
    name: ApiTag.Communications,
    description:
      'Email campaigns to attendee segments, with delivery analytics fed by the provider webhook.',
  },
  {
    name: ApiTag.Team,
    description:
      'Event collaboration: invite collaborators with module-scoped permissions, manage ' +
      'memberships, and accept/decline invitations. Backs the owner/collaborator RBAC model.',
  },
  {
    name: ApiTag.CheckIn,
    description:
      'On-site attendee check-in by ticket number or QR code (idempotent), plus live check-in metrics.',
  },
  {
    name: ApiTag.Uploads,
    description:
      'File uploads (images, documents) backed by a pluggable storage adapter.',
  },
  {
    name: ApiTag.Webhooks,
    description:
      'Inbound provider webhooks (e.g. email delivery events). Signature-verified; not called by API clients.',
  },
  {
    name: ApiTag.Jobs,
    description:
      'Scheduler-triggered maintenance endpoints (close expired CFPs, send scheduled campaigns, ' +
      'expire invitations). Protected by a shared secret, not end-user auth.',
  },
  {
    name: ApiTag.Health,
    description: 'Service liveness/health checks.',
  },
];
