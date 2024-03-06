#version 300 es

precision highp float;

// uniforms
uniform sampler2D uDataTexture;
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

  fragColor = vec4(texel.rgb, 1.0);
}
