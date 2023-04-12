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
    // load aod and add to scene
    this.loadAodData(params);
  }

  initGUI() {
    // create gui parameters for AOD
    this.params.guiParams.aod = this.aodMesh;

    // add gui for AOD
    const aodRollup = this.params.gui.addFolder('에어로졸 광학 두께(AOD)');
    aodRollup.open();

    // control visibility
    aodRollup.add(this.params.guiParams.aod, 'visible').name('AOD 활성화');

    // control opacity
    aodRollup
      .add(this.params.guiParams.aod.material.uniforms.uOpacity, 'value', 0, 1)
      .step(0.01)
      .name('AOD 투명도')
      .onChange((value) => {
        this.aodMesh.material.transparent = true;
        this.aodMesh.material.uniforms.uOpacity.value = value;
      });

    // control colorRange minimum
    aodRollup
      .add(this.params.guiParams.aod.material.uniforms.uColorRangeMin, 'value', 0, 1)
      .name('AOD 범위 최솟값');

    // control colorRange maximum
    aodRollup
      .add(this.params.guiParams.aod.material.uniforms.uColorRangeMax, 'value', 1, 5)
      .name('AOD 범위 최댓값');

    // control point size
    aodRollup
      .add(this.params.guiParams.aod.material.uniforms.uPointSize, 'value')
      .min(1)
      .max(4)
      .step(0.01)
      .name('AOD 점 크기');
  }

  loadAodData(params) {
    // load a csv file
    const loader = new THREE.FileLoader();
    loader.load(
      // resource URL
      'assets/data/AOD_EastAsia_GK2B_GOCI2_L2_20220809_001530LA.csv',

      // onLoad callback
      (data) => {
        // skip header row
        const rows = data.split('\n').slice(1);

        // create an instance of instanced buffer geometry
        const aodGeometry = new THREE.InstancedBufferGeometry();

        // preallocate typed arrays
        const instanceWorldPosition = new Float32Array(rows.length * 2); // x, y
        const instanceAod = new Float32Array(rows.length); // val

        // iterate over rows
        for (let i = 0; i < rows.length; i++) {
          const values = rows[i].split(','); // lon, lat, val

          // instanced position
          instanceWorldPosition[i * 2] = values[0]; // lon
          instanceWorldPosition[i * 2 + 1] = values[1]; // lat

          // instanced aod
          instanceAod[i] = values[2];
        }

        // set attributes to this geometry
        aodGeometry.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array([0.0, 0.0, 0.0]), 3)
        );
        aodGeometry.setAttribute(
          'instanceWorldPosition',
          new THREE.InstancedBufferAttribute(instanceWorldPosition, 2)
        );
        aodGeometry.setAttribute('instanceAod', new THREE.InstancedBufferAttribute(instanceAod, 1));

        const lutTexture = new THREE.TextureLoader().load('assets/lut/Cool.png');

        // create material
        const aodMaterial = new THREE.RawShaderMaterial({
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
          vertexShader: aodVertexShader,
          fragmentShader: aodFragmentShader,
        });

        // draw points
        this.aodMesh = new THREE.Points(aodGeometry, aodMaterial);
        params.scene.add(this.aodMesh);

        // add dat.gui
        this.initGUI();
      }
    );
  }
}
