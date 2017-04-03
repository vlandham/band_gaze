import * as d3 from 'd3';

/**
 * Helper function to generate random clusters for a random number of points.
 * Uses D3 force layout to figure out x and y positions. Assumes the individual points
 * within the cluster will be rendered in a circular layout (e.g. phyllotaxis)
 */
export default function generateClusters(numPoints, numClusters, pointSize, pointMargin, width, height) {
  // generate normally distributed clusters
  const randomPoints = d3.range(numPoints).map(d3.randomNormal());
  const pointExtent = d3.extent(randomPoints);
  const pointToCluster = d3.scaleQuantize().domain(pointExtent).range(d3.range(numClusters));
  const clusters = d3.range(numClusters).map((id) => ({ size: 0, id }));
  randomPoints.forEach(d => {
    clusters[pointToCluster(d)].size += 1;
  });

  const pointRadius = pointSize / 2;
  const clusterRadius = (size) => Math.ceil(Math.sqrt(size) * (pointRadius + pointMargin));


  // constants used in the simulation
  const center = { x: width / 2, y: height / 2 };
  const forceStrength = 0.03;


  const charge = (d) => -forceStrength * Math.pow(clusterRadius(d.size), 2.0);

  const simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(forceStrength / (width / height)).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3.forceManyBody().strength(charge))
    .force('collide', d3.forceCollide().radius(d => clusterRadius(d.size) + 3));

  simulation.nodes(clusters);

  // force fast computation of 40 ticks and then display the output (no animation)
  const tickMax = 40;

  simulation.stop();
  for (let i = 0; i < tickMax; ++i) {
    simulation.tick();
  }

  return clusters;
}
