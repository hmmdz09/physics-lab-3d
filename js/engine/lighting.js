import * as THREE from 'three';

export class LightingSystem {
  constructor(scene) {
    this.scene = scene;
    this.currentMode = 'day';

    this.ambientLight = null;
    this.sunLight = null;
    this.ceilingLights = [];
    this.accentLights = [];

    this.init();
  }

  init() {
    // 1. Ambient - the primary source of light (cheap, zero cost)
    this.ambientLight = new THREE.AmbientLight(0xdbeafe, 0.7);
    this.scene.add(this.ambientLight);

    // 2. ONE main directional light for sun (with shadows on small map)
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 1.0);
    this.sunLight.position.set(8, 7, 3);
    this.sunLight.target.position.set(0, 0, 0);
    this.sunLight.castShadow = true;
    // Small shadow map = fast. 512 is enough for a room.
    this.sunLight.shadow.mapSize.width = 512;
    this.sunLight.shadow.mapSize.height = 512;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 30;
    this.sunLight.shadow.camera.left = -9;
    this.sunLight.shadow.camera.right = 9;
    this.sunLight.shadow.camera.top = 9;
    this.sunLight.shadow.camera.bottom = -9;
    this.sunLight.shadow.bias = -0.001;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // 3. Just 2 representative HemisphereLights for ceiling bounce
    //    (replaces 6+ point lights — massive performance gain)
    const hemi = new THREE.HemisphereLight(0xf0f9ff, 0x1e293b, 0.4);
    this.scene.add(hemi);
    this.ceilingLights.push(hemi);

    // 4. ONE fill point light near demo desk (no shadow)
    const demoFill = new THREE.PointLight(0xffffff, 0.6, 9, 1.5);
    demoFill.position.set(0, 3.5, -5.5);
    this.scene.add(demoFill);
    this.accentLights.push(demoFill);

    // 5. Fake ceiling LED fixtures (pure MeshBasicMaterial — zero shading cost)
    this.buildCeilingFixtures();
  }

  buildCeilingFixtures() {
    const positions = [
      [-4.5, 3.69, -2.0], [0.0, 3.69, -2.0], [4.5, 3.69, -2.0],
      [-4.5, 3.69,  2.0], [0.0, 3.69,  2.0], [4.5, 3.69,  2.0]
    ];
    const fixGeo = new THREE.BoxGeometry(1.5, 0.05, 0.55);
    const fixMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });

    // Merge all fixtures into one draw call using InstancedMesh
    const instanced = new THREE.InstancedMesh(fixGeo, fixMat, positions.length);
    const dummy = new THREE.Object3D();
    positions.forEach((p, i) => {
      dummy.position.set(p[0], p[1], p[2]);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    });
    instanced.instanceMatrix.needsUpdate = true;
    this.scene.add(instanced);
  }

  setLightingMode(mode) {
    this.currentMode = mode;

    if (mode === 'day') {
      this.ambientLight.color.setHex(0xdbeafe);
      this.ambientLight.intensity = 0.7;
      this.sunLight.intensity = 1.1;
      this.accentLights.forEach(l => l.intensity = 0.4);
      this.scene.fog.color.setHex(0x0d1527);
    } else if (mode === 'lab') {
      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 1.0;
      this.sunLight.intensity = 0.3;
      this.accentLights.forEach(l => l.intensity = 0.9);
      this.scene.fog.color.setHex(0x111827);
    } else if (mode === 'cinematic') {
      this.ambientLight.color.setHex(0x0f172a);
      this.ambientLight.intensity = 0.12;
      this.sunLight.intensity = 0.05;
      this.accentLights.forEach(l => l.intensity = 0.15);
      this.scene.fog.color.setHex(0x05070e);
    }
  }
}
