import * as THREE from 'three';

export class EngineScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // ---- RENDERER ----
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,            // OFF for performance
      powerPreference: "high-performance",
      alpha: false,
      stencil: false,
      depth: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Shadows: keep autoUpdate ON but use small maps
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    // Lightest tone mapping (not ACESFilmic which is expensive)
    this.renderer.toneMapping = THREE.LinearToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    this.scene.fog = new THREE.Fog(0x0a0f1d, 20, 40);

    // Camera
    this.camera = new THREE.PerspectiveCamera(65, this.width / this.height, 0.1, 80);
    this.camera.position.set(0, 1.65, 5);

    // Clock
    this.clock = new THREE.Clock();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
