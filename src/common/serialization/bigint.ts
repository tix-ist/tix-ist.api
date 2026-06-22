/**
 * Make `BigInt` JSON-serializable as an integer **string**, so money fields stored
 * in minor units (e.g. `TicketType.price`) round-trip safely over the wire instead
 * of throwing `TypeError: Do not know how to serialize a BigInt`. Import once for
 * side effect during bootstrap.
 *
 * Numbers would lose precision past 2^53; strings don't. Clients parse with BigInt.
 */
interface BigIntWithToJson {
  toJSON?: () => string;
}

(BigInt.prototype as BigIntWithToJson).toJSON = function (
  this: bigint,
): string {
  return this.toString();
};
