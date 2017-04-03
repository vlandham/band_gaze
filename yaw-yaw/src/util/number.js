let nextSequenceNumber = 0;
/**
 * Return a monotonically increasing number each time this function is called.
 * @return {Number} a sequence number
 */
export function nextSeq() {
  nextSequenceNumber += 1;
  return nextSequenceNumber;
}
