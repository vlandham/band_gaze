const X = 0;
const Y = 1;

/**
 * Calculates the length of a line given two points
 *
 * @param {Number[]} a The first point [x, y]
 * @param {Number[]} b The second point [x, y]
 *
 * @return {Number} The length of the line
 */
export default function lineLength(a, b) {
  return Math.sqrt(Math.pow(a[X] - b[X], 2) + Math.pow(a[Y] - b[Y], 2));
}
