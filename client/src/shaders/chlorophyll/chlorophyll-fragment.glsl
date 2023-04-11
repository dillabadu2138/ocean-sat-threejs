#version 300 es

precision highp float;

// uniforms
uniform float uOpacity;
uniform sampler2D uLutTexture;
uniform float uColorRangeMin;
uniform float uColorRangeMax;

// varyings
in float vChlorophyll;

// we need to declare an output for the fragment shader
out vec4 fragColor;

void main() {
  // calculate pixel value 0 to 1
  float pixel = ( vChlorophyll - uColorRangeMin) / (uColorRangeMax - uColorRangeMin);

  // use the pixel value to look up a color from lut texture
  vec4 color = texture(uLutTexture, vec2(pixel, 0.5));

  fragColor = vec4(color.rgb, color.a * uOpacity);
}