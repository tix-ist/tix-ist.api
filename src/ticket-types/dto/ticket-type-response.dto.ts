/** A ticket tier as returned by the API. */
export class TicketTypeResponseDto {
  /** Unique tier id (cuid). */
  id!: string;

  /** The event this tier belongs to. */
  eventId!: string;

  /** Tier name. */
  name!: string;

  /** Tier description. */
  description!: string;

  /**
   * Price in minor units, serialized as an integer **string** (e.g. "500000" = ₦5,000).
   * @example "500000"
   */
  price!: string;

  /** ISO 4217 currency code. */
  currency!: string;

  /** Total inventory. */
  quantity!: number;

  /** Tickets issued so far (0 until ticketing lands). */
  sold!: number;

  /** Remaining inventory (`quantity − sold`). */
  available!: number;

  /** When the tier goes on sale, or null. */
  saleStart!: Date | null;

  /** When the tier stops selling, or null. */
  saleEnd!: Date | null;

  /** Creation timestamp. */
  createdAt!: Date;

  /** Last-update timestamp. */
  updatedAt!: Date;
}
