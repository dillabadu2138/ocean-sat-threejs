import * as THREE from 'three';

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
        url_lut: 'assets/lut/Plasma.png',
        url_data: 'assets/data/GK2B_GOCI2_L2_20220809_001530_LA_TSS.png',
        uniforms: {
          uOpacity: { value: 1.0 },
          uLutTexture: { value: null },
          uDataTexture: { value: null },
          uColorRangeMin: { value: 0 },
          uColorRangeMax: { value: 2 },
          // [minX, minY, maxX, maxY]
          uImageBounds: {
            value: [
              116.3168664550781273, 23.7032745361328097, 146.2618664550781205, 48.3432745361328102,
            ],
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
    tssRollup.add(this.params.guiParams.tss, 'visible').name('TSS 활성화');

    // control opacity
    tssRollup
      .add(this.params.guiParams.tss.material.uniforms.uOpacity, 'value', 0, 1)
      .step(0.01)
      .name('TSS 투명도')
      .onChange((value) => {
        this.tssMesh.material.transparent = true;
        this.tssMesh.material.uniforms.uOpacity.value = value;
      });

    // control colorRange minimum
    tssRollup
      .add(this.params.guiParams.tss.material.uniforms.uColorRangeMin, 'value', 0, 1)
      .name('TSS 범위 최솟값');

    // control colorRange maximum
    tssRollup
      .add(this.params.guiParams.tss.material.uniforms.uColorRangeMax, 'value', 1, 5)
      .name('TSS 범위 최댓값');
  }

  createMesh(state) {
    const promises = [this.createGeometry(), this.createMaterial(state.material)];

    return Promise.all(promises).then((result) => {
      // draw points
      this.tssMesh = new THREE.Mesh(result[0], result[1]);
      this.tssMesh.frustumCulled = false;
      this.tssMesh.visible = false;
      this.params.scene.add(this.tssMesh);

      // add dat.gui
      this.initGUI();
    });
  }

  createGeometry() {
    // create an instance of buffer geometry
    const geometry = new THREE.BufferGeometry();

    // create positions
    // FIXME: hardcoded
    const width = 5989;
    const height = 4928;
    const positions = new Float32Array(width * height * 3);
    const scaleX = 0.005;
    const scaleY = 0.005;
    for (let i = 0; i < width; ++i) {
      for (let j = 0; j < height; ++j) {
        const index = (i + j * width) * 3;
        positions[index + 0] =
          this.initialState.material.uniforms.uImageBounds.value[0] + i * scaleX;
        positions[index + 1] =
          this.initialState.material.uniforms.uImageBounds.value[1] + j * scaleY;
        positions[index + 2] = 0;
      }
    }

    // create indices
    let resolution_x = 5989;
    let resolution_y = 4928;
    const indices = new Uint32Array((resolution_y - 1) * (resolution_x - 1) * 2 * 3); // times 6 because of two triangles

    let triangleIndex = 0;
    for (let y = 0; y < resolution_y; y++) {
      for (let x = 0; x < resolution_x; x++) {
        const i = x + y * resolution_x;

        if (x !== resolution_x - 1 && y !== resolution_y - 1) {
          // first triangle
          indices[triangleIndex] = i;
          indices[triangleIndex + 1] = i + resolution_x + 1;
          indices[triangleIndex + 2] = i + resolution_x;
          // second triangle
          indices[triangleIndex + 3] = i;
          indices[triangleIndex + 4] = i + 1;
          indices[triangleIndex + 5] = i + resolution_x + 1;

          triangleIndex += 6;
        }
      }
    }

    // set attributes to this geometry
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    return Promise.resolve(geometry);
  }

  createMaterial(material) {
    const promises = [this.loadTexture(material.url_data), this.loadTexture(material.url_lut)];

    return Promise.all(promises).then((textures) => {
      textures[0].flipY = false;
      textures[0].generateMipmaps = false;
      textures[0].magFilter = THREE.NearestFilter;
      textures[0].minFilter = THREE.NearestFilter;

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
      const rawShaderMaterial = new THREE.RawShaderMaterial({
        uniforms: {
          ...uniformsProperties,
        },
        vertexShader: material.vertexShader,
        fragmentShader: material.fragmentShader,
      });

      return rawShaderMaterial;
    });
  }

  loadFile(url) {
    return new Promise((resolve) => {
      new THREE.FileLoader(this.params.loadingManager).load(url, resolve);
    });
  }

  loadTexture(url) {
    return new Promise((resolve) => {
      new THREE.TextureLoader(this.params.loadingManager).load(url, resolve);
    });
  }
}
