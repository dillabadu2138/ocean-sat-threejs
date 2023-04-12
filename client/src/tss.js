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
    // load tss and add to scene
    this.loadTssData(params);
  }

  initGUI() {
    // create gui parameters for TSS
    this.params.guiParams.tss = this.tssMesh;

    // add gui for TSS
    const tssRollup = this.params.gui.addFolder('총 부유물(TSS)');
    tssRollup.open();

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

    // control point size
    tssRollup
      .add(this.params.guiParams.tss.material.uniforms.uPointSize, 'value')
      .min(1)
      .max(4)
      .step(0.01)
      .name('TSS 점 크기');
  }

  loadTssData(params) {
    // load a csv file
    const loader = new THREE.FileLoader();
    loader.load(
      // resource URL
      'assets/data/TSS_EastAsia_GK2B_GOCI2_L2_20220809_001530LA.csv',

      // onLoad callback
      (data) => {
        // skip header row
        const rows = data.split('\n').slice(1);

        // create an instance of instanced buffer geometry
        const tssGeometry = new THREE.InstancedBufferGeometry();

        // preallocate typed arrays
        const instanceWorldPosition = new Float32Array(rows.length * 2); // x, y
        const instanceTss = new Float32Array(rows.length); // val

        // iterate over rows
        for (let i = 0; i < rows.length; i++) {
          const values = rows[i].split(','); // lon, lat, val

          // instanced position
          instanceWorldPosition[i * 2] = values[0]; // lon
          instanceWorldPosition[i * 2 + 1] = values[1]; // lat

          // instanced tss
          instanceTss[i] = values[2];
        }

        // set attributes to this geometry
        tssGeometry.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array([0.0, 0.0, 0.0]), 3)
        );
        tssGeometry.setAttribute(
          'instanceWorldPosition',
          new THREE.InstancedBufferAttribute(instanceWorldPosition, 2)
        );
        tssGeometry.setAttribute('instanceTss', new THREE.InstancedBufferAttribute(instanceTss, 1));

        const lutTexture = new THREE.TextureLoader().load('assets/lut/Plasma.png');

        // create material
        const tssMaterial = new THREE.RawShaderMaterial({
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
            uPointSize: {
              value: 1,
            },
          },
          vertexShader: tssVertexShader,
          fragmentShader: tssFragmentShader,
        });

        // draw points
        this.tssMesh = new THREE.Points(tssGeometry, tssMaterial);
        params.scene.add(this.tssMesh);

        // add dat.gui
        this.initGUI();
      }
    );
  }
}
