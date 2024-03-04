import { Mesh, NearestFilter, RawShaderMaterial } from 'three';

import { utils } from './utils';

// shader
import tssVertexShader from './shaders/tss/tss-vertex.glsl';
import tssFragmentShader from './shaders/tss/tss-fragment.glsl';

export class Tss {
  constructor(params) {
    // create instance properties
    this.params = params;

    // initialize
    this.initialize(params);
  }

  initialize(params) {
    // set initial state
    this.initialState = {
      material: {
        url_lut: 'assets/lut/Plasma.webp',
        url_data: '/api/files/image/TSS',
        uniforms: {
          uOpacity: { value: 1.0 },
          uLutTexture: { value: null },
          uDataTexture: { value: null },
          uColorRangeMin: { value: 0 },
          uColorRangeMax: { value: 1 },
          // [minX, minY, maxX, maxY]
          uImageBounds: {
            value: [116.0, 22.0, 146.0, 50.0],
          },
        },
        vertexShader: tssVertexShader,
        fragmentShader: tssFragmentShader,
      },
    };

    // create mesh and add to scene
    this.createMesh(this.initialState);
  }

  initGUI() {
    // create gui parameters for TSS
    this.params.guiParams.tss = this.tssMesh;

    // add gui for TSS
    const tssRollup = this.params.gui.addFolder('총 부유물(TSS)');
    tssRollup.close();

    // control visibility
    tssRollup.add(this.params.guiParams.tss, 'visible').name('활성화');

    // control opacity
    tssRollup
      .add(this.params.guiParams.tss.material.uniforms.uOpacity, 'value', 0, 1)
      .step(0.01)
      .name('투명도')
      .onChange((value) => {
        this.tssMesh.material.transparent = true;
        this.tssMesh.material.uniforms.uOpacity.value = value;
      });

    // control colorRange minimum
    tssRollup
      .add(this.params.guiParams.tss.material.uniforms.uColorRangeMin, 'value', 0, 1)
      .name('범위 최솟값');

    // control colorRange maximum
    tssRollup
      .add(this.params.guiParams.tss.material.uniforms.uColorRangeMax, 'value', 1, 5)
      .name('범위 최댓값');
  }

  createMesh(state) {
    const promise = this.createMaterial(state.material);

    return promise.then((result) => {
      // draw
      this.tssMesh = new Mesh(this.params.geometry, result);
      this.tssMesh.frustumCulled = false;
      this.tssMesh.material.depthTest = false;
      this.tssMesh.visible = false;
      this.params.scene.add(this.tssMesh);

      // add dat.gui
      this.initGUI();
    });
  }

  createMaterial(material) {
    const promises = [utils.getTexture(material.url_data), utils.loadTexture(material.url_lut)];

    return Promise.all(promises).then((textures) => {
      textures[0].flipY = false;
      textures[0].generateMipmaps = false;
      textures[0].magFilter = NearestFilter;
      textures[0].minFilter = NearestFilter;

      // create uniforms properties
      const uniformsProperties = {};
      Object.keys(material.uniforms).map((key) => {
        // copy and update value
        if (key === 'uDataTexture') {
          uniformsProperties[key] = { ...material.uniforms[key], value: textures[0] };
        } else if (key === 'uLutTexture') {
          uniformsProperties[key] = { ...material.uniforms[key], value: textures[1] };
        } else {
          // just copy the value otherwise
          uniformsProperties[key] = material.uniforms[key];
        }
      });

      // create raw shader material
      const rawShaderMaterial = new RawShaderMaterial({
        uniforms: {
          ...uniformsProperties,
        },
        vertexShader: material.vertexShader,
        fragmentShader: material.fragmentShader,
      });

      return rawShaderMaterial;
    });
  }
}
