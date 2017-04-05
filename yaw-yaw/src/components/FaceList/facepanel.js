import {mesh} from 'pixi.js';

class FacePanel {

  constructor(container) {
    console.log('PIXI', mesh )

    const width = 800;
    const height = 800;

    const app = new PIXI.Application(width, height, {
      forceCanvas: true,
      backgroundColor : 0xbbbbbb
    });

    // app.stage.filters = [new PIXI.filters.VoidFilter()];
    // app.stage.filterArea = new PIXI.Rectangle(0, 0, width, height);



    container.appendChild(app.view);

    this.app = app;
  }

  renderFaces(faces = []) {
    const app = this.app;
    const stage = app.stage;
    const numFaces = faces.length;

    // clear the stage
    while(stage.children[0]) { stage.removeChild(stage.children[0]); }
    // create a new Sprite from an image path

    const sprites = faces.map((face, i) => {
      const sp = PIXI.Sprite.fromImage(`/face_imgs/${face.face_id}.jpg`);
      // center the sprite's anchor point
      // sp.anchor.set(0.5 + Math.random() / 2);
      sp.anchor.set(0.5);

      // move the sprite to the center of the screen
      sp.x = app.renderer.width / 2;
      sp.y = app.renderer.height / 2;

      //sp.pluginName = 'picture';
      sp.blendMode = PIXI.BLEND_MODES.OVERLAY;

      sp.alpha = (1. / numFaces) + 0.05;
      sp.width = 500;
      sp.height = 500;
      // if (i === numFaces - 1) {
      //   console.log(i, 'dfd')
      //   sp.alpha = 1. / numFaces;
      // }

      return sp;
    });


    sprites.forEach((sprite) => {
      stage.addChild(sprite);
    })



  }
}


export default FacePanel;
