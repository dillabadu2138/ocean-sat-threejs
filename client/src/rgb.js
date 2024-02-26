import { Mesh, BufferGeometry, BufferAttribute, NearestFilter, RawShaderMaterial } from 'three';

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
      raster: {
        width: 1500,
        height: 1400,
        scaleX: 0.02,
        scaleY: 0.02,
      },
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
    const promises = [this.createGeometry(), this.createMaterial(state.material)];

    return Promise.all(promises).then((result) => {
      this.rgbMesh = new Mesh(result[0], result[1]);
      this.rgbMesh.frustumCulled = false;
      this.params.scene.add(this.rgbMesh);

      // add dat.gui
      this.initGUI();
    });
  }

  createGeometry() {
    // create an instance of buffer geometry
    const geometry = new BufferGeometry();

    // create vertices and indices
    const width = this.initialState.raster.width;
    const height = this.initialState.raster.height;
    const scaleX = this.initialState.raster.scaleX;
    const scaleY = this.initialState.raster.scaleY;
    const llX = this.initialState.material.uniforms.uImageBounds.value[0];
    const llY = this.initialState.material.uniforms.uImageBounds.value[1];

    const positions = new Float32Array(width * height * 3);
    const indices = new Uint32Array((width - 1) * (height - 1) * 2 * 3); // times 6 because of two triangles
    let triangleIndex = 0;
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        // create vertices
        const index = (i + j * width) * 3;
        positions[index + 0] = llX + i * scaleX;
        positions[index + 1] = llY + j * scaleY;
        positions[index + 2] = 0;

        // create indices
        const cur_ind = i + j * width;

        if (i !== width - 1 && j !== height - 1) {
          // first triangle
          indices[triangleIndex] = cur_ind;
          indices[triangleIndex + 1] = cur_ind + width + 1;
          indices[triangleIndex + 2] = cur_ind + width;
          // second triangle
          indices[triangleIndex + 3] = cur_ind;
          indices[triangleIndex + 4] = cur_ind + 1;
          indices[triangleIndex + 5] = cur_ind + width + 1;

          triangleIndex += 6;
        }
      }
    }

    // set attributes to this geometry
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setIndex(new BufferAttribute(indices, 1));

    return Promise.resolve(geometry);
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
