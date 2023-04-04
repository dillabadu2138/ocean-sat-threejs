import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const controls = (function () {
  class MyOrbitControls {
    constructor(params) {
      // create instance properties
      this.params = params;

      // init controls
      this.initialize(params);
    }

    initialize(params) {
      this.controls = new OrbitControls(params.camera, params.domElement);
      this.controls.enableDamping = true;
      this.controls.target.set(0, 0, 0);
      this.controls.update();

      this.initGUI();
    }

    initGUI() {
      // create gui parameters for controls
      this.params.guiParams.controls = this.controls;

      // add gui for controls
      const controlsRollup = this.params.gui.addFolder('Controls');
      controlsRollup
        .add(this.params.guiParams.controls, 'enableDamping')
        .onChange(() => this.controls.update());
      controlsRollup
        .add(this.params.guiParams.controls, 'dampingFactor', 0.01, 1)
        .onChange(() => this.controls.update());
      controlsRollup
        .add(this.params.guiParams.controls, 'enablePan')
        .onChange(() => this.controls.update());
      controlsRollup
        .add(this.params.guiParams.controls, 'panSpeed', 0.1, 1)
        .onChange(() => this.controls.update());
      controlsRollup
        .add(this.params.guiParams.controls, 'enableRotate')
        .onChange(() => this.controls.update());
      controlsRollup
        .add(this.params.guiParams.controls, 'rotateSpeed', 0.1, 1)
        .onChange(() => this.controls.update());
      controlsRollup
        .add(this.params.guiParams.controls, 'enableZoom')
        .onChange(() => this.controls.update());
      controlsRollup
        .add(this.params.guiParams.controls, 'zoomSpeed', 0.1, 1)
        .onChange(() => this.controls.update());
      controlsRollup.open();
    }
  }

  return {
    MyOrbitControls,
  };
})();
