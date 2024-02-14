import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Coastline {
  constructor(params) {
    // create instance properties
    this.params = params;

    // initialize
    this.initialize(params);
  }

  initialize(params) {
    // load coastline and add to scene
    this.loadCoastline(params);
  }

  initGUI() {
    // create gui parameters for coastline
    this.params.guiParams.coastline = this.coastline.material;

    // add gui for coastline
    const coastlineRollup = this.params.gui.addFolder('해안선(coastline)');
    coastlineRollup.close();

    // control visibility
    coastlineRollup.add(this.params.guiParams.coastline, 'visible').name('활성화');

    // control opacity
    coastlineRollup
      .add(this.params.guiParams.coastline, 'opacity', 0, 1)
      .step(0.01)
      .name('투명도')
      .onChange((value) => {
        this.coastline.material.transparent = true;
        this.coastline.material.opacity = value;
        this.coastline.material.needsUpdate = true; // required after the first render
      });

    // control color picking
    coastlineRollup
      .addColor(this.params.guiParams.coastline, 'color')
      .name('색상')
      .onChange((value) => {
        this.coastline.material.color.setRGB(value.r, value.g, value.b);
        this.coastline.material.needsUpdate = true; // required after the first render
      });
  }

  loadCoastline(params) {
    // load glb file
    const loader = new GLTFLoader(this.params.loadingManager);
    loader.load(
      // resource URL
      'assets/data/coastline.glb',

      // onLoad callback
      (gltf) => {
        // extract mesh from the loaded data
        this.coastline = gltf.scene.children[0];

        // rotate by 90 degrees in Y axis
        this.coastline.rotation.y = Math.PI / 2;

        // scale up the model
        this.coastline.scale.set(1.0001, 1.0001, 1.0001);

        // add to scene
        params.scene.add(this.coastline);

        // add dat.gui
        this.initGUI();
      }
    );
  }
}
