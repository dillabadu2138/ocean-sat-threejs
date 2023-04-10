#version 300 es

precision highp float;

// uniforms
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uPointSize;

// attributes
in vec3 position;
in vec2 instanceWorldPosition; // x y translation offsets for an instance
in float instanceChl;

// varyings
out float vChlorophyll;

// calculate point on unit sphere given longitude and latitude
vec3 convertCoordinateToPoint(vec2 coord){
  float r = cos(radians(coord.y));
  float y = sin(radians(coord.y));
  float x = sin(radians(coord.x-270.0)) * r;
  float z = cos(radians(coord.x-270.0)) * r;

  return vec3(x, y, z);
}

void main(){
  // set point position
  vec2 coords = position.xy + instanceWorldPosition;

  vec3 pos = convertCoordinateToPoint(coords);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  gl_PointSize = uPointSize;

  vChlorophyll = instanceChl;
}