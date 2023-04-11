import * as THREE from 'three';

export class Graphics {
  constructor() {}

  initialize() {
    // create a webgl renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // add the renderer to our HTML document
    document.body.appendChild(this.renderer.domElement);

    // add an window resize event listener
    window.addEventListener('resize', () => this.onWindowResize(), false);

    // create a camera
    this.camera = new THREE.PerspectiveCamera(
      40, // fov
      window.innerWidth / window.innerHeight, // aspect
      0.1, // near
      500.0 // far
    );
    this.camera.position.set(-2, 2, -2);

    // create a scene
    this.scene = new THREE.Scene();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    // render the scene using the camera
    this.renderer.render(this.scene, this.camera);
  }
}
