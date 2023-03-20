import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { GUI } from 'dat.gui';

import { Game } from './game.js';
import { CubeSphere } from './cubeSphere.js';

// shaders
import colormapVertexShader from './shaders/colormap/colormap-vertex-shader';
import colormapFragmentShader from './shaders/colormap/colormap-fragment-shader';

class Demo extends Game {
  constructor() {
    // calls the parent class's constructor
    super();
  }

  onInitialize() {
    // create dat.gui
    this.gui = new GUI();

    // gui for camera frustum
    const CameraRollup = this.gui.addFolder('Camera Frustum');
    CameraRollup.add(this.camera, 'fov', 50, 100).onChange(() =>
      this.camera.updateProjectionMatrix()
    );
    CameraRollup.add(this.camera, 'near', 0.1, this.camera.far).onChange(() =>
      this.camera.updateProjectionMatrix()
    );
    CameraRollup.add(this.camera, 'far', 100, 10000).onChange(() =>
      this.camera.updateProjectionMatrix()
    );
    CameraRollup.open();

    // add axeshelper
    this.scene.add(new THREE.AxesHelper(5));

    // add light
    const light = new THREE.AmbientLight(0xffffff);
    this.scene.add(light);

    // create a control
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);
    controls.update();

    // create a cube sphere
    const resolution = 100;
    this.cubeSphere = new CubeSphere(resolution);

    // combine all geometries into one geometry
    const combinedGeometry = BufferGeometryUtils.mergeBufferGeometries([
      ...this.cubeSphere.geometries,
    ]);

    // load texture
    const colorMapTexture = new THREE.TextureLoader().load(
      'img/world.topo.bathy.200409.3x5400x2700.jpg'
    );
    colorMapTexture.minFilter = THREE.LinearMipMapLinearFilter;
    colorMapTexture.magFilter = THREE.NearestFilter;
    colorMapTexture.generateMipmaps = false;

    // create material
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        uColorMap: {
          value: colorMapTexture,
        },
      },
      vertexShader: colormapVertexShader,
      fragmentShader: colormapFragmentShader,
    });

    // add to scene
    this.combinedMesh = new THREE.Mesh(combinedGeometry, material);
    this.scene.add(this.combinedMesh);
  }
}

let APP = null;

function main() {
  APP = new Demo();
}

main();
