import * as THREE from 'three';

export class Game {
  constructor() {
    this.#initialize();
  }

  #initialize() {
    // create a webgl renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // add the renderer to our HTML document
    document.body.appendChild(this.renderer.domElement);

    // add an window resize event listener
    window.addEventListener('resize', () => this.onWindowResize(), false);

    // create a camera
    const fov = 40;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 500.0;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(-2, 2, -2);

    // create a scene
    this.scene = new THREE.Scene();

    // call overridden method from child
    this.onInitialize();

    // create a render loop
    this.rAF();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
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

    // render the scene using the camera
    this.renderer.render(this.scene, this.camera);
    this.rAF();
  }
}
