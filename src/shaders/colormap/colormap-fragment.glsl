#version 300 es

precision mediump float;

// Uniforms
uniform sampler2D uColorMap;

// Varyings
in vec3 vPosition;

// we need to declare an output for the fragment shader
out vec4 fragColor;

#define PI 3.1415926535

// convert point on sphere to texture coordinates
vec2 convertPointToTexCoord(vec3 pos) {
  // ensure point is on unit sphere
  pos = normalize(pos);

  // calculate longitude and latitude
  float longitude = atan(-pos.z, pos.x);
  float latitude = asin(pos.y);

  // convert latitude and longitude to range [0, 1]
  float u = (longitude / PI + 1.0) / 2.0;
  float v = latitude /PI + 0.5;

  return vec2(u, v);
}

void main() {
  vec2 texCoord = convertPointToTexCoord(vPosition);
  fragColor = texture(uColorMap, texCoord);
}
