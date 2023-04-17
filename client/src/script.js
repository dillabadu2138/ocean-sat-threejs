import './styles.css';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'lil-gui';

// components
import { Game } from './game.js';
import { CubeSphere } from './cubeSphere.js';
import { controls } from './controls.js';
import { helpers } from './helpers.js';
import { Coastline } from './coastline.js';
import { Chlorophyll } from './chlorophyll.js';
import { Cloud } from './cloud.js';
import { Tss } from './tss.js';
import { Aod } from './aod.js';
import { Ssc } from './ssc.js';

// shaders
import colormapVertexShader from './shaders/colormap/colormap-vertex.glsl';
import colormapFragmentShader from './shaders/colormap/colormap-fragment.glsl';

class OceanSatelliteDemo extends Game {
  constructor() {
    // calls the parent class's constructor
    super();
  }

  onInitialize() {
    // create GUI
    this.createGUI();

    // create controls
    this.addEntity(
      'controls',
      new controls.MyOrbitControls({
        camera: this.graphics.camera,
        domElement: this.graphics.renderer.domElement,
        gui: this.gui,
        guiParams: this.guiParams,
      })
    );

    // add axeshelper
    this.addEntity(
      'axesHelper',
      new helpers.MyAxesHelper({
        scene: this.graphics.scene,
        gui: this.gui,
        guiParams: this.guiParams,
      })
    );

    // add coastline
    this.addEntity(
      'coastline',
      new Coastline({
        scene: this.graphics.scene,
        loadingManager: this.graphics.loadingManager,
        gui: this.gui,
        guiParams: this.guiParams,
      })
    );

    // add chlorophyll
    this.addEntity(
      'chlorophyll',
      new Chlorophyll({
        scene: this.graphics.scene,
        loadingManager: this.graphics.loadingManager,
        gui: this.gui,
        guiParams: this.guiParams,
      })
    );

    // add cloud
    this.addEntity(
      'cloud',
      new Cloud({
        scene: this.graphics.scene,
        loadingManager: this.graphics.loadingManager,
        gui: this.gui,
        guiParams: this.guiParams,
      })
    );

    // add tss
    this.addEntity(
      'tss',
      new Tss({
        scene: this.graphics.scene,
        loadingManager: this.graphics.loadingManager,
        gui: this.gui,
        guiParams: this.guiParams,
      })
    );

    // add aod
    this.addEntity(
      'aod',
      new Aod({
        scene: this.graphics.scene,
        loadingManager: this.graphics.loadingManager,
        gui: this.gui,
        guiParams: this.guiParams,
      })
    );

    // add ssc
    this.addEntity(
      'ssc',
      new Ssc({
        scene: this.graphics.scene,
        loadingManager: this.graphics.loadingManager,
        gui: this.gui,
        guiParams: this.guiParams,
      })
    );

    // add light
    const light = new THREE.AmbientLight(0xffffff);
    this.graphics.scene.add(light);

    // load Earth
    this.loadEarth();

    // load space cube texture background and add to scene
    this.loadSpaceCubeTexture();
  }

  createGUI() {
    // create dat.gui
    this.gui = new GUI({ width: 450 });
    this.gui.domElement.id = 'gui';

    // create gui parameters
    this.guiParams = {
      camera: this.graphics.camera,
    };

    // add gui for camera frustum
    const cameraRollup = this.gui.addFolder('카메라(Camera)');
    cameraRollup
      .add(this.guiParams.camera, 'fov', 30, 100)
      .name('카메라 절두체 수직시야각(fov)')
      .onChange(() => this.guiParams.camera.updateProjectionMatrix());
    cameraRollup
      .add(this.guiParams.camera, 'near', 0.1, this.graphics.camera.far)
      .name('카메라 절두체 근평면(near)')
      .onChange(() => this.guiParams.camera.updateProjectionMatrix());
    cameraRollup
      .add(this.guiParams.camera, 'far', 100, 10000)
      .name('카메라 절두체 원평면(far)')
      .onChange(() => this.guiParams.camera.updateProjectionMatrix());
    cameraRollup.close();

    // define new properties directly on an object create a helper object with getter and setter
    Object.defineProperties(this.guiParams.camera, {
      // getter and setter for positionX
      positionX: {
        get: function () {
          return this.position.x;
        },
        set: function (value) {
          this.position.x = value;
        },
      },
      // the getter and setter for positionY
      positionY: {
        get: function () {
          return this.position.y;
        },
        set: function (value) {
          this.position.y = value;
        },
      },
      // the getter and setter for positionZ
      positionZ: {
        get: function () {
          return this.position.z;
        },
        set: function (value) {
          this.position.z = value;
        },
      },
    });

    // add gui for camera position
    cameraRollup
      .add(this.guiParams.camera, 'positionX', -10, 10)
      .name('카메라 X 위치(positionX)')
      .onChange(() => this.guiParams.camera.updateMatrixWorld());
    cameraRollup
      .add(this.guiParams.camera, 'positionY', -10, 10)
      .name('카메라 Y 위치(positionY)')
      .onChange(() => this.guiParams.camera.updateMatrixWorld());
    cameraRollup
      .add(this.guiParams.camera, 'positionZ', -10, 10)
      .name('카메라 Z 위치(positionZ)')
      .onChange(() => this.guiParams.camera.updateMatrixWorld());
  }

  loadEarth() {
    // create a cube sphere
    const resolution = 100;
    this.cubeSphere = new CubeSphere(resolution);

    // combine all geometries into one geometry
    const earthGeometry = BufferGeometryUtils.mergeBufferGeometries([
      ...this.cubeSphere.geometries,
    ]);

    // load texture
    const colorMapTexture = new THREE.TextureLoader(this.graphics.loadingManager).load(
      'assets/images/world.topo.bathy.200409.3x5400x2700.jpg'
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
    this.earthMesh = new THREE.Mesh(earthGeometry, material);
    this.graphics.scene.add(this.earthMesh);
  }

  loadSatellite() {
    const loader = new GLTFLoader(this.graphics.loadingManager);
    loader.load(
      'assets/models/satellite.glb',
      // onLoad callback function
      (gltf) => {
        // extract mesh from the loaded data
        this.satelliteMesh = gltf.scene.children[0];

        // align an object to the new axis
        const curAxis = new THREE.Vector3(0, 1, 0); // the original dir of the satellite pointing up
        const newAxis = new THREE.Vector3(-1, 1, -1);
        this.satelliteMesh.quaternion.setFromUnitVectors(curAxis, newAxis.clone().normalize());

        // set the model position
        this.satelliteMesh.position.set(-1.001, 1.001, -1.001);

        // scale down the model
        this.satelliteMesh.scale.set(0.005, 0.005, 0.005);

        // add to scene
        this.graphics.scene.add(this.satelliteMesh);
      }
    );
  }

  loadSpaceCubeTexture() {
    const loader = new THREE.CubeTextureLoader(this.graphics.loadingManager);
    const cubeTexture = loader.load([
      './assets/images/space-posx.jpg',
      './assets/images/space-negx.jpg',
      './assets/images/space-posy.jpg',
      './assets/images/space-negy.jpg',
      './assets/images/space-posz.jpg',
      './assets/images/space-negz.jpg',
    ]);
    this.graphics.scene.background = cubeTexture;
  }
}

let APP = null;

function main() {
  APP = new OceanSatelliteDemo();
  console.log(APP);
}

main();
