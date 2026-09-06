import * as THREE from 'three';

export class LightingSystem {
  constructor(scene) {
    this.scene = scene;
    this.currentMode = 'day';
    this.ambientLight = null;
    this.sunLight = null;
    this.fillLight = null;
    this.hemi = null;

    this.init();
  }

  init() {
    // 1. Strong ambient — makes everything visible even with Lambert
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(this.ambientLight);

    // 2. Hemisphere for sky/ground bounce
    this.hemi = new THREE.HemisphereLight(0xdbeafe, 0x334155, 0.5);
    this.scene.add(this.hemi);

    // 3. Main directional (sun) with small shadow map
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 0.9);
    this.sunLight.position.set(5, 8, 3);
    this.sunLight.target.position.set(0, 0, 0);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width  = 512;
    this.sunLight.shadow.mapSize.height = 512;
    this.sunLight.shadow.camera.near   = 1;
    this.sunLight.shadow.camera.far    = 25;
    this.sunLight.shadow.camera.left   = -8;
    this.sunLight.shadow.camera.right  =  8;
    this.sunLight.shadow.camera.top    =  8;
    this.sunLight.shadow.camera.bottom = -8;
    this.sunLight.shadow.bias = -0.001;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // 4. One fill point light (no shadow) near demo area
    this.fillLight = new THREE.PointLight(0xffffff, 0.5, 10, 1.5);
    this.fillLight.position.set(0, 3.2, -4.5);
    this.scene.add(this.fillLight);

    // 5. Ceiling fixtures — MeshBasicMaterial (free cost)
    this._buildCeilingFixtures();
  }

  _buildCeilingFixtures() {
    const positions = [
      [-4.0, 3.68, -3.0], [0, 3.68, -3.0], [4.0, 3.68, -3.0],
      [-4.0, 3.68,  1.0], [0, 3.68,  1.0], [4.0, 3.68,  1.0],
      [-4.0, 3.68,  5.0], [0, 3.68,  5.0], [4.0, 3.68,  5.0],
    ];
    const geo = new THREE.BoxGeometry(1.6, 0.04, 0.5);
    const mat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
    const inst = new THREE.InstancedMesh(geo, mat, positions.length);
    const d = new THREE.Object3D();
    positions.forEach((p, i) => {
      d.position.set(...p);
      d.updateMatrix();
      inst.setMatrixAt(i, d.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
    this.scene.add(inst);
  }

  setLightingMode(mode) {
    this.currentMode = mode;
    if (mode === 'day') {
      this.ambientLight.intensity = 0.9;
      this.sunLight.intensity = 0.9;
      this.fillLight.intensity = 0.5;
    } else if (mode === 'lab') {
      this.ambientLight.intensity = 1.2;
      this.sunLight.intensity = 0.2;
      this.fillLight.intensity = 1.1;
    } else if (mode === 'cinematic') {
      this.ambientLight.intensity = 0.15;
      this.sunLight.intensity = 0.05;
      this.fillLight.intensity = 0.2;
    }
  }
}
