import * as d3 from 'd3';

/**
 * Mix two arrays via element-wise linear interpolation.
 */
function mix(vec1, vec2, t) {
  return vec1.map((v1, i) => {
    const v2 = vec2[i];
    return ((1 - t) * v1) + (t * v2);
  });
}

/**
 * Class representing a visualization that is drawn and animated with regl.
 * The main purpose of this class is to abstract a compilable regl draw
 * function (createDraw) with its related data and props to make it easier
 * to update, redraw, and animate. There can be several ReglVis instances
 * added to a given ReglRenderer (the stage where they are drawn).
 *
 * Typical usage would be to call update() with new data and then either
 * tell the ReglRenderer to redraw the stage if you want no animation, or
 * tell this object directly to start animating with the animate() function.
 */
class ReglVis {
  constructor({ regl, idKey, tweenAttributes, props, createDraw }) {
    this.dataById = undefined;
    this.numData = 0;
    this.tweenAttributes = tweenAttributes;
    this.regl = regl;
    this.idKey = idKey;
    this.props = props;
    this.createDraw = createDraw;
  }

  /**
   * Helper to create a new regl buffer for all the attributes given a dataset.
   * These will be passed to the createDraw function.
   */
  createReglAttributes(data) {
    // read from `this`
    const regl = this.regl;
    const tweenAttributes = this.tweenAttributes;
    const idKey = this.idKey; // TODO: this could eventually be just a dataId function (d, i) => id
    const dataById = this.dataById;

    this.numData = data.length;
    const indexArray = d3.range(data.length);

    // create the regl buffer storing all the attributes used by the shaders (source and dest)
    const pointBuffer = regl.buffer(indexArray.map((index) => {
      let entry = [];

      const dest = data[index];
      const destId = dest[idKey];
      const source = dataById[destId] || dest; // for entering points, there is no source. just use dest

      tweenAttributes.forEach((tweenAttribute) => {
        if (tweenAttribute.length > 1) {
          entry = entry.concat(source[tweenAttribute.key], dest[tweenAttribute.key]);
        } else {
          entry.push(source[tweenAttribute.key], dest[tweenAttribute.key]);
        }
      });

      return entry;
    }));

    // multiply by 4 for bytes
    // multiply by 2 since we store the start and end values
    const vertexSize = 4 * d3.sum(tweenAttributes.map(d => d.length)) * 2;

    // create the regl attributes object based on tween attrs
    let offset = 0;
    const reglAttributes = tweenAttributes.reduce((accum, tweenAttribute) => {
      // add in the source value postfixed with Start
      accum[`${tweenAttribute.key}Start`] = {
        buffer: pointBuffer,
        stride: vertexSize,
        offset,
      };
      offset += 4 * tweenAttribute.length; // multiply by 4 for bytes

      // add in the target value postfixed with End
      accum[`${tweenAttribute.key}End`] = {
        buffer: pointBuffer,
        stride: vertexSize,
        offset,
      };
      offset += 4 * tweenAttribute.length;

      return accum;
    }, {
      index: indexArray,
    });

    // Store the new dest object in the by ID data mapping for future animations
    this.targetDataById = {};
    data.forEach((d, index) => {
      // Note: a copy is being made here to ensure that the tween prop values
      // on subsequent renders are retained. Otherwise if the user mutates the
      // data, the object stored in this.dataById would also update and the source
      // value to animate from would be the same as the updated dest value.
      this.targetDataById[d[idKey]] = Object.assign({ index }, d);
    });

    return reglAttributes;
  }

  /**
   * Helper to create the uniforms passed to the createDraw function
   */
  createReglUniforms() {
    const regl = this.regl;
    const props = this.props;

    const uniforms = {
      delayByIndex: regl.prop('delayByIndex'),
      duration: regl.prop('duration'),
      // time in milliseconds since the prop startTime (i.e. time elapsed)
      elapsed: ({ time }, { startTime = 0 }) => (time - startTime) * 1000,
    };

    // add in the defined props to read from regl.prop
    Object.keys(props).forEach((key) => {
      uniforms[key] = regl.prop(key);
    });

    return uniforms;
  }

  /**
   * Set new props
   */
  updateProps(nextProps) {
    this.props = Object.assign({}, this.props, nextProps);
  }

  /**
   * Update the data and create the regl draw function to reflect the new data
   * @param data {Object[]} The array of objects in the dataset
   * @param immediate {Boolean} True if this data update is not going to be animated.
   */
  updateData(data, immediate) {
    // read from `this`
    const idKey = this.idKey; // TODO: this could eventually be just a dataId function (d, i) => id
    let dataById = this.dataById;
    this.data = data; // store a reference to this dataset so we know if it changes

    if (!dataById || immediate) {
      this.dataById = dataById = d3.nest()
        .key(d => d[idKey])
        .rollup(d => d[0])
        .object(data.map(d => Object.assign({}, d)));
    }

    // did we interrupt an animation? if so, interpolate the data first to get valid source positions
    if (this.animationStartTime) {
      this.animationInterrupted((1000 * (this.animationLastDraw - this.animationStartTime)));
    }

    // takes props: delayByIndex, duration, startTime
    this.reglDraw = this.createDraw({
      count: data.length,
      attributes: this.createReglAttributes(data),
      uniforms: this.createReglUniforms(),
    });
  }

  /**
   * Update data and props (or one or the other) then draw or animate
   *
   * @param {Object[]} nextData The array of updated data. If not provided
   *   or if the same as previous data, no update to data is done.
   * @param {Object} nextProps The object of props
   */
  update(nextData, nextProps, drawType = 'animate', drawProps) {
    // if new props are provided, update by merging
    if (nextProps) {
      this.updateProps(nextProps);
    }

    // if data provided and its different from past data, regenerate
    if (nextData && this.data !== nextData) {
      this.updateData(nextData, drawType !== 'animate');
    }

    // animate or draw if flagged to do so
    if (drawType === 'animate') {
      this.animate(drawProps);
    } else if (drawType === 'draw') {
      this.drawCallback({ duration: 0, delayByIndex: 0 });
    }
  }

  /**
   * Draw the vis with regl
   */
  draw(props) {
    // use default values from this.props
    this.reglDraw(Object.assign({
      delayByIndex: this.props.delayByIndex || 0,
      duration: this.props.duration || 0,
    }, this.props, props));
  }

  /**
   * Start animating the vis with regl. Typically have called `update()`
   * beforehand.
   */
  animate(props = {}) {
    // max duration in seconds
    const duration = props.duration == null ? (this.props.duration || 0) : props.duration;
    const delayByIndex = props.delayByIndex == null ? (this.props.delayByIndex || 0) : props.delayByIndex;

    const maxDuration = (duration + (delayByIndex * this.numData)) / 1000;

    this.startCallback(maxDuration, props);
  }

  /**
   * Destroy this vis object. Cancels animation
   */
  destroy() {
    this.stopCallback();
  }

  on(event, callback) {
    if (event === 'start') {
      this.startCallback = callback;
    } else if (event === 'stop') {
      this.stopCallback = callback;
    } else if (event === 'draw') {
      this.drawCallback = callback;
    }
  }

  /**
   * Set the animation time to the regl start time provided by the renderer.
   * This is needed for interpolating when an interruption happens.
   */
  animationStarted(startTime) {
    this.animationStartTime = startTime;
    this.animationLastDraw = startTime;
  }

  /**
   * Keep track of the last time this was drawn in an animation so we can
   * interpolate during interruptions correctly
   */
  animationTicked(tickTime) {
    this.animationLastDraw = tickTime;
  }

  /**
   * Interpolate between source and dest to approximate where regl was drawing at if
   * the animation gets interrupted midway.
   */
  animationInterrupted(elapsed) {
    const { duration = 0, delayByIndex = 0 } = this.props;
    const tweenAttributes = this.tweenAttributes;

    // interpolate between dataById and targetDataById
    const interruptedDataById = {};
    Object.keys(this.targetDataById).forEach((id) => {
      const dest = this.targetDataById[id];
      const source = this.dataById[id] || dest;

      const interpolated = Object.assign({}, dest);
      const delay = delayByIndex * dest.index;

      // TODO: assumes cubic interpolation
      const t = Math.min(1, duration ? d3.easeCubic(Math.max(0, elapsed - delay) / duration) : 1);

      tweenAttributes.forEach(({ key, length }) => {
        if (length === 1) {
          interpolated[key] = (t * dest[key]) + ((1 - t) * source[key]);
        } else {
          interpolated[key] = mix(source[key], dest[key], t);
        }
      });
      interruptedDataById[id] = interpolated;
    });

    this.dataById = interruptedDataById;
    this.targetDataById = undefined;
    this.animationStartTime = undefined;
  }

  /**
   * The animation has completed, so set the dataById to be the targetDataById
   */
  animationEnded() {
    // let the dataById be updated to be the target dataById
    this.dataById = this.targetDataById;
    this.targetDataById = undefined;
    this.animationStartTime = undefined;
  }
}

export default ReglVis;
