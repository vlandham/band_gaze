import React, { PureComponent, PropTypes } from 'react';
import * as d3 from 'd3';

import ParticleVisRegl from './ParticleVisRegl';
import ParticleVisSvg from './ParticleVisSvg';

import './index.scss';

/**
 * Combines two layers to create on seamless visualization. An interactive
 * layer that uses SVG and the main data drawing layer that uses regl.
 *
 * Expects to receive an array of data with x and y positions. When the
 * `points` prop changes, it animates the points to their new positions.
 */
class ParticleVis extends PureComponent {
  static propTypes = {
    height: PropTypes.number,
    onToggle: PropTypes.func,
    points: PropTypes.array,
    pointSize: PropTypes.number,
    width: PropTypes.number,
    toggledPoint: PropTypes.object,
    relatedToggledPoints: PropTypes.arrayOf(PropTypes.object),
  }

  constructor(props) {
    super(props);

    this.state = {
      transform: d3.zoomIdentity,
    };

    // select points for demonstrating highlighting (TODO: remove this, only temporary)
    const { points } = props;

    this.handleZoom = this.handleZoom.bind(this);
    this.handleHighlight = this.handleHighlight.bind(this);
    this.handleTogglePoint = this.handleTogglePoint.bind(this);
  }

  /**
   * Callback when the vis pans or zooms
   */
  handleZoom(transform) {
    this.setState({
      transform,
    });
  }

  /**
   * Callback when a point is hovered on
   */
  handleHighlight(point) {
    const { highlightedPoint } = this.state;

    if (highlightedPoint !== point) {
      this.setState({
        highlightedPoint: point,
      });
    }
  }

  handleTogglePoint(point) {
    const { onToggle } = this.props;

    console.log('You clicked', point);
    onToggle(point);
  }

  /**
   * Renders a canvas forr regl to use
   */
  render() {
    const { width, height, points, pointSize, toggledPoint, relatedToggledPoints } = this.props;
    const { transform, highlightedPoint } = this.state;

    return (
      <div className="particle-vis">
        <ParticleVisRegl
          width={width}
          height={height}
          points={points}
          pointSize={pointSize}
          transform={transform}
        />
        <ParticleVisSvg
          width={width}
          height={height}
          points={points}
          pointSize={pointSize}
          transform={transform}
          onZoom={this.handleZoom}
          onHover={this.handleHighlight}
          onToggle={this.handleTogglePoint}
          highlightedPoint={highlightedPoint}
          toggledPoint={toggledPoint}
          relatedToggledPoints={relatedToggledPoints}
        />
      </div>
    );
  }
}

export default ParticleVis;
