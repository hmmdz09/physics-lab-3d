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
    // 1. Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xdbeafe, 0.45);
    this.scene.add(this.ambientLight);

    // 2. Sunlight coming from exterior windows (on +X side)
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 1.3);
    this.sunLight.position.set(12, 8, 2);
    this.sunLight.target.position.set(0, 0, 0);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 35;
    this.sunLight.shadow.camera.left = -10;
    this.sunLight.shadow.camera.right = 10;
    this.sunLight.shadow.camera.top = 10;
    this.sunLight.shadow.camera.bottom = -10;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // 3. Grid of Ceiling LED Panels (6 panels across the 15m x 8m hall)
    const ceilingPositions = [
      { x: -4.5, y: 3.6, z: -2.0 },
      { x: 0.0,  y: 3.6, z: -2.0 },
      { x: 4.5,  y: 3.6, z: -2.0 },
      { x: -4.5, y: 3.6, z: 2.0 },
      { x: 0.0,  y: 3.6, z: 2.0 },
      { x: 4.5,  y: 3.6, z: 2.0 }
    ];

    ceilingPositions.forEach((pos, idx) => {
      const pLight = new THREE.PointLight(0xf0f9ff, 0.7, 10, 1.2);
      pLight.position.set(pos.x, pos.y, pos.z);
      this.scene.add(pLight);
      this.ceilingLights.push(pLight);

      // Visual luminaire fixture on ceiling
      const fixtureGeo = new THREE.BoxGeometry(1.6, 0.06, 0.6);
      const fixtureMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xe0f2fe,
        emissiveIntensity: 0.9,
        roughness: 0.2
      });
      const fixtureMesh = new THREE.Mesh(fixtureGeo, fixtureMat);
      fixtureMesh.position.set(pos.x, pos.y + 0.1, pos.z);
      this.scene.add(fixtureMesh);
    });

    // 4. Spot Light for Teacher Demonstration Desk
    const demoSpot = new THREE.SpotLight(0xffffff, 1.5, 12, Math.PI / 5, 0.3, 1);
    demoSpot.position.set(0, 3.6, -5.5);
    demoSpot.target.position.set(0, 0.8, -5.5);
    this.scene.add(demoSpot);
    this.scene.add(demoSpot.target);
    this.accentLights.push(demoSpot);

    // 5. Preparation Room Light
    const prepLight = new THREE.PointLight(0xfef08a, 0.8, 8, 1.2);
    prepLight.position.set(-8.5, 3.2, 0);
    this.scene.add(prepLight);
    this.ceilingLights.push(prepLight);

    const prepFixture = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.06, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfef08a, emissiveIntensity: 0.8 })
    );
    prepFixture.position.set(-8.5, 3.4, 0);
    this.scene.add(prepFixture);
  }

  setLightingMode(mode) {
    this.currentMode = mode;

    if (mode === 'day') {
      this.ambientLight.color.setHex(0xdbeafe);
      this.ambientLight.intensity = 0.55;
      this.sunLight.intensity = 1.4;
      this.ceilingLights.forEach(l => l.intensity = 0.4);
      this.accentLights.forEach(l => l.intensity = 0.6);
      this.scene.fog.color.setHex(0x0d1527);
    } else if (mode === 'lab') {
      // Full bright fluorescent classroom mode
      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 0.7;
      this.sunLight.intensity = 0.5;
      this.ceilingLights.forEach(l => l.intensity = 1.1);
      this.accentLights.forEach(l => l.intensity = 1.4);
      this.scene.fog.color.setHex(0x111827);
    } else if (mode === 'cinematic') {
      // Dark / Presentation / Laser experiment mode
      this.ambientLight.color.setHex(0x0f172a);
      this.ambientLight.intensity = 0.15;
      this.sunLight.intensity = 0.1;
      this.ceilingLights.forEach(l => l.intensity = 0.1);
      this.accentLights.forEach(l => l.intensity = 0.4);
      this.scene.fog.color.setHex(0x05070e);
    }
  }
}
