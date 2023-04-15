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
      this.controls.rotateSpeed = 0.5;
      this.controls.zoomSpeed = 0.5;
      this.controls.target.set(0, 0, 0);
      this.controls.update();

      this.initGUI();
    }

    initGUI() {
      // create gui parameters for controls
      this.params.guiParams.controls = this.controls;

      // add gui for controls
      const controlsRollup = this.params.gui.addFolder('컨트롤(Controls)');
      controlsRollup
        .add(this.params.guiParams.controls, 'enableDamping')
        .name('댐핑 활성화(enableDamping)')
        .onChange(() => this.controls.update());
      controlsRollup
        .add(this.params.guiParams.controls, 'dampingFactor', 0.01, 1)
        .name('댐핑 팩터(dampingFactor)')
        .onChange(() => this.controls.update());
      controlsRollup
        .add(this.params.guiParams.controls, 'enablePan')
        .name('팬 활성화(enablePan)')
        .onChange(() => this.controls.update());
      controlsRollup
        .add(this.params.guiParams.controls, 'panSpeed', 0.1, 1)
        .name('팬 속도(panSpeed)')
        .onChange(() => this.controls.update());
      controlsRollup
        .add(this.params.guiParams.controls, 'enableRotate')
        .name('회전 활성화(enableRotate)')
        .onChange(() => this.controls.update());
      controlsRollup
        .add(this.params.guiParams.controls, 'rotateSpeed', 0.1, 1)
        .name('회전 속도(rotateSpeed)')
        .onChange(() => this.controls.update());
      controlsRollup
        .add(this.params.guiParams.controls, 'enableZoom')
        .name('줌 활성화(enableZoom)')
        .onChange(() => this.controls.update());
      controlsRollup
        .add(this.params.guiParams.controls, 'zoomSpeed', 0.1, 1)
        .name('줌 속도(zoomSpeed)')
        .onChange(() => this.controls.update());
      controlsRollup.close();
    }
  }

  return {
    MyOrbitControls,
  };
})();
