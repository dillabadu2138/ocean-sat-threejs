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
    }
  }

  return {
    MyOrbitControls,
  };
})();
