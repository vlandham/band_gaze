import React, { PureComponent, PropTypes } from 'react';
import * as d3 from 'd3';
import { rectIntersects, rectContains } from 'vis-utils';

import ParticleVisToggledPoints from './ParticleVisToggledPoints';

import lineLength from '../../util/lineLength';
import './index.scss';

/**
 * The SVG layer of the ParticleVis component. Handles the interactive
 * parts of the visualization.
 *
 * Expects to receive an array of data with x and y positions. When the
 * `points` prop changes, it animates the points to their new positions.
 */
class ParticleVisSvg extends PureComponent {
  static propTypes = {
    height: PropTypes.number,
    highlightedPoint: PropTypes.object,
    points: PropTypes.array,
    pointSize: PropTypes.number, // width of a point
    relatedToggledPoints: PropTypes.arrayOf(PropTypes.object),
    toggledPoint: PropTypes.object,
    transform: PropTypes.object, // k = scale, x = translate x, y = translate y
    width: PropTypes.number,
    onZoom: PropTypes.func,
    onHover: PropTypes.func,
    onToggle: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.handleZoom = this.handleZoom.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.setupZoom();
    this.setupMouseMove();
    this.setupHighlightedPoint();
    this.update();
  }

  componentDidUpdate(prevProps) {
    // if the points have changed, we need to recompute the quadtree
    if (prevProps.points !== this.props.points) {
      this.setupMouseMove();
    }
    if (prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
      this.setupZoom();
    }

    this.update();
  }

  /**
   * Set up the zoom handler on the overlay
   */
  setupZoom() {
    const { width, height } = this.props;

    // setup special mouse handling to enable click instead of pan unless the mouse
    // moves mouseMoveThreshold many pixels
    let mouseDowned = false;
    let mouseDownCoords;
    let mouseDownEvent;

    // Number of pixels a mouse needs to move before a drag is registered when
    // the mousedown takes place on the highlight circle.
    const mouseMoveThreshold = 5;

    // note: it is important select a node that covers the whole mousedownable area
    // but is beneath the node where the zoom is attached. In this case
    // we have <svg><g>...</g></svg> and we attach the zoom to svg and this
    // listener to the g.
    this.svg.select('g')
      .on('mousedown.highlight', () => {
        mouseDowned = true;

        // create a copy of the mousedown event to propagate later if needed
        mouseDownEvent = new MouseEvent(d3.event.type, d3.event);

        // keep coords handy to check distance to see if mouse moved far enough
        mouseDownCoords = [mouseDownEvent.x, mouseDownEvent.y];

        // do not propagate this mousedown to zoom immediately
        // we will fake it with the mouseDownEvent if the mouse moves far enough.
        d3.event.stopPropagation();
      });

    this.svg.on('mouseup.highlight click.highlight', () => {
      mouseDowned = false;
    });

    this.svg.on('mousemove.highlight', () => {
      // skip tracking mouse move if we didn't mousedown on the highlight item
      if (!mouseDowned) {
        return;
      }

      const mouse = [d3.event.x, d3.event.y];
      const distance = lineLength(mouse, mouseDownCoords);

      // we have reached a big enough distance to pass over to the zoom handler
      if (distance > mouseMoveThreshold) {
        mouseDowned = false;

        // dispatch original mouse down event to the zoom handler
        // note that here the mousedown event is dispatched directly on the
        // zoom element (this.svg), which bypasses our mousedown listener above.
        this.svg.node().dispatchEvent(mouseDownEvent);
      }
    });


    // setup zoom controls
    this.zoom = d3.zoom()
      .scaleExtent([1, 10]) // min and max zoom scale amounts
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', this.handleZoom);

    this.svg.call(this.zoom);
  }

  /**
   * Set up mouse move handler
   */
  setupMouseMove() {
    const { points, onHover } = this.props;

    // create a quadtree of the data
    const quadtree = d3.quadtree()
      .x(d => d.x)
      .y(d => d.y)
      .addAll(points);

    // keep a reference to this so we can access current props in the handler
    const self = this;

    // callback for when the mouse moves across the overlay
    function mouseMoveHandler() {
      // get the current mouse position, inverting the zoom transform
      const pixelMouse = self.props.transform.invert(d3.mouse(this));

      const [mx, my] = pixelMouse;

      let site;
      let minDistance;

      // use a box around the mouse the size of a point as the hit box
      const matchRadius = 5;
      const mouseHitBox = [[mx - matchRadius, my - matchRadius], [mx + matchRadius, my + matchRadius]];

      // traverse the quadtree looking for the matching leaf udner the mouse
      quadtree.visit((node, x1, y1, x2, y2) => {
        // check that quadtree node intersects
        const overlaps = rectIntersects(mouseHitBox, [[x1, y1], [x2, y2]]);

        // skip if it doesn't overlap the brush
        if (!overlaps) {
          return true;
        }

        // we found a leaf, see if it is the closest point
        if (!node.length) {
          // get the x, y position of the data point
          const { x, y } = node.data;

          // is the point itself within the mouse hitbox?
          if (rectContains(mouseHitBox, [x, y])) {
            // is it closer to the mouse than the previously set site?
            const distanceToMouse = Math.sqrt(Math.pow(x - mx, 2) + Math.pow(y - my, 2));
            if (minDistance == null || (minDistance != null && distanceToMouse < minDistance)) {
              minDistance = distanceToMouse;
              site = node;
            }
          }
        }

        // return false to keep traversing the quadtree
        return false;
      });

      // call the match (undefined means no match, otherwise pass the point)
      if (site) {
        onHover(site.data);
      }
    }

    this.svg
      .on('mousemove', mouseMoveHandler)
      .on('mouseleave', () => onHover(undefined));
  }

  /**
   * Initial setup of the highlighted point. Appends elements to DOM
   */
  setupHighlightedPoint() {
    this.svg.select('.highlighted-point-group')
      .append('circle')
      .attr('class', 'highlighted-point');
  }

  /**
   * Update the D3 portion of the vis
   */
  update() {
    this.updateHighlightedPoint();
  }

  /**
   * Callback for when zoom happens
   */
  handleZoom() {
    const { onZoom } = this.props;

    onZoom(d3.event.transform);
  }

  /**
   * Callback when the SVG is clicked.
   */
  handleClick() {
    const { highlightedPoint, onToggle } = this.props;

    if (highlightedPoint) {
      onToggle(highlightedPoint);
    }
  }

  /**
   * Draw the highlighted point with D3
   */
  updateHighlightedPoint() {
    const {
      pointSize,
      highlightedPoint,
      transform,
    } = this.props;

    const strokeWidth = 5;
    const g = this.svg.select('.highlighted-point-group');

    if (!highlightedPoint) {
      g.style('display', 'none');
      return;
    }

    // show the group
    g.style('display', '');

    // invert the scale so the highlight doesn't get huuuuuge
    const scale = Math.min(5, transform.k);

    // circle
    g.select('.highlighted-point')
      .attr('cx', highlightedPoint.x)
      .attr('cy', highlightedPoint.y)
      .attr('r', ((2 * pointSize) + strokeWidth) / scale)
      .style('stroke-width', strokeWidth / scale);
  }

  /**
   * Render a tooltip with React
   */
  renderTooltip() {
    const { highlightedPoint, transform } = this.props;

    if (!highlightedPoint) {
      return null;
    }

    // give some space so it doesn't overlap the point
    const tooltipMargin = 5;

    // interpret the zoom transform
    const x = (highlightedPoint.x * transform.k) + transform.x;
    const y = (highlightedPoint.y * transform.k) + transform.y;

    return (
      <div
        className="particle-vis-tooltip"
        style={{
          top: `${y + tooltipMargin}px`,
          left: `${x + tooltipMargin}px`,
        }}
      >
        <div><strong>{`ID: ${highlightedPoint.id}`}</strong></div>
        <div className="text-muted">{`(${Math.round(highlightedPoint.x)}, ${Math.round(highlightedPoint.y)})`}</div>
      </div>
    );
  }

  /**
   * Renders the main DOM elements that contain parts of the
   * interactive vis.
   */
  render() {
    const {
      width,
      height,
      pointSize,
      relatedToggledPoints,
      toggledPoint,
      transform,
    } = this.props;

    return (
      <div className="particle-vis-svg-container">
        <svg
          ref={(node) => { this.svg = d3.select(node); }}
          className="particle-vis-svg"
          width={width}
          height={height}
          onClick={this.handleClick}
        >
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
            <ParticleVisToggledPoints
              pointSize={pointSize}
              relatedToggledPoints={relatedToggledPoints}
              toggledPoint={toggledPoint}
            />
            <g className="highlighted-point-group" />
          </g>
        </svg>
        {this.renderTooltip()}
      </div>
    );
  }
}

export default ParticleVisSvg;
