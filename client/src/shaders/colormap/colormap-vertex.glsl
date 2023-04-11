#version 300 es

precision highp float;

// Uniforms
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// Attributes
in vec3 position;
in vec3 normal;

// Varyings
out vec3 vPosition;

void main(){
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  vPosition = position.xyz;
}