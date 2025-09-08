import * as THREE from "three";

export function createBeams() {
  const group = new THREE.Group();
  const count = 24;
  const beams = [];
  for (let i = 0; i < count; i++) {
    const geo = new THREE.CylinderGeometry(0.05, 0.05, 8, 8, 1, true);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("white"),
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide
    });
    const m = new THREE.Mesh(geo, mat);
    const angle = (i / count) * Math.PI * 2;
    m.position.set(Math.cos(angle) * 4.5, 0, Math.sin(angle) * 4.5);
    m.lookAt(0, 0, 0);
    group.add(m);
    beams.push(m);
  }

  let colorA = new THREE.Color("#93c5fd");
  let colorB = new THREE.Color("#e879f9");

  function setSkin(skin) {
    if (skin === "grid") {
      colorA.set("#34d399");
      colorB.set("#06b6d4");
    } else if (skin === "cyber") {
      colorA.set("#ff007a");
      colorB.set("#00e6ff");
    } else if (skin === "nature") {
      colorA.set("#4ade80");
      colorB.set("#16a34a");
    } else {
      colorA.set("#93c5fd");
      colorB.set("#e879f9");
    }
  }

  function update(dt, freq, level, intensity) {
    const time = performance.now() * 0.001;
    beams.forEach((b, i) => {
      const pulse = Math.sin(time * 4 + i) * 0.5 + 0.5;
      const energy = level * 1.2 + intensity * 0.4;
      const lerpC = colorA.clone().lerp(colorB, (i / beams.length + pulse * 0.5) % 1);
      b.material.color.copy(lerpC);
      b.material.opacity = 0.03 + energy * 0.15 + pulse * 0.05;
      b.rotation.z += dt * 0.3 * (i % 2 === 0 ? 1 : -1);
    });
  }

  return { group, update, setSkin };
}