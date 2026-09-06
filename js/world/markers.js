import * as THREE from 'three';

export class MarkerManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.markers = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.clickableMeshes = [];

    // Shared geometry and material for all beacons (BIG perf win!)
    this._beaconGeo = new THREE.OctahedronGeometry(0.14, 0); // Low poly
    this._beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
    this._coreMat   = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this._ringGeo   = new THREE.RingGeometry(0.16, 0.20, 16);
    this._ringMat   = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.55
    });
    this._coreGeo   = new THREE.SphereGeometry(0.055, 6, 6);
  }

  addMarker(id, title, pos, targetData = {}) {
    const group = new THREE.Group();
    group.position.set(pos.x, pos.y, pos.z);

    const diamond = new THREE.Mesh(this._beaconGeo, this._beaconMat);
    diamond.position.y = 0.22;
    group.add(diamond);

    const core = new THREE.Mesh(this._coreGeo, this._coreMat);
    core.position.y = 0.22;
    group.add(core);

    const ring = new THREE.Mesh(this._ringGeo, this._ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    group.add(ring);

    group.userData = { id, title, targetData, isMarker: true };
    this.scene.add(group);
    this.markers.push({ group, diamond, core, ring });
    this.clickableMeshes.push(diamond, core);
    return group;
  }

  update(delta, time) {
    // Reuse sin value — computed once per frame for all markers
    const bobBase = time * 2.8;
    const rotDelta = delta * 1.4;

    this.markers.forEach((m, idx) => {
      const bob = Math.sin(bobBase + idx * 1.1) * 0.07;
      m.diamond.position.y = 0.22 + bob;
      m.core.position.y    = 0.22 + bob;
      m.diamond.rotation.y += rotDelta;
    });

    // Ring pulse: update only every 4th frame
    if (Math.round(time * 60) % 4 === 0) {
      const s = 1 + Math.sin(time * 3.5) * 0.12;
      this.markers.forEach(m => m.ring.scale.set(s, s, s));
    }
  }

  checkRaycast(screenX, screenY, width, height) {
    this.mouse.x = (screenX / width) * 2 - 1;
    this.mouse.y = -(screenY / height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.clickableMeshes, false);
    if (!hits.length) return null;
    let obj = hits[0].object;
    while (obj && !obj.userData?.title && obj.parent) obj = obj.parent;
    return obj?.userData ?? null;
  }
}
