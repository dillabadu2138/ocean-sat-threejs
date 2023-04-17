import * as THREE from 'three';

// shader
import sscVertexShader from './shaders/ssc/ssc-vertex.glsl';
import sscFragmentShader from './shaders/ssc/ssc-fragment.glsl';

export class Ssc {
  constructor(params) {
    // create instance properties
    this.params = params;

    // initialize
    this.initialize(params);
  }

  initialize(params) {
    // load ssc and add to scene
    this.loadSscData(params);
  }

  initGUI() {
    // create gui parameters for SSC
    this.params.guiParams.ssc = this.sscMesh;

    // add gui for SSC
    const sscRollup = this.params.gui.addFolder('표층해류(SSC)');
    sscRollup.open();

    // control visibility
    sscRollup.add(this.params.guiParams.ssc, 'visible').name('SSC 활성화');

    // control opacity
    sscRollup
      .add(this.params.guiParams.ssc.material.uniforms.uOpacity, 'value', 0, 1)
      .step(0.01)
      .name('SSC 투명도')
      .onChange((value) => {
        this.sscMesh.material.transparent = true;
        this.sscMesh.material.uniforms.uOpacity.value = value;
      });

    // control colorRange minimum
    sscRollup
      .add(this.params.guiParams.ssc.material.uniforms.uColorRangeMin, 'value', 0, 1)
      .step(0.01)
      .name('SSC 범위 최솟값');

    // control colorRange maximum
    sscRollup
      .add(this.params.guiParams.ssc.material.uniforms.uColorRangeMax, 'value', 0.7, 5)
      .step(0.01)
      .name('SSC 범위 최댓값');

    // control point size
    sscRollup
      .add(this.params.guiParams.ssc.material.uniforms.uPointSize, 'value')
      .min(1)
      .max(4)
      .step(0.01)
      .name('SSC 점 크기');
  }

  loadSscData(params) {
    // loaders
    const fileLoader = new THREE.FileLoader(this.params.loadingManager);
    const textureLoader = new THREE.TextureLoader(this.params.loadingManager);

    // promises
    const promiseSpd = new Promise((resolve, reject) => {
      fileLoader.load(
        'assets/data/SSC_spd_EastAsia_GK2B_GOCI2_L2_20220809_001530LA.csv',
        resolve,
        () => {},
        reject
      );
    });
    const promiseDir = new Promise((resolve, reject) => {
      fileLoader.load(
        'assets/data/SSC_dir_EastAsia_GK2B_GOCI2_L2_20220809_001530LA.csv',
        resolve,
        () => {},
        reject
      );
    });
    const promiseLut = new Promise((resolve, reject) => {
      textureLoader.load('assets/lut/Turbo.png', resolve, () => {}, reject);
    });

    // load csv files
    Promise.all([promiseSpd, promiseDir, promiseLut])
      .then((values) => {
        // speed and dir
        const rowsSpd = values[0].split('\n').slice(1);
        const rowsDir = values[1].split('\n').slice(1);

        // lut texture
        const lutTexture = values[2];

        // create an instance of instanced buffer geometry
        const sscGeometry = new THREE.InstancedBufferGeometry();

        // preallocate typed arrays
        const instanceWorldPosition = new Float32Array(rowsSpd.length * 2); // x, y
        const instanceSpd = new Float32Array(rowsSpd.length);
        const instanceDir = new Float32Array(rowsDir.length);

        // iterate over rows
        for (let i = 0; i < rowsSpd.length; i++) {
          const valuesSpd = rowsSpd[i].split(','); // lon, lat, val
          const valuesDir = rowsDir[i].split(','); // lon, lat, val

          // instanced position
          instanceWorldPosition[i * 2] = valuesSpd[0]; // lon
          instanceWorldPosition[i * 2 + 1] = valuesSpd[1]; // lat

          // instanced speed
          instanceSpd[i] = valuesSpd[2];

          // instanced direction
          instanceDir[i] = valuesDir[2];
        }

        // set attributes to geometry
        sscGeometry.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array([0.0, 0.0, 0.0]), 3)
        );
        sscGeometry.setAttribute(
          'instanceWorldPosition',
          new THREE.InstancedBufferAttribute(instanceWorldPosition, 2)
        );
        sscGeometry.setAttribute('instanceSpd', new THREE.InstancedBufferAttribute(instanceSpd, 1));
        sscGeometry.setAttribute('instanceDir', new THREE.InstancedBufferAttribute(instanceDir, 1));

        // create material
        const sscMaterial = new THREE.RawShaderMaterial({
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
              value: 1,
            },
            uPointSize: {
              value: 1,
            },
          },
          vertexShader: sscVertexShader,
          fragmentShader: sscFragmentShader,
        });

        // draw points
        this.sscMesh = new THREE.Points(sscGeometry, sscMaterial);
        params.scene.add(this.sscMesh);

        // add dat.gui
        this.initGUI();
      })
      .catch((error) => {
        console.log(error.message);
      });
  }
}
