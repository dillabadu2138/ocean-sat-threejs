import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';

import { Game } from './game.js';
import { CubeSphere } from './cubeSphere.js';

class Demo extends Game {
  constructor() {
    // calls the parent class's constructor
    super();
  }

  onInitialize() {
    // add axeshelper
    this.scene.add(new THREE.AxesHelper(5));

    // create a control
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);
    controls.update();

    // create a cube sphere
    const resolution = 50;
    this.cubeSphere = new CubeSphere(resolution);

    // combine all geometries into one geometry
    const combinedGeometry = BufferGeometryUtils.mergeBufferGeometries([
      ...this.cubeSphere.geometries,
    ]);

    // add to scene
    const material = new THREE.MeshNormalMaterial({
      wireframe: true,
    });
    this.combinedMesh = new THREE.Mesh(combinedGeometry, material);
    this.scene.add(this.combinedMesh);
  }
}

let APP = null;

function main() {
  APP = new Demo();
}

main();
