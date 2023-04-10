import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import * as topojson from 'topojson-client';

// shader
import coastlineVertexShader from './shaders/coastline/coastline-vertex.glsl';
import coastlineFragmentShader from './shaders/coastline/coastline-fragment.glsl';

export class Coastline {
  constructor(params) {
    // create instance properties
    this.params = params;

    // initialize
    this.initialize(params);
  }

  initialize(params) {
    // load coastline and add to scene
    this.loadCoastline(params);
  }

  initGUI() {
    // create gui parameters for coastline
    this.params.guiParams.coastline = this;

    // add gui for coastline
    const coastlineRollup = this.params.gui.addFolder('해안선(coastline)');
    coastlineRollup.open();

    // control visibility
    coastlineRollup
      .add(this.params.guiParams.coastline.mesh, 'visible')
      .name('해안선 활성화(visible)');

    // control opacity
    coastlineRollup
      .add(this.params.guiParams.coastline.material.uniforms.uOpacity, 'value', 0, 1)
      .step(0.01)
      .name('해안선 투명도(opacity)')
      .onChange((value) => {
        this.material.transparent = true;
        this.material.uniforms.uOpacity.value = value;
      });

    // control color picking
    coastlineRollup
      .addColor(this.params.guiParams.coastline.material.uniforms.uLineColor, 'value')
      .name('해안선 색상(color)')
      .onChange((value) => {
        this.material.uniforms.uLineColor.value = value;
      });
  }

  loadCoastline(params) {
    // load a topojson file
    const loader = new THREE.FileLoader();
    loader.load(
      // resource URL
      'assets/data/earth-topo.json',

      // onLoad callback
      (data) => {
        // parse the data into JSON object
        const topology = JSON.parse(data);

        // convert topojson to geojson
        const geojson = topojson.feature(topology, topology.objects.coastline_10m);

        // create coastline geometries
        const geometries = this.createCoastlineGeometries(geojson);

        // create coastline material
        this.material = new THREE.RawShaderMaterial({
          uniforms: {
            uLineColor: {
              value: [255, 255, 255],
            },
            uOpacity: {
              value: 1.0,
            },
          },
          vertexShader: coastlineVertexShader,
          fragmentShader: coastlineFragmentShader,
        });

        // combine all geometries into one geometry
        this.geometry = BufferGeometryUtils.mergeBufferGeometries([...geometries]);

        // add to scene
        this.mesh = new THREE.Line(this.geometry, this.material);
        params.scene.add(this.mesh);

        // add dat.gui
        this.initGUI();
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
