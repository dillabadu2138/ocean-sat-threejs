import * as THREE from 'three';

// shader
import cloudVertexShader from './shaders/cloud/cloud-vertex.glsl';
import cloudFragmentShader from './shaders/cloud/cloud-fragment.glsl';

export class Cloud {
  constructor(params) {
    // create instance properties
    this.params = params;

    // initialize
    this.initialize(params);
  }

  initialize(params) {
    // load cloud and add to scene
    this.loadCloudData(params);
  }

  initGUI() {
    // create gui parameters for cloud
    this.params.guiParams.cloud = this.cloudMesh;

    // add gui for cloud
    const cloudRollup = this.params.gui.addFolder('구름 영상(cloud)');
    cloudRollup.open();

    // control visibility
    cloudRollup.add(this.params.guiParams.cloud, 'visible').name('구름 영상 활성화(visible)');

    // control opacity
    cloudRollup
      .add(this.params.guiParams.cloud.material.uniforms.uOpacity, 'value', 0, 1)
      .step(0.01)
      .name('구름 영상 투명도(opacity)')
      .onChange((value) => {
        this.cloudMesh.material.transparent = true;
        this.cloudMesh.material.uniforms.uOpacity.value = value;
      });
  }

  loadCloudData(params) {
    // load a csv file
    const loader = new THREE.FileLoader();
    loader.load(
      // resource URL
      'assets/data/cloud/IMGrgb_EastAsia_GK2B_GOCI2_L2_20220809_001530LA.csv',

      // onLoad callback
      (data) => {
        const rows = data.split('\n').slice(1); // skip header row

        // create an instance of instanced buffer geometry
        const cloudGeometry = new THREE.InstancedBufferGeometry();

        // preallocate typed arrays
        const instanceWorldPosition = new Float32Array(rows.length * 2); // xy
        const instanceCloudColor = new Float32Array(rows.length * 3); // rgb

        // iterate over rows
        for (let i = 0; i < rows.length; i++) {
          const values = rows[i].split(','); // lon, lat, val

          // instanced position
          instanceWorldPosition[i * 2] = values[0]; // lon
          instanceWorldPosition[i * 2 + 1] = values[1]; // lat

          // instanced cloud rgb
          instanceCloudColor[i * 3] = values[2];
          instanceCloudColor[i * 3 + 1] = values[3];
          instanceCloudColor[i * 3 + 2] = values[4];
        }

        // set attributes to this geometry
        cloudGeometry.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array([0.0, 0.0, 0.0]), 3)
        );
        cloudGeometry.setAttribute(
          'instanceWorldPosition',
          new THREE.InstancedBufferAttribute(instanceWorldPosition, 2)
        );
        cloudGeometry.setAttribute(
          'instanceCloudColor',
          new THREE.InstancedBufferAttribute(instanceCloudColor, 3)
        );

        // create material
        const cloudMaterial = new THREE.RawShaderMaterial({
          uniforms: {
            uOpacity: {
              value: 1.0,
            },
          },
          vertexShader: cloudVertexShader,
          fragmentShader: cloudFragmentShader,
        });

        // draw points
        this.cloudMesh = new THREE.Points(cloudGeometry, cloudMaterial);
        params.scene.add(this.cloudMesh);

        // add dat.gui
        this.initGUI();
      }
    );
  }
}
