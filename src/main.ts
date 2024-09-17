import { InstancedMeshLOD } from '@three.ez/instanced-mesh';
import { Main, PerspectiveCameraAuto } from '@three.ez/main';
import { AmbientLight, DirectionalLight, Mesh, MeshLambertMaterial, Scene, SphereGeometry } from 'three';
import { MapControls } from 'three/examples/jsm/Addons.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { PRNG } from './random.js';

const spawnRange = 10000;
const count = 1000000;

const random = new PRNG(10000);
const main = new Main();
const camera = new PerspectiveCameraAuto(70, 0.1, 2000).translateZ(100).translateY(20);
const scene = new Scene();
const controls = new MapControls(camera, main.renderer.domElement);
controls.maxDistance = 500;
controls.maxPolarAngle = Math.PI / 2;

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

/** HACK */

instancedMeshLOD.levels[0].object.renderOrder = 0;
instancedMeshLOD.levels[1].object.renderOrder = 1;
instancedMeshLOD.levels[2].object.renderOrder = 2;
instancedMeshLOD.levels[3].object.renderOrder = 3;

instancedMeshLOD.levels[0].object.interceptByRaycaster = false;
instancedMeshLOD.levels[1].object.interceptByRaycaster = false;
instancedMeshLOD.levels[2].object.interceptByRaycaster = false;
instancedMeshLOD.levels[3].object.interceptByRaycaster = false;

const obj = instancedMeshLOD.levels[0].object;
instancedMeshLOD.levels[0].object.bvh = instancedMeshLOD.bvh;
instancedMeshLOD.raycast = (r, i) => obj.raycast(r, i);

const hoverMesh = new Mesh(instancedMeshLOD.levels[0].object.geometry, new MeshLambertMaterial({ color: 'cyan' }));
hoverMesh.visible = false;
hoverMesh.matrixAutoUpdate = false;
hoverMesh.matrixWorldNeedsUpdate = false;

let lastHovered = null;

instancedMeshLOD.on('pointermove', (e) => {
  const intersected = e.intersection.instanceId;
  if (lastHovered !== intersected) {

    if (lastHovered !== null) instancedMeshLOD.setVisibilityAt(lastHovered, true);

    if (intersected) {
      hoverMesh.visible = true;
      hoverMesh.matrix.copy(instancedMeshLOD.getMatrixAt(intersected));
      instancedMeshLOD.setVisibilityAt(intersected, false);
    }

    lastHovered = intersected;
  }
});

hoverMesh.on('pointerout', (e) => {
  instancedMeshLOD.setVisibilityAt(lastHovered, true);
  hoverMesh.visible = false;
  lastHovered = null;
});

/** END */

scene.add(camera, instancedMeshLOD, new AmbientLight('white', 0.3), hoverMesh);

const dirLight = new DirectionalLight('white', 2).translateZ(100).translateY(20);
camera.add(dirLight, dirLight.target);

main.createView({ scene, camera });

const gui = new GUI();
gui.add(camera, 'far', 2000, 5000, 100).name('camera far').onChange(() => camera.updateProjectionMatrix());

document.getElementById("loading").remove();
