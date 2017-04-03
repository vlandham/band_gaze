let idGenerator = 0;

/**
 * Class that manages rendering regl abstractions, including their
 * animations. If nothing is animating, it stops re-rendering. The
 * main purpose of this class is to serve as the stage where ReglVis
 * instances are drawn. Instead of always having an animation loop
 * running and re-drawing when nothing is changing, it only runs
 * the loop when at least one of the attached ReglVis instances is
 * in the process of animating. This should prevent the CPU from running
 * at 100% in an endless loop when nothing is changing.
 *
 * Typical usage is to add ReglVis instances via add() then call
 * draw() to draw the whole stage.
 */
class ReglRenderer {
  constructor({ regl, backgroundColor }) {
    this.objects = [];
    this.regl = regl;
    this.backgroundColor = backgroundColor || [0, 0, 0, 1];
    this.animating = 0;
  }

  /**
   * Adds an object to the list of things to render
   */
  add(object) {
    const wrappedObject = {
      id: idGenerator++,
      object,
      props: {
        startTime: 0,
      },
    };

    this.objects.push(wrappedObject);
    object.on('start', this.objectStart.bind(this, wrappedObject));
    object.on('stop', this.objectStop.bind(this, wrappedObject));
    object.on('draw', (props) => this.draw(true, { [wrappedObject.id]: props }));
  }

  /**
   * Callback for when a new object starts animating
   */
  objectStart(wrappedObject, maxDuration, props) {
    if (!wrappedObject.animating) {
      this.animating += 1;
    }
    const startTime = this.regl.now();

    wrappedObject.props = Object.assign({ startTime }, props);
    wrappedObject.maxDuration = maxDuration;
    wrappedObject.animating = true;
    wrappedObject.object.animationStarted(startTime);

    if (this.animating === 1) {
      this.startAnimating();
    }
  }

  /**
   * Callback for when an object stops animating
   */
  objectStop(wrappedObject) {
    if (wrappedObject.animating) {
      this.animating = Math.max(0, this.animating - 1);
      wrappedObject.animating = false;
      wrappedObject.object.animationEnded();
    }
    if (this.animating === 0) {
      this.stopAnimating();
    }
  }

  /**
   * Starts the animation loop
   */
  startAnimating() {
    if (this.tick) {
      console.warn('Already animating. Ignoring start');
      return;
    }

    const regl = this.regl;
    this.tick = regl.frame(() => {
      const now = regl.now();

      try {
        this.draw(false);
      } finally {
        // update the animating flags for each thing animating
        for (let i = 0; i < this.objects.length; i += 1) {
          const wrappedObject = this.objects[i];
          wrappedObject.object.animationTicked(now);

          if (wrappedObject.animating &&
             (now - wrappedObject.props.startTime >= wrappedObject.maxDuration)) {
            this.objectStop(wrappedObject);
          }
        }
      }
    });
  }

  /**
   * Stops the animation loop
   */
  stopAnimating() {
    this.tick.cancel();
    this.tick = undefined;
  }

  // a single draw
  draw(flush = true, propOverrides = {}) {
    const regl = this.regl;

    if (flush) {
      regl.poll();
    }

    regl.clear({
      depth: 1,
      color: this.backgroundColor,
    });

    for (let i = 0; i < this.objects.length; i += 1) {
      const drawProps = Object.assign({}, this.objects[i].props, propOverrides[this.objects[i].id]);
      this.objects[i].object.draw(drawProps);
    }
  }
}

export default ReglRenderer;
