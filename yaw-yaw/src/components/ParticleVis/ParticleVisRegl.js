import React, { PureComponent, PropTypes } from 'react';
import reglCreator from 'regl';
import * as d3 from 'd3';

import ReglVis from '../../regl/ReglVis';
import ReglRenderer from '../../regl/ReglRenderer';

/**
 * React component for rendering a large number of particles. It
 * makes use of regl (WebGL shaders) through helper classes ReglVis
 * and ReglRenderer. Expects to receive an array of data with x and y
 * positions. When the `points` prop changes, it animates the points
 * to their new positions.
 */
class ParticleVisRegl extends PureComponent {
  static propTypes = {
    height: PropTypes.number,
    points: PropTypes.array,
    pointSize: PropTypes.number,
    transform: PropTypes.object,
    width: PropTypes.number,
  }

  constructor(props) {
    super(props);

    this.createDrawPoints = this.createDrawPoints.bind(this);
  }

  componentDidMount() {
    const { points, pointSize, width, height, transform } = this.props;

    this.regl = reglCreator(this.canvas);
    this.vis = new ReglVis({
      // how to id data (required) (default = 'id')
      idKey: 'id',

      // define which props to tween
      tweenAttributes: [
        { key: 'x', length: 1 },
        { key: 'y', length: 1 },
        { key: 'color', length: 4 },
      ],

      // function that gets passed the tween props as data and other animation props
      createDraw: this.createDrawPoints,

      // the regl instance to use (required)
      regl: this.regl,

      props: {
        // transition settings
        duration: 2000,
        delayByIndex: 800 / points.length,

        // zoom settings
        scale: transform.k,
        translate: [transform.x, transform.y],
        pointSize,
        maxPointSize: 8 * pointSize,
        stageWidth: width,
        stageHeight: height,
      },
    });

    this.renderer = new ReglRenderer({
      regl: this.regl,
      backgroundColor: [1, 1, 1, 1],
    });

    this.renderer.add(this.vis);
    this.vis.update(points, 'draw');
  }

  componentDidUpdate(prevProps) {
    const { points, transform, pointSize, height, width } = this.props;

    const nextProps = {
      scale: transform.k,
      translate: [transform.x, transform.y],
      stageHeight: height,
      stageWidth: width,
      pointSize,
    };

    // if points changed, re-animate the points
    if (points !== prevProps.points) {
      if (width !== prevProps.width || height !== prevProps.height) {
        this.vis.update(points, nextProps, 'draw');
      } else {
        this.vis.update(points, nextProps, 'animate');
      }

    // otherwise just re-draw the updated props
    } else {
      // this.renderer.draw();
      this.vis.update(points, nextProps, 'draw');
    }
  }

  /**
   * Creates the regl draw function based on the passed in attributes,
   * uniforms and count. Since the attributes are how we primarily pass data
   * to the shader, whenever the data changes we need to recompile the draw
   * function with the new attributes. This is what this function does. The
   * uniforms may change too, or they may be configured as regl props. Note
   * that regl props done through something like:
   *   uniforms.duration = regl.prop('duration')
   * Are then passed in to the draw function as arguments:
   *   drawPoints({ duration: 1000 })
   * These values can change without having to recompile the draw function.
   * (the above `drawPoints` is the result of calling createDrawPoints())
   */
  createDrawPoints({ attributes, uniforms, count }) {
    return this.regl({
      frag: `
      precision mediump float;
      varying vec4 fragColor;
      void main () {
        gl_FragColor = vec4(fragColor);
      }`,

      vert: `
      precision mediump float;
      attribute float xStart;
      attribute float xEnd;
      attribute float yStart;
      attribute float yEnd;
      attribute vec4 colorStart;
      attribute vec4 colorEnd;
      attribute float index;
      varying vec4 fragColor;
      uniform float elapsed;
      uniform float duration;
      uniform float delayByIndex;
      uniform float pointSize;
      uniform float maxPointSize;
      uniform float scale;
      uniform vec2 translate;
      uniform float stageWidth;
      uniform float stageHeight;

      void main () {
        gl_PointSize = min(scale * pointSize, maxPointSize);
        float delay = delayByIndex * index;
        float t;

        // drawing without animation, so show end state immediately
        if (duration == 0.0) {
          t = 1.0;

        // still delaying before animating
        } else if (elapsed < delay) {
          t = 0.0;
        } else {
          t = 2.0 * ((elapsed - delay) / duration);

          // cubic easing (cubicInOut)
          t = (t <= 1.0 ? t * t * t : (t -= 2.0) * t * t + 2.0) / 2.0;

          if (t > 1.0) {
            t = 1.0;
          }
        }

        // interpolate, scale, and translate
        float x = mix(xStart, xEnd, t) * scale + translate[0];
        float y = mix(yStart, yEnd, t) * scale + translate[1];

        // normalize the position
        gl_Position = vec4(
          2.0 * ((x / stageWidth) - 0.5),
          // invert y since we think [0,0] is bottom left in pixel space (needed for d3.zoom)
          -(2.0 * ((y / stageHeight) - 0.5)),
          0.0,
          1.0);

        fragColor = mix(colorStart, colorEnd, t);
      }`,

      depth: {
        enable: false,
        mask: false,
      },

      primitive: 'points',

      count,
      attributes,
      uniforms,
    });
  }

  /**
   * Renders a canvas for regl to use
   */
  render() {
    const { width, height } = this.props;

    return (
      <canvas
        className="particle-vis-regl"
        ref={(node) => { this.canvas = node; }}
        width={width}
        height={height}
      />
    );
  }
}


export default ParticleVisRegl;
