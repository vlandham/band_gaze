import React, { Component, PropTypes } from 'react';
import * as d3 from 'd3';
import addComputedProps, { compose } from 'react-computed-props';

import './index.scss';

/**
 * Generic computed props
 */
function chartProps(props) {
  const {
    xDataDef,
    data,
    width,
    height,
    padding,
  } = props;

  const xKey = xDataDef.id;

  const plotAreaHeight = height - padding.top - padding.bottom;
  const plotAreaWidth = width - padding.left - padding.right;

  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, (d) => d[xKey]))
    .range([0, plotAreaWidth])
    .clamp(true);

  const NUM_BINS = 10;
  const histogramLayout = d3.histogram()
    .thresholds(NUM_BINS)
    .value((d) => d[xKey])
    .domain(xScale.domain());

  const bins = data.length ? histogramLayout(data) : [];
  const numBins = bins.length;

  const xAxis = d3.axisBottom()
    .scale(xScale)
    // .tickFormat(xDataDef.formatter)
    .tickSize(4)
    .ticks(numBins + 1);

  const yScale = d3.scaleLog()
    .domain([1, d3.max(bins, (d) => d.length)] || 1)
    .range([plotAreaHeight, 0])
    .clamp(true);

  return {
    data,
    xDataDef,
    xKey,
    bins,
    padding,
    radius: 3,
    width,
    height,
    plotAreaWidth,
    plotAreaHeight,
    xScale,
    yScale,
    xAxis,
  };
}

/**
 * Props recomputed when similar cities or xDataDef changes
 */
function similarCitiesProps(props) {
  const {
    similarCities,
    xDataDef,
  } = props;

  const xKey = xDataDef.id;
  const highlightVals = similarCities.map(d => d[xKey]);

  const highlightColors = d3.scaleLinear()
    .domain([0, highlightVals.length])
    .range(['#D8D8D8', '#4A90E2']);

  return {
    highlightVals,
    highlightColors,
  };
}

class MiniHistogram extends Component {
  static propTypes = {
    data: PropTypes.array,
    padding: PropTypes.object,
    similarCities: PropTypes.array,
    xDataDef: PropTypes.object.isRequired,

    // computed props
    highlightVals: PropTypes.array,
    highlightColors: PropTypes.func,
    plotAreaWidth: PropTypes.number,
    plotAreaHeight: PropTypes.number,
    xAxis: PropTypes.func,
    bins: PropTypes.array,
    xScale: PropTypes.func,
    yScale: PropTypes.func,
  }

  static defaultProps = {
    similarCities: [],
    data: [],
    padding: { top: 5, right: 5, left: 5, bottom: 5 },
    width: 150,
    height: 40,
  }

  componentDidMount() {
    this.insertChart();
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
  insertChart() {
    const { padding } = this.props;

    this.chart = d3.select(this.svg);

    this.g = this.chart.append('g')
      .attr('transform', `translate(${padding.left} ${padding.top})`);

    this.g.append('g').classed('x-axis axis', true);
    this.g.append('text').classed('x-axis-label axis-label', true)
      .attr('dy', '-0.3em');
    this.g.append('g').classed('y-axis axis', true);
    this.g.append('text').classed('y-axis-label axis-label', true);

    this.g.append('g').classed('bars', true);
  }

  /**
   * Draw the visualization.
   *
   * @method draw
   * @memberof Histogram
   * @returns {undefined}
   */
  draw() {
    const {
      highlightVals,
      highlightColors,
      plotAreaHeight,
      xAxis,
      bins,
      xScale,
      yScale,
    } = this.props;

    const g = this.g;

    // draw in the axes
    g.select('.x-axis')
      .attr('transform', `translate(0 ${plotAreaHeight})`)
      .call(xAxis);

    const bar = g.select('g.bars').selectAll('g.bar')
      .data(bins);

    const barEnter = bar.enter().append('g')
      .attr('class', 'bar')
      .attr('transform', (d) => `translate(${xScale(d.x0)}, ${plotAreaHeight})`);

    barEnter.append('rect')
      .attr('x', 0)
      .attr('width', (bin) => xScale(bin.x1) - xScale(bin.x0))
      .attr('height', 0)
      .attr('stroke-width', 1);

    const barUpdate = bar.merge(barEnter)
      .transition()
      .duration(500);

    barUpdate
      .attr('transform', (d) => `translate(${xScale(d.x0)}, ${yScale(d.length)})`);

    barUpdate.select('rect')
      .attr('fill', (d) => {
        const matches = highlightVals.filter((h) => h >= d.x0 && h < d.x1);
        return highlightColors(matches.length);
      })
      .attr('width', (bin) => xScale(bin.x1) - xScale(bin.x0))
      .attr('height', (d) => plotAreaHeight - yScale(d.length));

    bar.exit().remove();
  }

  render() {
    const { data } = this.props;

    return (
      <div
        className="MiniHistogram"
        ref={(node) => { this.container = node; }}
      >
        <svg
          width="100%"
          height="100%"
          style={{ display: data.length ? '' : 'none' }}
          ref={(node) => { this.svg = node; }}
        />
      </div>
    );
  }
}

export default compose(
  addComputedProps(chartProps, { changeExclude: ['similarCities'] }),
  addComputedProps(similarCitiesProps, { changeInclude: ['similarCities', 'xDataDef'] })
)(MiniHistogram);
