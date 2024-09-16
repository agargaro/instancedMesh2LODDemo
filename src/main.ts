import { Main, PerspectiveCameraAuto } from '@three.ez/main';
import { AmbientLight, DirectionalLight, MeshLambertMaterial, Scene, SphereGeometry } from 'three';
import { MapControls } from 'three/examples/jsm/Addons.js';
import { InstancedMeshLOD } from '@three.ez/instanced-mesh';
import { PRNG } from './random.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

const spawnRange = 10000;
const count = 1000000;

const random = new PRNG(10000);
const main = new Main();
const camera = new PerspectiveCameraAuto(70, 0.1, 2000).translateZ(100).translateY(20);
const scene = new Scene();
const controls = new MapControls(camera, main.renderer.domElement);
controls.maxDistance = 500;
controls.maxPolarAngle = Math.PI / 2.1;

const instancedMeshLOD = new InstancedMeshLOD(main.renderer, count);

instancedMeshLOD.addLevel(new SphereGeometry(5, 30, 15), new MeshLambertMaterial({ color: 'green' }));
instancedMeshLOD.addLevel(new SphereGeometry(5, 20, 10), new MeshLambertMaterial({ color: 'yellow' }), 100);
instancedMeshLOD.addLevel(new SphereGeometry(5, 10, 5), new MeshLambertMaterial({ color: 'orange' }), 500);
instancedMeshLOD.addLevel(new SphereGeometry(5, 5, 3), new MeshLambertMaterial({ color: 'red' }), 1000);

instancedMeshLOD.levels[0].object.geometry.computeBoundingSphere(); // this should be auatomatic

instancedMeshLOD.updateInstances((object, index) => {
  object.position.x = random.range(-spawnRange, spawnRange);
  object.position.z = random.range(-spawnRange, spawnRange);
});

instancedMeshLOD.computeBVH();

scene.add(camera, instancedMeshLOD, new AmbientLight('white', 0.3));

const dirLight = new DirectionalLight('white', 2).translateZ(100).translateY(20);
camera.add(dirLight, dirLight.target);

main.createView({ scene, camera, enabled: false });

const gui = new GUI();
gui.add(camera, 'far', 2000, 5000, 100).name('camera far').onChange(() => camera.updateProjectionMatrix());

document.getElementById("loading").remove();
