import React, { Component, PropTypes } from 'react';
import * as d3 from 'd3';
import addComputedProps, { compose } from 'react-computed-props';

import './index.scss';

/**
 * Generic computed props
 */
function chartProps(props) {
  const {
    data,
    compareData,
    features,
    padding,
    width,
  } = props;

  const height = width;
  const plotAreaWidth = Math.max(0, width - padding.left - padding.right);
  const plotAreaHeight = Math.max(0, height - padding.top - padding.bottom);
  const innerRadius = plotAreaWidth / 10;
  const outerRadius = plotAreaWidth / 2;
  const rScale = d3.scaleLinear().domain([0, 1]).range([innerRadius, outerRadius]);

  const featureAngles = features.reduce((accum, feature, i) => {
    accum[feature.id] = ((2 * Math.PI) / features.length) * i;
    return accum;
  }, {});

  const allSeriesData = [];

  function dataToFeaturesArray(data) {
    return {
      d: data,
      featureData: features.map(feature => ({
        feature: feature.id,
        value: data[feature.id],
      })),
    };
  }

  if (data) {
    allSeriesData.push(dataToFeaturesArray(data));
  }
  if (compareData) {
    allSeriesData.push(dataToFeaturesArray(compareData));
  }

  // draw a radial line given the data
  const radialPath = d3.radialLine()
    .curve(d3.curveCardinalClosed)
    // have to add Math.PI / 2 since it starts at 0 = -y (12 o clock) and
    // everything else uses 0 = x (3 o clock). Alternative is to modify
    // everything else to use 0 = -y.
    .angle(d => featureAngles[d.feature] + (Math.PI / 2))
    .radius(d => rScale(d.value));

  return {
    plotAreaWidth,
    plotAreaHeight,
    rScale,
    featureAngles,
    allSeriesData,
    radialPath,
    height,
  };
}

class RadarChart extends Component {
  static propTypes = {
    data: PropTypes.object,
    padding: PropTypes.object,
    features: PropTypes.array,
    width: PropTypes.number,

    // computed props
    height: PropTypes.number,
    plotAreaWidth: PropTypes.number,
    plotAreaHeight: PropTypes.number,
    rScale: PropTypes.func,
    featureAngles: PropTypes.object,
    allSeriesData: PropTypes.array,
    radialPath: PropTypes.func,
  }

  static defaultProps = {
    padding: { top: 80, right: 50, left: 50, bottom: 50 },
    width: 300,
  }

  componentDidMount() {
    this.setup();
    this.draw();
    // set up listeners
  }

  componentDidUpdate() {
    this.draw();
  }

  /**
   * Create the basic DOM structure and D3.js objects required to contain the
   * data-driven nodes. This logic only needs to be executed when the view is
   * rendered from an unrendered state--update operations can forgo this
   * method.
   *
   * @method insertChart
   * @memberof Histogram
   * @returns {undefined}
   */
  setup() {
    const { padding, plotAreaWidth, plotAreaHeight } = this.props;

    this.chart = d3.select(this.svg);

    const outerG = this.chart.append('g')
      .attr('transform', `translate(${padding.left} ${padding.top})`);

    this.g = outerG
      .append('g')
      .attr('transform', `translate(${plotAreaWidth / 2} ${plotAreaHeight / 2})`);

    this.g.append('g')
      .attr('class', 'axes');

    this.g.append('g')
      .attr('class', 'all-series');

    outerG.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${-padding.left + 10} ${-padding.top + 10})`);
  }

  /**
   * Draw the visualization.
   *
   * @returns {void}
   */
  draw() {
    const { plotAreaWidth, plotAreaHeight } = this.props;

    // update g transform in case resize
    this.g
      .attr('transform', `translate(${plotAreaWidth / 2} ${plotAreaHeight / 2})`);

    this.drawAxes();
    this.drawSeries();
    this.drawLegend();
  }

  /**
   * Draw in the axes
   */
  drawAxes() {
    const { features, rScale, featureAngles } = this.props;

    let axes = this.g.select('.axes').selectAll('.axis').data(features);

    axes.exit().remove();

    const axesEntering = axes.enter()
      .append('g')
      .attr('class', 'axis');

    axesEntering.append('line');
    axesEntering.append('text');

    axes = axes.merge(axesEntering);

    axes.select('line')
      .attr('x1', d => rScale(0) * Math.cos(featureAngles[d.id]))
      .attr('y1', d => rScale(0) * Math.sin(featureAngles[d.id]))
      .attr('x2', d => rScale(1) * Math.cos(featureAngles[d.id]))
      .attr('y2', d => rScale(1) * Math.sin(featureAngles[d.id]));

    axes.select('text')
      .attr('x', d => rScale(1.2) * Math.cos(featureAngles[d.id]))
      .attr('y', d => rScale(1.2) * Math.sin(featureAngles[d.id]))
      .attr('dy', '0.5em')
      .attr('text-anchor', 'middle')
      .text(d => d.label);
  }

  /**
   * Draw the data series
   */
  drawSeries() {
    const { allSeriesData, radialPath } = this.props;

    let paths = this.g.select('.all-series').selectAll('path').data(allSeriesData);
    paths.exit().remove();

    const pathsEntering = paths.enter().append('path')
      .attr('d', d => radialPath(d.featureData))
      .attr('class', (d, i) => `series-${i} radar-series`);

    paths = paths.merge(pathsEntering);

    paths
      .transition()
      .attr('d', d => radialPath(d.featureData));
  }

  /**
   * Draw the legend
   */
  drawLegend() {
    const { allSeriesData, width } = this.props;

    let entries = this.chart.select('.legend').selectAll('.legend-entry').data(allSeriesData);
    entries.exit().remove();

    const entriesEntering = entries.enter().append('g')
      .attr('class', 'legend-entry');

    const rectDim = 8;
    entriesEntering.append('rect')
      .attr('class', (d, i) => `series-${i}`)
      .attr('width', rectDim)
      .attr('height', rectDim)
      .attr('y', 3);


    entriesEntering.append('text')
      .attr('dy', '1em')
      .attr('dx', rectDim + 4)
      .text(d => d.d.id);


    entries = entries.merge(entriesEntering);

    const entryWidth = Math.floor(width / 2);
    entries
      .attr('transform', (d, i) => `translate(${i * entryWidth} 0)`);

    entries.select('text')
      .text(d => `${d.d.city}, ${d.d.state}`);
  }


  drawDebug() {
    const { allSeriesData, featureAngles, rScale } = this.props;
    let circles = this.g.select('.all-series').selectAll('circle').data(allSeriesData[0].featureData);
    circles.exit().remove();
    const circlesEntering = circles.enter().append('circle');
    circles = circles.merge(circlesEntering);

    circles
      .style('fill', '#0bb')
      .attr('r', 5)
      .attr('cx', d => rScale(d.value) * Math.cos(featureAngles[d.feature]))
      .attr('cy', d => rScale(d.value) * Math.sin(featureAngles[d.feature]));
  }

  render() {
    const { width, height } = this.props;

    return (
      <div className="RadarChart">
        <svg
          width={width}
          height={height}
          ref={(node) => { this.svg = node; }}
        />
      </div>
    );
  }
}

export default addComputedProps(chartProps)(RadarChart);
