import * as THREE from 'three';

// components
import { Graphics } from './graphics.js';

export class Game {
  constructor() {
    this.#initialize();
  }

  #initialize() {
    // instantiate graphics
    this.graphics = new Graphics();

    // initialize graphics
    this.graphics.initialize();

    // call overridden method from child
    this.onInitialize();

    // create a render loop
    this.rAF();
  }

  rAF() {
    requestAnimationFrame(() => {
      this.renderScene();
    });
  }

  renderScene() {
    // wait for loading to complete, then start rotating
    if (this.combinedMesh && this.chlMesh && this.cloudMesh && this.coastlineMeshes) {
      this.combinedMesh.rotateOnAxis(new THREE.Vector3(0, 0, 1).normalize(), 0.01);
      this.cloudMesh.rotateOnAxis(new THREE.Vector3(0, 0, 1).normalize(), 0.01);
      this.chlMesh.rotateOnAxis(new THREE.Vector3(0, 0, 1).normalize(), 0.01);
      this.coastlineMeshes.forEach((mesh, i) =>
        mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1).normalize(), 0.01)
      );
    }
    this.graphics.render();
    this.rAF();
  }
}
