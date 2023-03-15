import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { vec3 } from 'gl-matrix';

import { Game } from './game.js';
import { CubeSphere } from './cubeSphere.js';

class Demo extends Game {
  constructor() {
    // calls the parent class's constructor
    super();
  }

  onInitialize() {
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
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      wireframeLinewidth: 1,
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
