#version 300 es

precision highp float;

// uniforms
uniform float uOpacity;
uniform sampler2D uDataTexture;
uniform sampler2D uLutTexture;
uniform float uColorRangeMin;
uniform float uColorRangeMax;
uniform vec4 uImageBounds;

// varyings
in vec2 vWorldPosition;

// we need to declare an output for the fragment shader
out vec4 fragColor;

vec2 getUV(vec2 pos) {
  return vec2(
    (pos.x - uImageBounds[0]) / (uImageBounds[2] - uImageBounds[0]),
    (pos.y - uImageBounds[3]) / (uImageBounds[1] - uImageBounds[3])
  );
}

void main() {
	// calculate texture coordinates
  vec2 texCoord = getUV(vWorldPosition);

  // fetch the texel based on the value of the texture coord
  vec4 texel = texture(uDataTexture, texCoord);

  // filter out nodata
  if (texel.r <= 0.0 ) {
    discard;
  }

  // calculate pixel value 0 to 1
  float pixel = (texel.r - uColorRangeMin) / (uColorRangeMax - uColorRangeMin);

  // use the pixel value to look up a color from lut texture
  vec4 color = texture(uLutTexture, vec2(pixel, 0.5));

  fragColor = vec4(color.rgb, color.a * uOpacity);
}