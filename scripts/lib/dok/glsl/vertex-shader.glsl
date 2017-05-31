varying vec2 vUv;
attribute float tex;
attribute float light;
attribute vec3 spot;
attribute vec4 quaternion;
varying float vTex;
varying float vLight;
uniform vec3 vCam;

void main()  {
    vTex = tex;
    vUv = uv;

    vec3 newPosition = rotateVectorByQuaternion( position - spot, quaternion ) + spot;
    vLight = 1.0/ sqrt(500.0 / distance(newPosition, vCam)) * light;

    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}
