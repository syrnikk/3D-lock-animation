import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

let scene, camera, renderer, lock, lockContainer, controls;
let binaryCode = [];

const cylinderRadius = 75; // Radius of the cylinder
const numbersPerLine = 40; // Amount of numbers per vertical line
const numberOfLines = 100; // Number of vertical lines
const minYPosition = -120; // Min Y position of falling binary code
const maxYPosition = 120; // Max Y position of falling binary code

function init() {
  // Scene, camera and renderer
  createScene();
  createCamera();
  createRenderer();

  // Light configuration
  configureLight();

  // Orbit controls configuration
  configureOrbitControls();

  // Generate binary code in the background
  generateBinaryCodeBackground();

  // Load gtlf 3D model of lock
  loadLock();
}

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  // Rotate the lock
  lockContainer.rotation.y += 0.01;

  // Make binary code falling
  binaryCode.forEach((text) => {
    text.position.y -= text.data.speed;
    if (text.position.y < minYPosition) {
      text.position.y = maxYPosition;
    }
  });

  renderer.render(scene, camera);
}

init();

function createScene() {
  scene = new THREE.Scene();
}

function createCamera() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 70;
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x181818);
  document.body.appendChild(renderer.domElement);
}

function configureLight() {
  const topLight = new THREE.DirectionalLight(0xffffff);
  topLight.position.set(200, 200, 200);
  topLight.castShadow = true;
  scene.add(topLight);

  const light = new THREE.AmbientLight(0xffffff, 8);
  scene.add(light);
}

function configureOrbitControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enableZoom = true;

  // Set min and max zoom distances
  controls.minDistance = 35;
  controls.maxDistance = 70;

  // Restrict camera to horizontal rotation
  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;

  // Enable rotation, disable panning
  controls.enableRotate = true;
  controls.enablePan = false;
}

function generateBinaryCodeBackground() {
  const fontLoader = new FontLoader();
  fontLoader.load(
    "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
    function (font) {
      const textOptions = {
        font: font,
        size: 3,
        height: 1,
      };

      for (let line = 0; line < numberOfLines; line++) {
        const angle = (line / numberOfLines) * Math.PI * 2;
        let previousYPosition = maxYPosition;
        const lineSpeed = 0.4 + Math.random() * 0.2; // Falling numbers speed (between 0.4 and 0.6)

        for (let i = 0; i < numbersPerLine; i++) {
          const binaryText = new TextGeometry(
            Math.random() < 0.5 ? "0" : "1",
            textOptions
          );
          const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          const mesh = new THREE.Mesh(binaryText, material);

          const xPosition = cylinderRadius * Math.cos(angle);
          const yPosition = previousYPosition;
          const zPosition = cylinderRadius * Math.sin(angle);

          const staggeredPosition =
            maxYPosition - i * ((maxYPosition - minYPosition) / numbersPerLine);
          mesh.position.set(xPosition, staggeredPosition, zPosition);

          // Pointing the numbers to the center of the cylinder
          mesh.lookAt(0, staggeredPosition, 0);

          mesh.data = { speed: lineSpeed };
          previousYPosition = yPosition;

          scene.add(mesh);
          binaryCode.push(mesh);
        }
      }
    }
  );
}

function loadLock() {
  const loader = new GLTFLoader();
  loader.load(
    "model/lock/scene.gltf",
    function (gltf) {
      lockContainer = new THREE.Object3D();
      lock = gltf.scene;

      // Adjust the position of the lock to center it in the container
      lock.position.set(0, -18, 0);

      lockContainer.add(lock);
      scene.add(lockContainer);
      animate();
    },
    undefined,
    function (error) {
      console.error("An error happened while loading the model:", error);
    }
  );
}
