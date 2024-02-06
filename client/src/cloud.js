import * as THREE from 'three';

import { utils } from './utils';

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
    // set initial state
    this.initialState = {
      geometry: { url: 'assets/data/IMGrgb_EastAsia_GK2B_GOCI2_L2_20220809_001530LA.csv' },
      material: {
        uniforms: {
          uOpacity: { value: 1.0 },
          uPointSize: { value: 2 },
          uHeightCloud: { value: 0.0 },
          uHeightMultiplier: {
            value: 1.0,
          },
        },
        vertexShader: cloudVertexShader,
        fragmentShader: cloudFragmentShader,
      },
    };

    // create mesh and add to scene
    this.createMesh(this.initialState);
  }

  initGUI() {
    // create gui parameters for cloud
    this.params.guiParams.cloud = this.cloudMesh;

    // add gui for cloud
    const cloudRollup = this.params.gui.addFolder('구름 영상(cloud)');
    cloudRollup.close();

    // control visibility
    cloudRollup.add(this.params.guiParams.cloud, 'visible').name('활성화');

    // control opacity
    cloudRollup
      .add(this.params.guiParams.cloud.material.uniforms.uOpacity, 'value', 0, 1)
      .step(0.01)
      .name('투명도')
      .onChange((value) => {
        this.cloudMesh.material.transparent = true;
        this.cloudMesh.material.uniforms.uOpacity.value = value;
      });

    // control point size
    cloudRollup
      .add(this.params.guiParams.cloud.material.uniforms.uPointSize, 'value')
      .min(1)
      .max(4)
      .step(0.01)
      .name('점 크기');

    // control cloud height
    cloudRollup
      .add(this.params.guiParams.cloud.material.uniforms.uHeightCloud, 'value', 0.0, 10000.0)
      .step(1)
      .name('구름 높이');

    // control height multiplier value
    cloudRollup
      .add(this.params.guiParams.cloud.material.uniforms.uHeightMultiplier, 'value', 1.0, 100.0)
      .step(1)
      .name('Height 스케일');
  }

  createMesh(state) {
    const promises = [this.createGeometry(state.geometry), this.createMaterial(state.material)];

    return Promise.all(promises).then((result) => {
      // draw points
      this.cloudMesh = new THREE.Points(result[0], result[1]);
      this.cloudMesh.visible = false;
      this.params.scene.add(this.cloudMesh);

      // add dat.gui
      this.initGUI();
    });
  }

  createGeometry(geometry) {
    const promise = utils.loadFile(geometry.url);

    return promise.then((data) => {
      // skip header row
      const rows = data.split('\n').slice(1);

      // create an instance of instanced buffer geometry
      const instancedBuffergeometry = new THREE.InstancedBufferGeometry();

      // preallocate typed arrays
      const instanceWorldPosition = new Float32Array(rows.length * 2); // x, y
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
      instancedBuffergeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array([0.0, 0.0, 0.0]), 3)
      );
      instancedBuffergeometry.setAttribute(
        'instanceWorldPosition',
        new THREE.InstancedBufferAttribute(instanceWorldPosition, 2)
      );
      instancedBuffergeometry.setAttribute(
        'instanceCloudColor',
        new THREE.InstancedBufferAttribute(instanceCloudColor, 3)
      );

      return instancedBuffergeometry;
    });
  }

  createMaterial(material) {
    return new Promise((resolve) => {
      // create raw shader material
      const rawShaderMaterial = new THREE.RawShaderMaterial({
        ...material,
      });

      resolve(rawShaderMaterial);
    });
  }
}
