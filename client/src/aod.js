import * as THREE from 'three';

// shader
import aodVertexShader from './shaders/aod/aod-vertex.glsl';
import aodFragmentShader from './shaders/aod/aod-fragment.glsl';

export class Aod {
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
        width: 300,
        height: 280,
        scaleX: 0.1,
        scaleY: 0.1,
      },
      material: {
        url_lut: 'assets/lut/Cool.png',
        url_data: 'assets/data/GK2B_GOCI2_L2_20220809_001530_LA_AOD.png',
        uniforms: {
          uOpacity: { value: 1.0 },
          uLutTexture: { value: null },
          uDataTexture: { value: null },
          uColorRangeMin: { value: 0 },
          uColorRangeMax: { value: 2 },
          // [minX, minY, maxX, maxY]
          uImageBounds: {
            value: [116.0, 22.0, 146.0, 50.0],
          },
        },
        vertexShader: aodVertexShader,
        fragmentShader: aodFragmentShader,
      },
    };

    // create mesh and add to scene
    this.createMesh(this.initialState);
  }

  initGUI() {
    // create gui parameters for AOD
    this.params.guiParams.aod = this.aodMesh;

    // add gui for AOD
    const aodRollup = this.params.gui.addFolder('에어로졸 광학 두께(AOD)');
    aodRollup.close();

    // control visibility
    aodRollup.add(this.params.guiParams.aod, 'visible').name('활성화');

    // control opacity
    aodRollup
      .add(this.params.guiParams.aod.material.uniforms.uOpacity, 'value', 0, 1)
      .step(0.01)
      .name('투명도')
      .onChange((value) => {
        this.aodMesh.material.transparent = true;
        this.aodMesh.material.uniforms.uOpacity.value = value;
      });

    // control colorRange minimum
    aodRollup
      .add(this.params.guiParams.aod.material.uniforms.uColorRangeMin, 'value', 0, 1)
      .name('범위 최솟값');

    // control colorRange maximum
    aodRollup
      .add(this.params.guiParams.aod.material.uniforms.uColorRangeMax, 'value', 1, 5)
      .name('범위 최댓값');
  }

  createMesh(state) {
    const promises = [this.createGeometry(), this.createMaterial(state.material)];

    return Promise.all(promises).then((result) => {
      // draw
      this.aodMesh = new THREE.Mesh(result[0], result[1]);
      this.aodMesh.frustumCulled = false;
      this.aodMesh.material.depthTest = false;
      this.aodMesh.visible = false;
      this.params.scene.add(this.aodMesh);

      // add dat.gui
      this.initGUI();
    });
  }

  createGeometry() {
    // create an instance of buffer geometry
    const geometry = new THREE.BufferGeometry();

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
      const loader = new THREE.FileLoader(this.params.loadingManager);
      loader.setResponseType('arraybuffer');
      loader.load(url, resolve);
    });
  }

  loadTexture(url) {
    return new Promise((resolve) => {
      new THREE.TextureLoader(this.params.loadingManager).load(url, resolve);
    });
  }
}
