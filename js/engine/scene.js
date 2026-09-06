import * as THREE from 'three';

export class EngineScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // ---- RENDERER: Optimized for performance ----
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: window.devicePixelRatio === 1, // Antialias only on 1x screens
      powerPreference: "high-performance",
      alpha: false,
      stencil: false,   // Disable stencil buffer - not needed
      depth: true
    });
    this.renderer.setSize(this.width, this.height);
    // Cap pixel ratio at 1.5 to reduce GPU load on HiDPI screens
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Use soft shadows but with SMALL shadow maps
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap; // Cheaper than PCFSoft
    this.renderer.shadowMap.autoUpdate = false; // Manual shadow update only on lighting change

    // Lighter tone mapping (ACESFilmic is GPU expensive — use LinearToneMapping)
    this.renderer.toneMapping = THREE.LinearToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    // Reduce fog density for performance
    this.scene.fog = new THREE.Fog(0x0d1527, 18, 35);

    // Camera
    this.camera = new THREE.PerspectiveCamera(65, this.width / this.height, 0.1, 60);
    this.camera.position.set(0, 1.65, 5);

    // Clock
    this.clock = new THREE.Clock();

    // Force a shadow map update on first frame
    this._shadowsNeedUpdate = true;

    window.addEventListener('resize', () => this.onWindowResize());
  }

  markShadowsDirty() {
    this._shadowsNeedUpdate = true;
  }

  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  render() {
    // Only recompute shadow maps when something changes (huge perf win)
    if (this._shadowsNeedUpdate) {
      this.renderer.shadowMap.needsUpdate = true;
      this._shadowsNeedUpdate = false;
    }
    this.renderer.render(this.scene, this.camera);
  }
}
