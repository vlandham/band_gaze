import * as d3 from 'd3';

/**
 * Helper function to layout the clusters so that they fit the points
 * Uses D3 force layout to figure out x and y positions. Assumes the individual points
 * within the cluster will be rendered in a circular layout (e.g. phyllotaxis)
 */
export default function clusterLayout(clusters, pointSize, pointMargin, width, height) {
  const numClusters = clusters.length;
  const pointRadius = pointSize / 2;
  const clusterRadius = (size) => Math.ceil(Math.sqrt(size) * (pointRadius + pointMargin));

  const layoutClusters = d3.range(numClusters).map((id) => ({ id, cluster: clusters[id] }));

  // constants used in the simulation
  const center = { x: width / 2, y: height / 2 };
  const forceStrength = 0.03;

  const charge = (d) => -forceStrength * Math.pow(clusterRadius(d.cluster.cities.length), 2.0);

  const simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(forceStrength / (width / height)).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3.forceManyBody().strength(charge))
    .force('collide', d3.forceCollide().radius(d => clusterRadius(d.cluster.cities.length) + 3));

  simulation.nodes(layoutClusters);

  // force fast computation of 40 ticks and then display the output (no animation)
  const tickMax = 40;

  simulation.stop();
  for (let i = 0; i < tickMax; ++i) {
    simulation.tick();
  }

  // at this point the x and y positions of the cluster layout nodes have been set
  return layoutClusters;
}
