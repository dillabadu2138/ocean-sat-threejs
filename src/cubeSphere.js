import * as THREE from 'three';
import { vec3, vec2 } from 'gl-matrix';

export class CubeSphere {
  constructor(resolution) {
    this.resolution = resolution;

    // create a list of geometries
    this.geometries = this.generateGeometries(resolution);
  }

  generateGeometries(resolution) {
    // create normal vector for each face
    const faceUp = vec3.fromValues(0, 1, 0);
    const faceDown = vec3.fromValues(0, -1, 0);
    const faceLeft = vec3.fromValues(-1, 0, 0);
    const faceRight = vec3.fromValues(1, 0, 0);
    const faceForward = vec3.fromValues(0, 0, 1);
    const faceBack = vec3.fromValues(0, 0, -1);
    const faceNormals = { faceUp, faceDown, faceLeft, faceRight, faceForward, faceBack };

    // generate geometry for each face
    const geometries = [];
    let geomIndex = 0;
    Object.values(faceNormals).forEach((faceNormal) => {
      geometries[geomIndex] = this.createFace(resolution, faceNormal);
      geomIndex++;
    });

    return geometries;
  }

  createFace(resolution, normal) {
    // preallocate
    const numVertices = resolution * resolution;
    const numIndices = (resolution - 1) * (resolution - 1) * 2 * 3;
    const vertices = new Float32Array(numVertices * 3);
    const indices = new Uint32Array(numIndices);
    const uvs = new Float32Array(numVertices * 2);
    const normals = new Float32Array(numVertices * 3);

    // create axes perpendicular to normal
    const normalX = normal[0];
    const normalY = normal[1];
    const normalZ = normal[2];
    const axisA = vec3.fromValues(normalY, normalZ, normalX);
    const axisB = vec3.create();
    vec3.cross(axisB, normal, axisA);

    // get steps between samples
    const dx = 1 / (resolution - 1);
    const dy = 1 / (resolution - 1);

    // calculate vertices and indices
    let triangleIndex = 0;
    let ty = 0;
    for (let y = 0; y < resolution; y++) {
      let tx = 0;
      for (let x = 0; x < resolution; x++) {
        const i = x + y * resolution;

        // point on cube
        let moveA = vec3.create();
        let moveB = vec3.create();
        let moveAB = vec3.create();
        let pointOnUnitCube = vec3.create();
        vec3.scale(moveA, axisA, (tx - 0.5) * 2);
        vec3.scale(moveB, axisB, (ty - 0.5) * 2);
        vec3.add(moveAB, moveA, moveB);
        vec3.add(pointOnUnitCube, normal, moveAB);

        // point on unit sphere
        let pointOnUnitSphere = this.cubePointToSpherePoint(pointOnUnitCube);

        // vertices, normals, uvs
        vertices.set(pointOnUnitSphere, i * 3);
        normals.set(pointOnUnitSphere, i * 3);
        let uv = vec2.fromValues(x / (resolution - 1), y / (resolution - 1));
        uvs.set(uv, i * 2);

        // indices
        if (x !== resolution - 1 && y !== resolution - 1) {
          // first triangle
          indices[triangleIndex] = i;
          indices[triangleIndex + 1] = i + resolution + 1;
          indices[triangleIndex + 2] = i + resolution;
          // second triangle
          indices[triangleIndex + 3] = i;
          indices[triangleIndex + 4] = i + 1;
          indices[triangleIndex + 5] = i + resolution + 1;

          triangleIndex += 6;
        }
        tx += dx;
      }
      ty += dy;
    }

    // create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    return geometry;
  }

  cubePointToSpherePoint(p) {
    const x2 = (p[0] * p[0]) / 2;
    const y2 = (p[1] * p[1]) / 2;
    const z2 = (p[2] * p[2]) / 2;
    const x = p[0] * Math.sqrt(1 - y2 - z2 + (p[1] * p[1] * p[2] * p[2]) / 3);
    const y = p[1] * Math.sqrt(1 - z2 - x2 + (p[0] * p[0] * p[2] * p[2]) / 3);
    const z = p[2] * Math.sqrt(1 - x2 - y2 + (p[0] * p[0] * p[1] * p[1]) / 3);
    const xyz = vec3.fromValues(x, y, z);
    return xyz;
  }
}
