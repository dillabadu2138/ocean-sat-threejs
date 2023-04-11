#version 300 es

precision highp float;

// uniforms
uniform float uOpacity;

// varyings
in vec3 vColor;

// we need to declare an output for the fragment shader
out vec4 fragColor;

void main() {
  fragColor = vec4(vColor.rgb, uOpacity);
}
