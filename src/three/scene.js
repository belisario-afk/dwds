import * as THREE from "three";
import { createStarfield } from "./systems/starfield.js";
import { createReactiveWalls } from "./systems/walls.js";
import { createFloor } from "./systems/floor.js";
import { createChair } from "./systems/chair.js";
import { createBeams } from "./systems/beams.js";

let renderer, scene, camera, clock, frameId;
let starfield, walls, floor, chair, beams;
let seatedCameraTarget, freeFlyControls;
let currentProps = {};
let analyserGetter = () => null;
let intensityRef = 0.5;

const listener = new THREE.AudioListener();

export function initScene(container, { skin, intensity, cameraMode, getAnalyser }) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#02030a");
  clock = new THREE.Clock();
  camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    200
  );
  camera.add(listener);
  camera.position.set(0, 1.4, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.autoClear = false;
  renderer.physicallyCorrectLights = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  container.appendChild(renderer.domElement);

  const hemi = new THREE.HemisphereLight("#7dd3fc", "#312e81", 0.5);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight("#ffffff", 1.2);
  dir.position.set(5, 10, 7);
  dir.castShadow = false;
  scene.add(dir);

  starfield = createStarfield();
  scene.add(starfield.group);

  walls = createReactiveWalls();
  scene.add(walls.group);

  floor = createFloor();
  scene.add(floor.mesh);

  beams = createBeams();
  scene.add(beams.group);

  chair = createChair();
  scene.add(chair.group);

  seatedCameraTarget = new THREE.Object3D();
  seatedCameraTarget.position.set(0, 1.45, 0.2);
  scene.add(seatedCameraTarget);

  freeFlyControls = createFreeFlyControls(camera, renderer.domElement);

  currentProps = { skin, intensity, cameraMode };
  analyserGetter = getAnalyser;
  intensityRef = intensity;

  window.addEventListener("scene:update", (e) => {
    const d = e.detail;
    currentProps = { ...currentProps, ...d };
    if (typeof d.intensity === "number") intensityRef = d.intensity;
    updateSkins();
  });

  animate();
}

function updateSkins() {
  const skin = currentProps.skin;
  walls.setSkin(skin);
  floor.setSkin(skin);
  beams.setSkin(skin);
  starfield.setSkin(skin);
}

function animate() {
  frameId = requestAnimationFrame(animate);
  const dt = clock.getDelta();
  const analyser = analyserGetter?.();
  let level = 0;
  if (analyser?.array) {
    level = analyser.level;
    walls.update(dt, analyser.array, level, intensityRef);
    floor.update(dt, analyser.array, level, intensityRef);
    beams.update(dt, analyser.array, level, intensityRef);
    starfield.update(dt, analyser.array, level, intensityRef);
  }

  if (currentProps.cameraMode === "seated") {
    const targetPos = seatedCameraTarget.position;
    camera.position.lerp(
      new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z + 0.01),
      0.08
    );
    camera.quaternion.slerp(seatedCameraTarget.quaternion, 0.08);
  } else {
    freeFlyControls.update(dt, intensityRef);
  }

  renderer.clear();
  renderer.render(scene, camera);
}

export function resizeRenderer() {
  if (!renderer || !camera) return;
  const w = renderer.domElement.parentElement.clientWidth;
  const h = renderer.domElement.parentElement.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

export function disposeScene() {
  cancelAnimationFrame(frameId);
  renderer?.dispose();
  scene?.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material.dispose();
    }
  });
  renderer?.domElement?.remove();
}

function createFreeFlyControls(camera, dom) {
  const state = {
    speed: 3,
    vel: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    keys: {},
    pointerLocked: false,
    euler: new THREE.Euler(0, 0, 0, "YXZ")
  };

  function onKey(e) {
    state.keys[e.code] = e.type === "keydown";
  }
  window.addEventListener("keydown", onKey);
  window.addEventListener("keyup", onKey);

  dom.addEventListener("click", () => {
    dom.requestPointerLock?.();
  });

  function onPointerLockChange() {
    state.pointerLocked = document.pointerLockElement === dom;
  }
  document.addEventListener("pointerlockchange", onPointerLockChange);

  function onMove(e) {
    if (!state.pointerLocked) return;
    const sens = 0.0025;
    state.euler.y -= e.movementX * sens;
    state.euler.x -= e.movementY * sens;
    state.euler.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, state.euler.x));
  }
  window.addEventListener("mousemove", onMove);

  function update(dt, intensity) {
    if (!state.pointerLocked) return;
    camera.quaternion.setFromEuler(state.euler);

    const accel = 8 + intensity * 12;
    state.dir.set(0, 0, 0);
    if (state.keys["KeyW"]) state.dir.z -= 1;
    if (state.keys["KeyS"]) state.dir.z += 1;
    if (state.keys["KeyA"]) state.dir.x -= 1;
    if (state.keys["KeyD"]) state.dir.x += 1;
    if (state.keys["Space"]) state.dir.y += 1;
    if (state.keys["ShiftLeft"]) state.dir.y -= 1;
    if (state.dir.lengthSq() > 0) state.dir.normalize();

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0);
    const move = new THREE.Vector3()
      .addScaledVector(forward, state.dir.z)
      .addScaledVector(right, state.dir.x)
      .addScaledVector(up, state.dir.y);
    state.vel.addScaledVector(move, accel * dt);
    state.vel.multiplyScalar(0.9);
    camera.position.addScaledVector(state.vel, dt);
  }

  return { update };
}