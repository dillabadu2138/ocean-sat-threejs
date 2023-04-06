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

  loadCoastline(params) {
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
        const geometries = this.createCoastlineGeometries(geojson);

        // create coastline material
        this.material = new THREE.RawShaderMaterial({
          uniforms: {
            uLineColor: {
              value: new Float32Array([1.0, 1.0, 1.0]),
            },
          },
          vertexShader: coastlineVertexShader,
          fragmentShader: coastlineFragmentShader,
        });

        // combine all geometries into one geometry
        this.geometry = BufferGeometryUtils.mergeBufferGeometries([...geometries]);

        // add to scene
        this.mesh = new THREE.Line(this.geometry, this.material);
        this.mesh.frustumCulled = false;
        params.scene.add(this.mesh);
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
