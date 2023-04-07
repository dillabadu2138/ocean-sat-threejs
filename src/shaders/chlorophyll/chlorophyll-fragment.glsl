#version 300 es

precision highp float;

// uniforms
uniform vec3 uPointColor;
uniform float uOpacity;

// we need to declare an output for the fragment shader
out vec4 fragColor;

void main() {
  fragColor = vec4(uPointColor.rgb/255.0, uOpacity);
}