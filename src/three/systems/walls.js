import * as THREE from "three";

const wallVertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
}
`;

const wallFragment = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uLevel;
uniform float uIntensity;
uniform vec3 uColorA;
uniform vec3 uColorB;

float noise(vec3 p){
  return fract(sin(dot(p, vec3(12.9898,78.233, 37.719))) * 43758.5453);
}

void main(){
  float t = uTime * 0.2;
  float radial = length(vUv - 0.5);
  float glow = smoothstep(0.5, 0.2 + 0.15 * uIntensity, radial);
  float ripple = sin((radial * 40. - t * 14.) - uLevel * 12.0) * 0.5 + 0.5;
  float flicker = noise(vec3(vUv * 25.0, t)) * 0.35;
  vec3 col = mix(uColorA, uColorB, ripple + flicker * uIntensity);
  col *= (1.0 - glow);
  col += vec3(0.3,0.5,0.8) * pow(1.0 - radial, 4.0) * (0.4 + uLevel * 0.8);
  gl_FragColor = vec4(col, 0.85);
}
`;

export function createReactiveWalls() {
  const group = new THREE.Group();
  const geo = new THREE.CylinderGeometry(10, 10, 6, 64, 1, true);
  geo.rotateX(Math.PI / 2);
  geo.rotateZ(Math.PI / 2);

  const uniforms = {
    uTime: { value: 0 },
    uLevel: { value: 0 },
    uIntensity: { value: 0.5 },
    uColorA: { value: new THREE.Color("#4f46e5") },
    uColorB: { value: new THREE.Color("#9333ea") }
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: wallVertex,
    fragmentShader: wallFragment,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false
  });

  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);

  function setSkin(skin) {
    if (skin === "grid") {
      uniforms.uColorA.value.set("#00d9ff");
      uniforms.uColorB.value.set("#00ff9c");
    } else if (skin === "cyber") {
      uniforms.uColorA.value.set("#ff007a");
      uniforms.uColorB.value.set("#00e6ff");
    } else if (skin === "nature") {
      uniforms.uColorA.value.set("#2ea84e");
      uniforms.uColorB.value.set("#94f973");
    } else {
      uniforms.uColorA.value.set("#4f46e5");
      uniforms.uColorB.value.set("#9333ea");
    }
  }

  function update(dt, freq, level, intensity) {
    uniforms.uTime.value += dt;
    uniforms.uIntensity.value = intensity;
    uniforms.uLevel.value = level;
    mesh.rotation.z += dt * 0.02 * (0.5 + intensity);
  }

  return { group, update, setSkin };
}