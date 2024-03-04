import './styles.css';
import {
  AmbientLight,
  TextureLoader,
  RawShaderMaterial,
  Mesh,
  CubeTextureLoader,
  BufferGeometry,
  BufferAttribute,
} from 'three';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

// components
import { Game } from './game.js';
import { CubeSphere } from './cubeSphere.js';
import { controls } from './controls.js';
import { Coastline } from './coastline.js';
import { Rgb } from './rgb.js';
import { Chlorophyll } from './chlorophyll.js';
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

    // add light
    const light = new AmbientLight(0xffffff);
    this.graphics.scene.add(light);

    // load Earth
    this.loadEarth();

    // load space cube texture background and add to scene
    this.loadSpaceCubeTexture();

    // create variable geometry
    this.createVariableGeometry(1500, 1400, 0.02, 0.02, 116.0, 22.0);

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

    // add rgb
    this.addEntity(
      'rgb',
      new Rgb({
        scene: this.graphics.scene,
        geometry: this.varGeometry,
        gui: this.gui,
        guiParams: this.guiParams,
      })
    );

    // add chlorophyll
    this.addEntity(
      'chlorophyll',
      new Chlorophyll({
        scene: this.graphics.scene,
        geometry: this.varGeometry,
        gui: this.gui,
        guiParams: this.guiParams,
      })
    );

    // add tss
    this.addEntity(
      'tss',
      new Tss({
        scene: this.graphics.scene,
        geometry: this.varGeometry,
        gui: this.gui,
        guiParams: this.guiParams,
      })
    );

    // add aod
    this.addEntity(
      'aod',
      new Aod({
        scene: this.graphics.scene,
        gui: this.gui,
        guiParams: this.guiParams,
      })
    );
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
  }

  loadEarth() {
    // create a cube sphere
    const resolution = 500;
    this.cubeSphere = new CubeSphere(resolution);

    // combine all geometries into one geometry
    const earthGeometry = mergeBufferGeometries([...this.cubeSphere.geometries]);

    // load textures
    const colorMapTexture = new TextureLoader(this.graphics.loadingManager).load(
      'assets/images/world.topo.bathy.200409.3x5400x2700.webp'
    );

    const heightMapTexture = new TextureLoader(this.graphics.loadingManager).load(
      'assets/images/gebco_bathy.5400x2700_8bit.webp'
    );

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

  createVariableGeometry(width, height, scaleX, scaleY, llX, llY) {
    // create an instance of buffer geometry
    this.varGeometry = new BufferGeometry();

    // create vertices and indices
    const positions = new Float32Array(width * height * 3);
    const indices = new Uint32Array((width - 1) * (height - 1) * 2 * 3); // times 6 because of two triangles
    let triangleIndex = 0;
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        // create vertices
        const index = (i + j * width) * 3;
        positions[index + 0] = llX + i * scaleX;
        positions[index + 1] = llY + j * scaleY;
        positions[index + 2] = 0;

        // create indices
        const cur_ind = i + j * width;

        if (i !== width - 1 && j !== height - 1) {
          // first triangle
          indices[triangleIndex] = cur_ind;
          indices[triangleIndex + 1] = cur_ind + width + 1;
          indices[triangleIndex + 2] = cur_ind + width;
          // second triangle
          indices[triangleIndex + 3] = cur_ind;
          indices[triangleIndex + 4] = cur_ind + 1;
          indices[triangleIndex + 5] = cur_ind + width + 1;

          triangleIndex += 6;
        }
      }
    }

    // set attributes to this geometry
    this.varGeometry.setAttribute('position', new BufferAttribute(positions, 3));
    this.varGeometry.setIndex(new BufferAttribute(indices, 1));
  }
}

let APP = null;

function main() {
  APP = new OceanSatelliteDemo();
}

main();
