import * as THREE from 'three';

export const helpers = (function () {
  class MyAxesHelper {
    constructor(params) {
      // create instance properties
      this.params = params;

      // init
      this.initialize(params);
    }

    initialize(params) {
      this.axesHelper = new THREE.AxesHelper(5);
      params.scene.add(this.axesHelper);

      this.initGUI();
    }

    initGUI() {
      // create gui parameters for AxesHelper
      this.params.guiParams.axesHelper = this.axesHelper;

      // add gui for AxesHelper
      const helpersRollup = this.params.gui.addFolder('축 도우미(AxesHelper)');
      helpersRollup
        .add(this.params.guiParams.axesHelper, 'visible')
        .name('축 도우미 보기(showAxesHelper)');
      helpersRollup.close();
    }
  }

  return {
    MyAxesHelper,
  };
})();
