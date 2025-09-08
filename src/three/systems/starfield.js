import * as THREE from "three";

export function createStarfield() {
  const group = new THREE.Group();
  const starCount = 2500;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const r = 60 * Math.pow(Math.random(), 0.8);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    positions.set([x, y, z], i * 3);
    const c = new THREE.Color().setHSL(0.55 + Math.random() * 0.05, 0.6, 0.6 + Math.random() * 0.4);
    colors.set([c.r, c.g, c.b], i * 3);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.4,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9
  });

  const points = new THREE.Points(geo, mat);
  group.add(points);

  function setSkin(skin) {
    const hueShift =
      skin === "cosmic" ? 0 :
      skin === "grid" ? 0.35 :
      skin === "cyber" ? 0.8 :
      0.33;
    for (let i = 0; i < starCount; i++) {
      const base = i * 3;
      const c = new THREE.Color(colors[base], colors[base + 1], colors[base + 2]);
      const hsl = {};
      c.getHSL(hsl);
      c.setHSL((hsl.h + hueShift) % 1, hsl.s, hsl.l);
      colors[base] = c.r;
      colors[base + 1] = c.g;
      colors[base + 2] = c.b;
    }
    geo.attributes.color.needsUpdate = true;
  }

  function update(dt, freq, level, intensity) {
    points.rotation.y += dt * 0.02;
    points.material.size = 0.2 + level * 1.5 + intensity * 0.3;
    points.material.opacity = 0.5 + level * 0.5;
  }

  return { group, update, setSkin };
}