import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Game } from './game.js';

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

    // create a cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);
  }
}

let APP = null;

function main() {
  APP = new Demo();
}

main();
