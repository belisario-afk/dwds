import * as THREE from "three";

const floorVertex = `
uniform float uTime;
uniform float uLevel;
uniform float uIntensity;
varying vec2 vUv;
void main(){
  vUv = uv;
  vec3 p = position;
  float dist = length(p.xz);
  p.y += sin(dist * 4.0 - uTime * 4.0) * 0.07 * uIntensity * (0.2 + uLevel * 1.2);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
}
`;

const floorFragment = `
precision highp float;
varying vec2 vUv;
uniform float uLevel;
uniform float uIntensity;
uniform vec3 uColorA;
uniform vec3 uColorB;

void main(){
  float g = smoothstep(0.0,1.0,vUv.x);
  vec3 col = mix(uColorA, uColorB, g);
  float grid = step(0.98, fract(vUv.x * 12.0)) + step(0.98, fract(vUv.y * 12.0));
  col += vec3(0.8,0.9,1.0) * grid * 0.15 * (0.3 + uIntensity * 0.7);
  col += vec3(0.1,0.6,0.9) * pow(1.0 - abs(vUv.y - 0.5)*2.0, 6.0) * uLevel * (0.5 + uIntensity);
  gl_FragColor = vec4(col, 0.9);
}
`;

export function createFloor() {
  const geo = new THREE.PlaneGeometry(22, 22, 128, 128);
  geo.rotateX(-Math.PI / 2);
  const uniforms = {
    uTime: { value: 0 },
    uLevel: { value: 0 },
    uIntensity: { value: 0.5 },
    uColorA: { value: new THREE.Color("#0f172a") },
    uColorB: { value: new THREE.Color("#1e3a8a") }
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: floorVertex,
    fragmentShader: floorFragment,
    transparent: true
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = false;

  function setSkin(skin) {
    if (skin === "grid") {
      uniforms.uColorA.value.set("#041b22");
      uniforms.uColorB.value.set("#053b3f");
    } else if (skin === "cyber") {
      uniforms.uColorA.value.set("#1f0230");
      uniforms.uColorB.value.set("#37064b");
    } else if (skin === "nature") {
      uniforms.uColorA.value.set("#0b2d14");
      uniforms.uColorB.value.set("#124026");
    } else {
      uniforms.uColorA.value.set("#0f172a");
      uniforms.uColorB.value.set("#1e3a8a");
    }
  }

  function update(dt, freq, level, intensity) {
    uniforms.uTime.value += dt;
    uniforms.uLevel.value = level;
    uniforms.uIntensity.value = intensity;
  }

  return { mesh, update, setSkin };
}