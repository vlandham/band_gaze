// theta for phyllotaxis layout
const theta = Math.PI * (3 - Math.sqrt(5));

/**
 * Given a set of points, lay them out in a phyllotaxis layout.
 * Currently mutates the `points` passed in by updating the x and y values.
 *
 * @param {Object[]} points The array of points to update. Will get `x` and `y` set.
 * @param {Number} radiusX The size in pixels of the point in the X dimension. Should also include margin.
 * @param {Number} radiusY The size in pixels of the point in the Y dimension. Should also include margin.
 * @param {Number} xOffset The x offset to apply to all points
 * @param {Number} yOffset The y offset to apply to all points
 *
 * @return {Object[]} points with modified x and y
 */
export default function phyllotaxisLayout(points, radiusX, radiusY, xOffset = 0, yOffset = 0) {
  points.forEach((point, i) => {
    const phylloX = radiusX * Math.sqrt(i) * Math.cos(i * theta);
    const phylloY = radiusY * Math.sqrt(i) * Math.sin(i * theta);

    point.x = xOffset + phylloX;
    point.y = yOffset + phylloY;
  });

  return points;
}
