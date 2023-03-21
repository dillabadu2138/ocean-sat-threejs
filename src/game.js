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

    //
    this.animate();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // create a loop that causes the renderer to draw the scene every time the screen is refreshed
  animate() {
    requestAnimationFrame(() => {
      this.renderer.render(this.scene, this.camera);

      this.animate();
    });
  }
}
