#version 300 es

precision highp float;

// uniforms
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform sampler2D uHeightMap;
uniform float uHeightRangeMin;
uniform float uHeightRangeMax;
uniform float uHeightMultiplier;

// attributes
in vec3 position;
in vec3 normal;

// varyings
out vec3 vPosition;

#define PI 3.1415926535

// convert point on sphere to texture coordinates
vec2 convertPointToTexCoord(vec3 pos) {
  // ensure point is on unit sphere
  pos = normalize(pos);

  // calculate longitude and latitude
  float longitude = atan(-pos.z, pos.x);
  float latitude = asin(pos.y);

  // convert longitude and latitude to range [0, 1]
  float u = (longitude / PI + 1.0) / 2.0;
  float v = latitude / PI + 0.5;

  return vec2(u, v);
}

// get displacement data from heightmap
float getDisplacement(vec3 pos) {
  // retrieve texels from a heightmap texture
  vec2 texCoord = convertPointToTexCoord(pos);

  // heightmap is grayscale, so it doesn't matter if you use r, g, or b.
  vec4 bumpData = texture(uHeightMap, texCoord);

  return bumpData.r;
}

void main(){
  // get the heightmap data at those coordinates 
  float displacement = getDisplacement(position);

  // calculate the displacement in meters
  float displacementInMeters = (uHeightRangeMin + (uHeightRangeMax - uHeightRangeMin) * displacement);

  // move the position along the normal
  float earthRadius = 6371000.0;
  vec3 newPosition = position + normal * displacementInMeters * uHeightMultiplier / earthRadius;

  // Compute the position of the vertex using a standard formula
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

  vPosition = newPosition.xyz;
}