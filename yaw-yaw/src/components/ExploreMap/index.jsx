import React, { Component, PropTypes } from 'react';
import addComputedProps, { compose } from 'react-computed-props';
import _values from 'lodash.values';
import * as d3 from 'd3';

import ParticleVis from '../ParticleVis';
import clusterLayout from './clusterLayout';
import layoutPointsInClusters from './layoutPointsInClusters';


// the amount of padding to have around fitting the map to a projection
const mapPadding = 50;

/**
 * Creates a map projection of USA based on the provided data points
 * and the width and height. Uses geoJSON combined with fitSize to
 * size the map to fit the width and height.
 */
function createMapProjection(points, width, height) {
  const coordinates = points.map(p => [p.lon, p.lat]);
  const geoJSON = {
    type: 'MultiPoint',
    coordinates,
  };

  width -= 2 * mapPadding;
  height -= 2 * mapPadding;

  const projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .fitSize([width, height], geoJSON);

  return projection;
}

/**
 * Helper that maps an array of data points to those ready to be plotted
 * by ParticleVis
 */
function createParticlePoints(points, mapProjection) {
  // layout in a map and add in colors
  const color = [0.5, 0.5, 0.5, 1];
  return points.map(d => {
    const [x, y] = mapProjection([d.lon, d.lat]);
    return {
      id: d.id,
      x: x + mapPadding, // offset by left padding
      y: y + mapPadding, // offset by top padding
      color,
      d,
    };
  });
}

function createParticlePointsClustered(clusters, pointSize, width, height) {
  const pointMargin = 1;

  // generate K random clusters for N points
  const layoutClusters = clusterLayout(clusters, pointSize, pointMargin, width, height);
  const points = layoutPointsInClusters(layoutClusters, pointSize, pointMargin);

  const color = [0.5, 0.5, 0.5, 1];
  points.forEach(d => {
    d.color = color;
  });

  return points;
}

/**
 * Computed props function that runs only when props related to
 * laying out cityData changes. Lays them out to be plotted.
 */
function cityDataProps(props) {
  const {
    cityData,
    width,
    height,
    pointSize,
    clusters,
    mode,
  } = props;

  let newProps;

  if (mode === 'map') {
    const cityDataValues = _values(cityData);
    const mapProjection = createMapProjection(cityDataValues, width, height);
    const points = createParticlePoints(cityDataValues, mapProjection);
    newProps = {
      points,
      mapProjection, // add this in so similarCities can access it
    };
  } else {
    const points = createParticlePointsClustered(clusters, pointSize, width, height);
    newProps = {
      points,
    };
  }

  return newProps;
}

/**
 * Computed props function that runs only when props related to
 * laying out similarCities changes. Lays them out to be plotted,
 * and currently separates out the toggledPoint and relatedToggledPoints
 * from the results.
 */
function similarCitiesProps(props) {
  const {
    similarCities,
    mapProjection, // populated via cityDataProps
  } = props;

  // layout in a map
  const similarCitiesPoints = createParticlePoints(similarCities, mapProjection);

  // TODO: this is only temporary. I imagine eventually we'll distinguish
  // between a toggled+related vs generic search similar cities.
  return {
    toggledPoint: similarCitiesPoints[0],
    relatedToggledPoints: similarCitiesPoints.slice(1),
  };
}

class ExploreMap extends Component {
  static propTypes = {
    cityData: PropTypes.object.isRequired,
    height: PropTypes.number,
    pointSize: PropTypes.number,
    points: PropTypes.arrayOf(PropTypes.object),
    onSelectCity: PropTypes.func,
    relatedToggledPoints: PropTypes.arrayOf(PropTypes.object),
    similarCities: PropTypes.arrayOf(PropTypes.object),
    toggledPoint: PropTypes.object,
    width: PropTypes.number,
    mode: PropTypes.oneOf(["map", "cluster"])
  }

  static defaultProps = {
    cityData: {},
    similarCities: [],
    clusters: [],
    pointSize: 2,
    width: 1000,
    height: 500,
    mode: "map",
  }

  constructor(props) {
    super(props);

    this.handleSelectCity = this.handleSelectCity.bind(this);
  }

  handleSelectCity(city) {
    const { onSelectCity } = this.props;

    if (city) {
      onSelectCity(city);
    }
  }

  render() {
    const {
      toggledPoint,
      relatedToggledPoints,
      points,
      width,
      height,
      pointSize,
    } = this.props;

    // It seems that if we render ParticleVis with an empty array it
    // becomes somewhat unstable. Check to make sure the city points are
    // ready. TODO

    let particles;
    if (points.length) {
      particles = (
        <ParticleVis
          points={points}
          width={width}
          height={height}
          onToggle={this.handleSelectCity}
          pointSize={pointSize}
          toggledPoint={toggledPoint}
          relatedToggledPoints={relatedToggledPoints}
        />
      );
    }

    return (
      <div
        className="ExploreMap"
        ref={(node) => { this.container = node; }}
      >
        <div style={{ position: 'relative' }}>
          {particles}
        </div>
      </div>
    );
  }
}

export default compose(
  addComputedProps(cityDataProps, { changeExclude: ['similarCities', 'pointSize'] }),
  addComputedProps(similarCitiesProps, { changeInclude: ['similarCities', 'mapProjection'] })
)(ExploreMap);
