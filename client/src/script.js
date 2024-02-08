import './styles.css';
import {
  AmbientLight,
  TextureLoader,
  LinearMipmapLinearFilter,
  LinearFilter,
  RawShaderMaterial,
  Mesh,
  CubeTextureLoader,
} from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { GUI } from 'lil-gui';

// components
import { Game } from './game.js';
import { CubeSphere } from './cubeSphere.js';
import { controls } from './controls.js';
import { Coastline } from './coastline.js';
import { Chlorophyll } from './chlorophyll.js';
import { Cloud } from './cloud.js';
import { Tss } from './tss.js';
import { Aod } from './aod.js';

// shaders
import earthVertexShader from './shaders/earth/earth-vertex.glsl';
import earthFragmentShader from './shaders/earth/earth-fragment.glsl';

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

    // add light
    const light = new AmbientLight(0xffffff);
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
    const resolution = 500;
    this.cubeSphere = new CubeSphere(resolution);

    // combine all geometries into one geometry
    const earthGeometry = BufferGeometryUtils.mergeBufferGeometries([
      ...this.cubeSphere.geometries,
    ]);

    // load textures
    const colorMapTexture = new TextureLoader(this.graphics.loadingManager).load(
      'assets/images/world.topo.bathy.200409.3x5400x2700.webp'
    );
    colorMapTexture.minFilter = LinearMipmapLinearFilter;
    // colorMapTexture.magFilter = NearestFilter;
    colorMapTexture.magFilter = LinearFilter;
    colorMapTexture.generateMipmaps = false;

    const heightMapTexture = new TextureLoader(this.graphics.loadingManager).load(
      'assets/images/gebco_bathy.5400x2700_8bit.webp'
    );
    heightMapTexture.minFilter = LinearMipmapLinearFilter;
    // heightMapTexture.magFilter = NearestFilter;
    heightMapTexture.magFilter = LinearFilter;
    heightMapTexture.generateMipmaps = false;

    // create material
    const material = new RawShaderMaterial({
      uniforms: {
        uColorMap: {
          value: colorMapTexture,
        },
        uHeightMap: {
          value: heightMapTexture,
        },
        uHeightRangeMin: {
          value: 0,
        },
        uHeightRangeMax: {
          value: 0,
        },
        uHeightMultiplier: {
          value: 10.0,
        },
      },
      vertexShader: earthVertexShader,
      fragmentShader: earthFragmentShader,
    });

    // add to scene
    this.earthMesh = new Mesh(earthGeometry, material);
    this.graphics.scene.add(this.earthMesh);

    // create gui parameters for earth
    this.guiParams.earth = this.earthMesh;

    // add gui for earth
    const earthRollup = this.gui.addFolder('지구(Earth)');
    earthRollup.close();

    // control minimum height minimum value
    earthRollup
      .add(this.guiParams.earth.material.uniforms.uHeightRangeMin, 'value', -10000, 0.0)
      .step(1)
      .name('Height 최솟값');

    // control maximum height maximum value
    earthRollup
      .add(this.guiParams.earth.material.uniforms.uHeightRangeMax, 'value', 0.0, 9000.0)
      .step(1)
      .name('Height 최댓값');

    // control height multiplier value
    earthRollup
      .add(this.guiParams.earth.material.uniforms.uHeightMultiplier, 'value', 1.0, 100.0)
      .step(1)
      .name('Height 스케일');
  }

  loadSpaceCubeTexture() {
    const loader = new CubeTextureLoader(this.graphics.loadingManager);
    const cubeTexture = loader.load([
      './assets/images/space-posx.webp',
      './assets/images/space-negx.webp',
      './assets/images/space-posy.webp',
      './assets/images/space-negy.webp',
      './assets/images/space-posz.webp',
      './assets/images/space-negz.webp',
    ]);
    this.graphics.scene.background = cubeTexture;
  }
}

let APP = null;

function main() {
  APP = new OceanSatelliteDemo();
}

main();
