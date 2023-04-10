import * as THREE from 'three';

// shader
import chlorophyllVertexShader from './shaders/chlorophyll/chlorophyll-vertex.glsl';
import chlorophyllFragmentShader from './shaders/chlorophyll/chlorophyll-fragment.glsl';

export class Chlorophyll {
  constructor(params) {
    // create instance properties
    this.params = params;

    // initialize
    this.initialize(params);
  }

  initialize(params) {
    // load chlorophyll and add to scene
    this.loadChlorophyllData(params);
  }

  initGUI() {
    // create gui parameters for chlorophyll
    this.params.guiParams.chlorophyll = this.chlMesh;

    // add gui for coastline
    const chlRollup = this.params.gui.addFolder('클로로필(chlorophyll)');
    chlRollup.open();

    // control visibility
    chlRollup.add(this.params.guiParams.chlorophyll, 'visible').name('클로로필 활성화(visible)');

    // control opacity
    chlRollup
      .add(this.params.guiParams.chlorophyll.material.uniforms.uOpacity, 'value', 0, 1)
      .step(0.01)
      .name('클로로필 투명도(opacity)')
      .onChange((value) => {
        this.chlMesh.material.transparent = true;
        this.chlMesh.material.uniforms.uOpacity.value = value;
      });

    // control colorRange minimum
    chlRollup
      .add(this.params.guiParams.chlorophyll.material.uniforms.uColorRangeMin, 'value', 0, 1)
      .name('클로로필 범위 최솟값(color)');

    // control colorRange maximum
    chlRollup
      .add(this.params.guiParams.chlorophyll.material.uniforms.uColorRangeMax, 'value', 1, 5)
      .name('클로로필 범위 최댓값(color)');
  }

  loadChlorophyllData(params) {
    // load a csv file
    const loader = new THREE.FileLoader();
    loader.load(
      // resource URL
      'assets/data/Chl_EastAsia_GK2B_GOCI2_L2_20220809_001530LA.csv',

      // onLoad callback
      (data) => {
        // skip header row
        const rows = data.split('\n').slice(1);

        // create an instance of instanced buffer geometry
        const chlGeometry = new THREE.InstancedBufferGeometry();

        // preallocate typed arrays
        const instanceWorldPosition = new Float32Array(rows.length * 2); // x, y
        const instanceChl = new Float32Array(rows.length); // val

        // iterate over rows
        for (let i = 0; i < rows.length; i++) {
          const values = rows[i].split(','); // lon, lat, val

          // instanced position
          instanceWorldPosition[i * 2] = values[0]; // lon
          instanceWorldPosition[i * 2 + 1] = values[1]; // lat

          // instanced chlorophyll
          instanceChl[i] = values[2];
        }

        // set attributes to this geometry
        chlGeometry.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array([0.0, 0.0, 0.0]), 3)
        );
        chlGeometry.setAttribute(
          'instanceWorldPosition',
          new THREE.InstancedBufferAttribute(instanceWorldPosition, 2)
        );
        chlGeometry.setAttribute('instanceChl', new THREE.InstancedBufferAttribute(instanceChl, 1));

        const lutTexture = new THREE.TextureLoader().load('assets/lut/Turbo.png');

        // create material
        const chlMaterial = new THREE.RawShaderMaterial({
          uniforms: {
            uOpacity: {
              value: 1.0,
            },
            uLutTexture: {
              value: lutTexture,
            },
            uColorRangeMin: {
              value: 0,
            },
            uColorRangeMax: {
              value: 2,
            },
          },
          vertexShader: chlorophyllVertexShader,
          fragmentShader: chlorophyllFragmentShader,
        });

        // draw points
        this.chlMesh = new THREE.Points(chlGeometry, chlMaterial);
        params.scene.add(this.chlMesh);

        // add dat.gui
        this.initGUI();
      }
    );
  }
}
