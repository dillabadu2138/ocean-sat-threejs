export default `#version 300 es

precision highp float;

// we need to declare an output for the fragment shader
out vec4 fragColor;

void main() {
  fragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;
