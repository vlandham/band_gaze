import phyllotaxisLayout from './phyllotaxisLayout';

/**
 * Take the cluster objects and layout the points within them in a phyllotaxis layout.
 * Return a single flat array containing all the points with x and y values representing
 * their absolute position.
 */
export default function layoutPointsInClusters(layoutClusters, pointSize, pointMargin) {
  const pointRadius = pointSize / 2;
  let points = [];
  layoutClusters.forEach((layoutCluster, clusterIndex) => {
    const clusterPoints = layoutCluster.cluster.cities.map(id => ({
      id,
      clusterId: layoutCluster.id,
      x: null, // to be filled in by phyllotaxis layout
      y: null,
    }));

    phyllotaxisLayout(clusterPoints, pointRadius + pointMargin, pointRadius + pointMargin, layoutCluster.x, layoutCluster.y);

    layoutCluster.points = clusterPoints;
    points = points.concat(clusterPoints);
  });

  return points;
}
