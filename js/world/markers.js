import * as THREE from 'three';

export class MarkerManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.markers = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredObject = null;
    this.clickableMeshes = [];
  }

  addMarker(id, title, pos, targetData = {}) {
    const group = new THREE.Group();
    group.position.set(pos.x, pos.y, pos.z);

    // Glowing Holographic Diamond / Octahedron
    const geo = new THREE.OctahedronGeometry(0.16, 0);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const diamond = new THREE.Mesh(geo, mat);
    diamond.position.y = 0.25;
    group.add(diamond);

    // Inner Glowing Core
    const coreGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 0.25;
    group.add(core);

    // Pulsing Base Ring on ground / table surface
    const ringGeo = new THREE.RingGeometry(0.18, 0.22, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    group.add(ring);

    group.userData = {
      id: id,
      title: title,
      targetData: targetData,
      isMarker: true
    };

    this.scene.add(group);
    this.markers.push({ group, diamond, core, ring, basePosY: pos.y });
    this.clickableMeshes.push(diamond, core);

    return group;
  }

  registerClickableMesh(mesh, data) {
    mesh.userData = { ...mesh.userData, ...data };
    this.clickableMeshes.push(mesh);
  }

  update(delta, time) {
    // Animate all holographic beacons
    this.markers.forEach((m, idx) => {
      const bob = Math.sin(time * 3 + idx) * 0.08;
      m.diamond.position.y = 0.25 + bob;
      m.core.position.y = 0.25 + bob;
      m.diamond.rotation.y += delta * 1.5;
      m.diamond.rotation.x += delta * 0.8;

      const scalePulse = 1 + Math.sin(time * 4 + idx) * 0.15;
      m.ring.scale.set(scalePulse, scalePulse, scalePulse);
    });
  }

  checkRaycast(screenX, screenY, width, height) {
    this.mouse.x = (screenX / width) * 2 - 1;
    this.mouse.y = -(screenY / height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.clickableMeshes, true);

    if (intersects.length > 0) {
      let hit = intersects[0].object;
      while (hit && !hit.userData?.name && !hit.userData?.title && hit.parent) {
        hit = hit.parent;
      }
      return hit ? hit.userData : null;
    }
    return null;
  }
}
