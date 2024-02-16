import {
  Points,
  InstancedBufferGeometry,
  InstancedInterleavedBuffer,
  InterleavedBufferAttribute,
  BufferAttribute,
  RawShaderMaterial,
} from 'three';

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
      geometry: { url: 'assets/data/GK2_GOCI2_L1B_20220809_001530_LA_RGB_8bit.dat' },
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
      this.cloudMesh = new Points(result[0], result[1]);
      this.cloudMesh.visible = false;
      this.params.scene.add(this.cloudMesh);

      // add dat.gui
      this.initGUI();
    });
  }

  createGeometry(geometry) {
    const promise = utils.loadBinaryFile(geometry.url);

    return promise.then((arrayBuffer) => {
      // create an instance of instanced buffer geometry
      const instancedBuffergeometry = new InstancedBufferGeometry();

      // the following typed arrays share the same buffer
      const instanceWorldPosition = new Float32Array(arrayBuffer);
      const instanceCloudColor = new Uint8Array(arrayBuffer);

      // create instancedInterleavedBuffer
      const instancedInterleavedBuffer32 = new InstancedInterleavedBuffer(instanceWorldPosition, 3);
      const instancedInterleavedBuffer8 = new InstancedInterleavedBuffer(instanceCloudColor, 12);

      // set attributes to this geometry
      instancedBuffergeometry.setAttribute(
        'position',
        new BufferAttribute(new Float32Array([0.0, 0.0, 0.0]), 3)
      );
      instancedBuffergeometry.setAttribute(
        'instanceWorldPosition',
        new InterleavedBufferAttribute(
          instancedInterleavedBuffer32,
          2, // itemSize
          0, // offset (in bytes)
          false // normalized
        )
      );
      instancedBuffergeometry.setAttribute(
        'instanceCloudColor',
        new InterleavedBufferAttribute(
          instancedInterleavedBuffer8,
          3, // itemSize
          8, // offset (in bytes)
          false // normalized
        )
      );

      return instancedBuffergeometry;
    });
  }

  createMaterial(material) {
    return new Promise((resolve) => {
      // create raw shader material
      const rawShaderMaterial = new RawShaderMaterial({
        ...material,
      });

      resolve(rawShaderMaterial);
    });
  }
}
