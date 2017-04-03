import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addUrlProps } from 'react-url-query';
import { Link } from 'react-router';
import * as d3 from 'd3';

import ParticleVis from '../../components/ParticleVis';
import generatePoints from './generatePoints';
import generateClusters from './generateClusters';
import phyllotaxisLayout from './phyllotaxisLayout';

const urlPropsQueryConfig = {
};

const mapStateToProps = () => ({
});


const numPoints = 30000;
const numClusters = 50;
const width = 1000;
const height = 700;
const pointSize = 3;
const COLORS = d3.range(10).map(d => d3.interpolateViridis(d / 10))
  .map(d => d3.color(d))
  .map(d => [d.r / 255, d.g / 255, d.b / 255, 1]);


class ParticlesSandbox extends Component {
  static propTypes = {}

  constructor(props) {
    super(props);

    const points = generatePoints(numPoints, width, height);
    this.state = {
      points,
      toggledPoint: points[0],
      relatedToggledPoints: d3.range(15).map((d) => points[d + 1]),
    };

    this.clusterPoints = this.clusterPoints.bind(this);
    this.randomPoints = this.randomPoints.bind(this);
  }

  randomPoints() {
    const points = generatePoints(numPoints, width, height);
    this.setState({
      points,
      // TODO: temporarily pass in toggled points
      toggledPoint: points[0],
      relatedToggledPoints: d3.range(15).map((d) => points[d + 1]),
    });
  }

  clusterPoints() {
    const { points: oldPoints } = this.state;

    const points = oldPoints.slice();

    // dimensions for points
    const pointMargin = 1;
    const radius = pointSize / 2;

    // generate K random clusters for N points
    const clusters = generateClusters(numPoints, numClusters, pointSize, pointMargin, width, height);

    // randomize the order of the points
    d3.shuffle(points);
    d3.shuffle(COLORS);

    // phyllotaxis layout the points in clusters
    let pointIndex = 0;
    clusters.forEach((cluster, clusterIndex) => {
      const clusterPoints = points.slice(pointIndex, pointIndex + cluster.size);
      pointIndex += cluster.size;
      phyllotaxisLayout(clusterPoints, radius + pointMargin, radius + pointMargin, cluster.x, cluster.y);

      // update the colors for each point to be that of the cluster
      const clusterColor = COLORS[clusterIndex % COLORS.length];
      clusterPoints.forEach(point => {
        point.color = clusterColor; // <-- mutates points
      });
    });

    this.setState({
      points,
    });
  }

  render() {
    const { points, toggledPoint, relatedToggledPoints } = this.state;

    return (
      <div className="ParticlesSandbox">
        <div>
          <Link to="/">Home</Link>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div>
              <button onClick={this.randomPoints}>Random</button>
              <button onClick={this.clusterPoints}>Cluster</button>
            </div>
            <div style={{ position: 'relative' }}>
              <ParticleVis
                points={points}
                width={width}
                height={height}
                pointSize={pointSize}
                toggledPoint={toggledPoint}
                relatedToggledPoints={relatedToggledPoints}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default addUrlProps({ urlPropsQueryConfig })(connect(mapStateToProps)(ParticlesSandbox));
