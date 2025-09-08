import * as THREE from "three";

export function createChair() {
  const group = new THREE.Group();

  // Procedural "futuristic chair" (abstract)
  const seatGeo = new THREE.BoxGeometry(0.9, 0.15, 0.9);
  const backGeo = new THREE.BoxGeometry(0.9, 1.2, 0.15);
  backGeo.translate(0, 0.6, -0.35);
  seatGeo.translate(0, 0.45, 0);

  const armGeo = new THREE.BoxGeometry(0.15, 0.3, 0.7);
  const armRight = armGeo.clone();
  armGeo.translate(-0.55, 0.6, 0);
  armRight.translate(0.55, 0.6, 0);

  const material = new THREE.MeshStandardMaterial({
    color: "#1f2937",
    metalness: 0.6,
    roughness: 0.25,
    emissive: "#0a0a12",
    emissiveIntensity: 0.4
  });

  const seat = new THREE.Mesh(seatGeo, material);
  const back = new THREE.Mesh(backGeo, material);
  const armL = new THREE.Mesh(armGeo, material);
  const armR = new THREE.Mesh(armRight, material);

  group.add(seat, back, armL, armR);

  // Glowing accent lines
  const edges = new THREE.EdgesGeometry(seatGeo);
  const lineMat = new THREE.LineBasicMaterial({ color: "#60a5fa", linewidth: 2 });
  const line = new THREE.LineSegments(edges, lineMat);
  group.add(line);

  group.position.set(0, 0, 0);

  return { group };
}