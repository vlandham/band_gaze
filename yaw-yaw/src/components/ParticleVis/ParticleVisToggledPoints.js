import React, { PureComponent, PropTypes } from 'react';
import * as d3 from 'd3';
import curvedPath from '../../util/curvedPath';
import lineLength from '../../util/lineLength';

import './index.scss';

/**
 * Renders the toggled points in the particle vis. In its own component so
 * only changes to props it cares about cause it to re-render, otherwise
 * transitions can get messed up.
 */
class ParticleVisToggledPoints extends PureComponent {
  static propTypes = {
    pointSize: PropTypes.number, // width of a point (NOT radius)
    relatedToggledPoints: PropTypes.arrayOf(PropTypes.object),
    toggledPoint: PropTypes.object,
  }

  componentDidMount() {
    this.setup();
    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  /**
   * Initial setup of the toggled point. Appends elements to DOM
   */
  setup() {
    this.g.append('g').attr('class', 'related-toggled-points');
    this.g.append('circle').attr('class', 'toggled-point');
  }

  /**
   * Draw the lines and circles for related points
   */
  updateRelated() {
    const {
      pointSize,
      toggledPoint,
      relatedToggledPoints,
    } = this.props;

    const pointStrokeWidth = 3;
    const pathStrokeWidth = 2;

    const gRelated = this.g.select('.related-toggled-points');

    // initial starting point for all related lines
    const x1 = toggledPoint.x;
    const y1 = toggledPoint.y;

    // transition settings
    const lineDuration = 1000;
    const lineDelayByIndex = 30;
    const lineTransition = d3.transition()
      .duration(lineDuration)
      .ease(d3.easeCubicOut);
    const lineDelay = (d, i) => i * lineDelayByIndex;

    // ------------------------------------
    // Paths
    // ------------------------------------
    // add in the related points as lines from the toggled point
    let relatedLines = gRelated.selectAll('path')
      .data(relatedToggledPoints, d => d.id);

    relatedLines.exit().remove();
    relatedLines = relatedLines.enter().append('path')
      .attr('class', 'related-toggled-point-line')
      .attr('id', d => `related-toggled-point-line-${d.id}`)
      .style('stroke', d => `url(#related-toggled-point-gradient-${d.id})`)
      .style('stroke-width', pathStrokeWidth)
      .merge(relatedLines);

    const path = d => curvedPath([x1, y1], [d.x, d.y], 0.5, x1 < d.x);

    relatedLines
      .interrupt()
      .attr('stroke-dasharray', '0,10000') // fix safari flash
      .attr('d', path)
      .transition(lineTransition)
      .delay(lineDelay)
      .attrTween('stroke-dasharray', function tweenDash() {
        const pathLength = this.getTotalLength();
        const interpolator = d3.interpolateString('0,10000', `${pathLength},10000`);
        return interpolator;
      });


    // ------------------------------------
    // Gradient Fades - Radial Gradients at the tip of paths
    // ------------------------------------
    // add in gradient to each line
    const pathFadeGradients = this.g.select('defs').selectAll('.path-fade-gradient')
      .data(relatedToggledPoints, d => d.id);

    pathFadeGradients.exit().remove();
    const pathFadeGradientsEnter = pathFadeGradients.enter()
      .append('radialGradient')
      .attr('id', d => `related-toggled-point-gradient-${d.id}`)
      .attr('gradientUnits', 'userSpaceOnUse');

    pathFadeGradientsEnter.append('stop')
      .attr('offset', 0)
      .attr('stop-color', '#066')
      .attr('stop-opacity', 1);

    pathFadeGradientsEnter.append('stop')
      .attr('offset', 1)
      .attr('stop-color', '#0bb')
      .attr('stop-opacity', 1);

    pathFadeGradients.merge(pathFadeGradientsEnter)
      .interrupt()
      .attr('cx', x1)
      .attr('cy', y1)
      .attr('r', d => 0.6 * lineLength([x1, y1], [d.x, d.y]))
      .transition(lineTransition)
      .delay(lineDelay)
      // tween cx and cy with same function
      .tween('attr.cxcy', function tweenPosition(d) {
        // ensure that the cx and cy are at the end of the visible part of the path
        const gradient = this;
        const path = d3.select(`#related-toggled-point-line-${d.id}`).node();

        // if for some reason we have no path, do nothing.
        if (!path) {
          return undefined;
        }

        const pathLength = path.getTotalLength();
        const lengthInterpolator = d3.interpolateNumber(0, pathLength);

        return function tweener(t) {
          const currLength = lengthInterpolator(t);
          const point = path.getPointAtLength(currLength);
          gradient.setAttribute('cx', point.x);
          gradient.setAttribute('cy', point.y);
        };
      });


    // ------------------------------------
    // Circles
    // ------------------------------------
    // add in the related points as circles
    const relatedCircles = gRelated.selectAll('.related-toggled-point')
      .data(relatedToggledPoints, d => d.id);

    relatedCircles.enter().append('circle')
      .attr('class', 'related-toggled-point')
      .merge(relatedCircles)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', pointSize + pointStrokeWidth)
        .style('stroke-width', pointStrokeWidth);

    relatedCircles.exit().remove();
  }

  /**
   * Draw the toggled point and related ones with D3
   */
  update() {
    const {
      pointSize,
      toggledPoint,
    } = this.props;

    const pointStrokeWidth = 3;

    // if there is no toggled point, hide the group
    if (!toggledPoint) {
      this.g.style('display', 'none');
      return;
    }

    this.g.style('display', '');

    // update the position of the toggled point
    this.g.select('.toggled-point')
      .style('stroke-width', pointStrokeWidth)
      .attr('cx', toggledPoint.x)
      .attr('cy', toggledPoint.y)
      // we add the stroke-width here since SVG does not draw them on the outside
      .attr('r', (2 * pointSize) + pointStrokeWidth);

    // update the related points
    this.updateRelated();
  }

  /**
   * Renders the <g> tag with the toggled point parents that will
   * be populated by D3 in the update functions above.
   */
  render() {
    return (
      <g
        ref={(node) => { this.g = d3.select(node); }}
        className="toggled-point-group"
      >
        <defs />
      </g>
    );
  }
}

export default ParticleVisToggledPoints;
