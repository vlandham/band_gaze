import * as d3 from 'd3';

/**
 * Helper function to generate N random points
 */
export default function generatePoints(numPoints, width, height) {
  const points = d3.range(numPoints).map((id) => {
    const col = (Math.random() * 0.8) + 0.1;
    return {
      id,
      x: Math.random() * width,
      y: Math.random() * height,
      color: [col, col, col, 1],
    };
  });

  return points;
}
