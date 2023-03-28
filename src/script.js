import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'dat.gui';
import * as topojson from 'topojson-client';

// components
import { Game } from './game.js';
import { CubeSphere } from './cubeSphere.js';

// shaders
import colormapVertexShader from './shaders/colormap/colormap-vertex.glsl';
import colormapFragmentShader from './shaders/colormap/colormap-fragment.glsl';
import chlorophyllVertexShader from './shaders/chlorophyll/chlorophyll-vertex.glsl';
import chlorophyllFragmentShader from './shaders/chlorophyll/chlorophyll-fragment.glsl';
import cloudVertexShader from './shaders/cloud/cloud-vertex.glsl';
import cloudFragmentShader from './shaders/cloud/cloud-fragment.glsl';
import coastlineVertexShader from './shaders/coastline/coastline-vertex.glsl';
import coastlineFragmentShader from './shaders/coastline/coastline-fragment.glsl';

class Demo extends Game {
  constructor() {
    // calls the parent class's constructor
    super();
  }

  onInitialize() {
    // create dat.gui
    this.gui = new GUI();

    // gui for camera frustum
    const CameraRollup = this.gui.addFolder('Camera Frustum');
    CameraRollup.add(this.camera, 'fov', 30, 100).onChange(() =>
      this.camera.updateProjectionMatrix()
    );
    CameraRollup.add(this.camera, 'near', 0.1, this.camera.far).onChange(() =>
      this.camera.updateProjectionMatrix()
    );
    CameraRollup.add(this.camera, 'far', 100, 10000).onChange(() =>
      this.camera.updateProjectionMatrix()
    );
    CameraRollup.open();

    // add axeshelper
    this.scene.add(new THREE.AxesHelper(5));

    // add light
    const light = new THREE.AmbientLight(0xffffff);
    this.scene.add(light);

    // create a control
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);
    controls.update();

    // create a cube sphere
    const resolution = 100;
    this.cubeSphere = new CubeSphere(resolution);

    // combine all geometries into one geometry
    const combinedGeometry = BufferGeometryUtils.mergeBufferGeometries([
      ...this.cubeSphere.geometries,
    ]);

    // load texture
    const colorMapTexture = new THREE.TextureLoader().load(
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
    this.combinedMesh = new THREE.Mesh(combinedGeometry, material);
    this.scene.add(this.combinedMesh);

    // load satellite model
    this.loadSatellite();

    // load Chlorophyll data and add to scene
    this.loadChlorophyllData();

    // load cloud data and add to scene
    this.loadCloudData();

    // load coastline and add to scene
    this.loadCoastline();
  }

  loadSatellite() {
    const loader = new GLTFLoader();
    loader.load(
      'assets/models/satellite.glb',
      // onLoad callback function
      (gltf) => {
        // extract mesh from the loaded data
        const satellite = gltf.scene.children[0];

        // align an object to the new axis
        const curAxis = new THREE.Vector3(0, 1, 0); // the original dir of the satellite pointing up
        const newAxis = new THREE.Vector3(-1, 1, -1);
        satellite.quaternion.setFromUnitVectors(curAxis, newAxis.clone().normalize());

        // set the model position
        satellite.position.set(-1.001, 1.001, -1.001);

        // scale down the model
        satellite.scale.set(0.005, 0.005, 0.005);

        // add to scene
        this.scene.add(satellite);
      },
      // onProgress callback function
      (progress) => {
        console.log((progress.loaded / progress.total) * 100 + '% loaded');
      },
      // onError callback function
      (error) => {
        console.log(error);
      }
    );
  }

  loadChlorophyllData() {
    // load a csv file
    const loader = new THREE.FileLoader();
    loader.load(
      // resource URL
      'assets/data/Chlorophyll/Chl_EastAsia_GK2B_GOCI2_L2_20220809_001530LA.csv',

      // onLoad callback
      (data) => {
        const rows = data.split('\n').slice(1); // skip header row

        // create an instance of instanced buffer geometry
        this.chlGeometry = new THREE.InstancedBufferGeometry();
        //this.chlGeometry.maxInstancedCount = rows.length;

        // preallocate typed arrays
        const instanceWorldPosition = new Float32Array(rows.length * 2); // xy
        const instanceChl = new Float32Array(rows.length);

        // iterate over rows
        for (let i = 0; i < rows.length; i++) {
          const values = rows[i].split(','); // lon, lat, val

          // instanced position
          instanceWorldPosition[i * 2] = values[0]; // lon
          instanceWorldPosition[i * 2 + 1] = values[1]; // lat

          // instanced chlorophyll
          instanceChl[i] = values[2];
        }

        // set attributes to this geometry
        this.chlGeometry.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array([0.0, 0.0, 0.0]), 3)
        );
        this.chlGeometry.setAttribute(
          'instanceWorldPosition',
          new THREE.InstancedBufferAttribute(instanceWorldPosition, 2)
        );
        this.chlGeometry.setAttribute(
          'instanceChl',
          new THREE.InstancedBufferAttribute(instanceChl, 1)
        );

        // create material
        this.chlMaterial = new THREE.RawShaderMaterial({
          vertexShader: chlorophyllVertexShader,
          fragmentShader: chlorophyllFragmentShader,
        });

        // draw points
        this.chlMesh = new THREE.Points(this.chlGeometry, this.chlMaterial);
        this.scene.add(this.chlMesh);
      },

      // onProgress callback
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },

      // onError callback
      (err) => {
        console.log(err);
      }
    );
  }

  loadCloudData() {
    // load a csv file
    const loader = new THREE.FileLoader();
    loader.load(
      // resource URL
      'assets/data/cloud/IMGrgb_EastAsia_GK2B_GOCI2_L2_20220809_001530LA.csv',

      // onLoad callback
      (data) => {
        const rows = data.split('\n').slice(1); // skip header row

        // create an instance of instanced buffer geometry
        this.cloudGeometry = new THREE.InstancedBufferGeometry();

        // preallocate typed arrays
        const instanceWorldPosition = new Float32Array(rows.length * 2); // xy
        const instanceCloudColor = new Float32Array(rows.length * 3); // rgb

        // iterate over rows
        for (let i = 0; i < rows.length; i++) {
          const values = rows[i].split(','); // lon, lat, val

          // instanced position
          instanceWorldPosition[i * 2] = values[0]; // lon
          instanceWorldPosition[i * 2 + 1] = values[1]; // lat

          // instanced cloud rgb
          instanceCloudColor[i * 3] = values[2];
          instanceCloudColor[i * 3 + 1] = values[3];
          instanceCloudColor[i * 3 + 2] = values[4];
        }

        // set attributes to this geometry
        this.cloudGeometry.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array([0.0, 0.0, 0.0]), 3)
        );
        this.cloudGeometry.setAttribute(
          'instanceWorldPosition',
          new THREE.InstancedBufferAttribute(instanceWorldPosition, 2)
        );
        this.cloudGeometry.setAttribute(
          'instanceCloudColor',
          new THREE.InstancedBufferAttribute(instanceCloudColor, 3)
        );

        // create material
        this.cloudMaterial = new THREE.RawShaderMaterial({
          vertexShader: cloudVertexShader,
          fragmentShader: cloudFragmentShader,
        });

        // draw points
        this.cloudMesh = new THREE.Points(this.cloudGeometry, this.cloudMaterial);
        this.scene.add(this.cloudMesh);
      },

      // onProgress callback
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },

      // onError callback
      (err) => {
        console.log(err);
      }
    );
  }

  loadCoastline() {
    // load a topojson file
    const loader = new THREE.FileLoader();
    loader.load(
      // resource URL
      'assets/data/coastline/earth-topo.json',

      // onLoad callback
      (data) => {
        // parse the data into JSON object
        const topology = JSON.parse(data);

        // convert topojson to geojson
        const geojson = topojson.feature(topology, topology.objects.coastline_10m);

        // create coastline geometries
        this.coastlineGeometries = this.createCoastlineGeometries(geojson);

        // create material
        this.coastlineMaterial = new THREE.RawShaderMaterial({
          uniforms: {
            uLineColor: {
              value: new Float32Array([1.0, 1.0, 1.0]),
            },
          },
          vertexShader: coastlineVertexShader,
          fragmentShader: coastlineFragmentShader,
        });

        // iterate over geometries
        this.coastlineMeshes = [];
        for (let i = 0; i < this.coastlineGeometries.length; i++) {
          const mesh = new THREE.Line(this.coastlineGeometries[i], this.coastlineMaterial);
          mesh.frustumCulled = false;
          this.scene.add(mesh);
          this.coastlineMeshes.push(mesh);
        }
      }
    );
  }

  // create coastline geometries
  createCoastlineGeometries(json) {
    const features = json.features;

    // preallocate array
    const geometriesArray = [];

    // loop over every feature
    for (const feature of features) {
      const coordinates = feature.geometry.coordinates;

      // create geometry
      const points = [];
      for (const coordinate of coordinates) {
        points.push(new THREE.Vector2(coordinate[0], coordinate[1]));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      // add geometry to geometries array
      geometriesArray.push(geometry);
    }

    return geometriesArray;
  }
}

let APP = null;

function main() {
  APP = new Demo();
}

main();
