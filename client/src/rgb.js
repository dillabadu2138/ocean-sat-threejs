import { Mesh, NearestFilter, RawShaderMaterial } from 'three';

import { utils } from './utils';

// shader
import rgbVertexShader from './shaders/rgb/rgb-vertex.glsl';
import rgbFragmentShader from './shaders/rgb/rgb-fragment.glsl';

export class Rgb {
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
        url_data: 'api/files/image/RGB',
        uniforms: {
          uOpacity: { value: 1.0 },
          uDataTexture: { value: null },
          // [minX, minY, maxX, maxY]
          uImageBounds: {
            value: [116.0, 22.0, 146.0, 50.0],
          },
        },
        vertexShader: rgbVertexShader,
        fragmentShader: rgbFragmentShader,
      },
    };

    // create mesh and add to scene
    this.createMesh(this.initialState);
  }

  initGUI() {
    // create gui parameters for rgb
    this.params.guiParams.rgb = this.rgbMesh;

    // add gui for cloud
    const rgbRollup = this.params.gui.addFolder('RGB 8bit 이미지');
    rgbRollup.close();

    // control visibility
    rgbRollup.add(this.params.guiParams.rgb, 'visible').name('활성화');

    // control opacity
    rgbRollup
      .add(this.params.guiParams.rgb.material.uniforms.uOpacity, 'value', 0, 1)
      .step(0.01)
      .name('투명도')
      .onChange((value) => {
        this.rgbMesh.material.transparent = true;
        this.rgbMesh.material.uniforms.uOpacity.value = value;
      });
  }

  createMesh(state) {
    const promise = this.createMaterial(state.material);

    return promise.then((result) => {
      this.rgbMesh = new Mesh(this.params.geometry, result);
      this.rgbMesh.frustumCulled = false;
      this.params.scene.add(this.rgbMesh);

      // add dat.gui
      this.initGUI();
    });
  }

  createMaterial(material) {
    const promise = utils.getTexture(material.url_data);

    return promise.then((texture) => {
      texture.flipY = false;
      texture.generateMipmaps = false;
      texture.magFilter = NearestFilter;
      texture.minFilter = NearestFilter;

      // create uniforms properties
      const uniformsProperties = {};
      Object.keys(material.uniforms).map((key) => {
        // copy and update value
        if (key === 'uDataTexture') {
          uniformsProperties[key] = { ...material.uniforms[key], value: texture };
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
