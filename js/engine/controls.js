import * as THREE from 'three';
import { audioManager } from '../ui/audio.js';

export class ControllerManager {
  constructor(camera, domElement, scene) {
    this.camera = camera;
    this.domElement = domElement;
    this.scene = scene;

    this.mode = 'walk'; // 'walk' | 'orbit'

    // Walk Mode State
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false
    };

    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    this.isPointerLocked = false;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };

    // Eye height
    this.eyeHeight = 1.65;
    this.bobTimer = 0;
    this.footstepDistance = 0;

    // Orbit Mode State
    this.orbitRadius = 18;
    this.orbitTheta = Math.PI / 4;
    this.orbitPhi = Math.PI / 3.5;
    this.orbitTarget = new THREE.Vector3(0, 1.2, 0);

    // Collision boxes (AABBs for tables & walls)
    this.collisionBoxes = [];

    // Teleport lerp state
    this.isTeleporting = false;
    this.teleportStartPos = new THREE.Vector3();
    this.teleportEndPos = new THREE.Vector3();
    this.teleportStartLook = new THREE.Vector2();
    this.teleportEndLook = new THREE.Vector2();
    this.teleportProgress = 1;

    this.mouseButton = 0;

    this.initEvents();
  }

  initEvents() {
    // Keyboard events
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));

    // Mouse events
    this.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mouseup', () => this.onMouseUp());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));

    // Mouse wheel (Orbit zoom in / out)
    this.domElement.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

    // Prevent context menu on right click when in orbit mode
    this.domElement.addEventListener('contextmenu', (e) => {
      if (this.mode === 'orbit') e.preventDefault();
    });

    // Pointer lock change
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.domElement;
      const crosshair = document.getElementById('crosshair');
      if (crosshair) {
        crosshair.style.opacity = this.mode === 'walk' ? '1' : '0';
      }
    });

    // Touch support for mobile (drag to look / rotate, 2-finger pinch to zoom)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartDist = 0;

    this.domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        this.isDragging = true;
      } else if (e.touches.length === 2 && this.mode === 'orbit') {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.hypot(dx, dy);
      }
    }, { passive: true });

    this.domElement.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        if (this.mode === 'walk') {
          this.euler.y -= deltaX * 0.004;
          this.euler.x -= deltaY * 0.004;
          this.euler.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.euler.x));
          this.camera.quaternion.setFromEuler(this.euler);
        } else if (this.mode === 'orbit') {
          this.orbitTheta -= deltaX * 0.006;
          this.orbitPhi -= deltaY * 0.006;
          this.orbitPhi = Math.max(0.1, Math.min(Math.PI / 2.1, this.orbitPhi));
          this.updateOrbitCamera();
        }
      } else if (e.touches.length === 2 && this.mode === 'orbit') {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (touchStartDist > 0) {
          const deltaDist = touchStartDist - dist;
          this.orbitRadius = Math.max(3.0, Math.min(36.0, this.orbitRadius + deltaDist * 0.04));
          this.updateOrbitCamera();
        }
        touchStartDist = dist;
      }
    }, { passive: true });

    this.domElement.addEventListener('touchend', () => {
      this.isDragging = false;
      touchStartDist = 0;
    });
  }

  onWheel(e) {
    if (this.mode === 'orbit') {
      e.preventDefault();
      // Scroll down (positive deltaY) zooms out, scroll up (negative deltaY) zooms in
      const zoomStep = e.deltaY * 0.015;
      this.orbitRadius = Math.max(2.5, Math.min(36.0, this.orbitRadius + zoomStep));
      this.updateOrbitCamera();
    }
  }

  requestLock() {
    if (this.mode === 'walk') {
      this.domElement.requestPointerLock?.();
    }
  }

  onMouseDown(e) {
    if (e.target !== this.domElement) return;
    if (e.button === 0 || e.button === 1 || e.button === 2) {
      if (e.button === 0 && this.mode === 'walk' && !this.isPointerLocked) {
        this.requestLock();
      }
      this.isDragging = true;
      this.mouseButton = e.button;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  }

  onMouseUp() {
    this.isDragging = false;
  }

  onMouseMove(e) {
    if (this.mode === 'walk') {
      if (this.isPointerLocked) {
        this.euler.y -= e.movementX * 0.0022;
        this.euler.x -= e.movementY * 0.0022;
        this.euler.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.euler.x));
        this.camera.quaternion.setFromEuler(this.euler);
      } else if (this.isDragging && this.mouseButton === 0) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;
        this.euler.y -= deltaX * 0.003;
        this.euler.x -= deltaY * 0.003;
        this.euler.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.euler.x));
        this.camera.quaternion.setFromEuler(this.euler);
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    } else if (this.mode === 'orbit' && this.isDragging) {
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      if (this.mouseButton === 0) {
        // Left click: Rotate orbit
        this.orbitTheta -= deltaX * 0.006;
        this.orbitPhi -= deltaY * 0.006;
        this.orbitPhi = Math.max(0.08, Math.min(Math.PI / 2.05, this.orbitPhi));
      } else if (this.mouseButton === 1 || this.mouseButton === 2) {
        // Right click or middle click: Pan target
        const panFactor = this.orbitRadius * 0.0018;
        const sinT = Math.sin(this.orbitTheta);
        const cosT = Math.cos(this.orbitTheta);

        // Target panning along camera view plane
        this.orbitTarget.x += (-cosT * deltaX - sinT * deltaY * 0.5) * panFactor;
        this.orbitTarget.z += (sinT * deltaX - cosT * deltaY * 0.5) * panFactor;
        // Clamp orbit target inside reasonable boundaries
        this.orbitTarget.x = Math.max(-10, Math.min(10, this.orbitTarget.x));
        this.orbitTarget.z = Math.max(-10, Math.min(10, this.orbitTarget.z));
      }

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
      this.updateOrbitCamera();
    }
  }

  onKeyDown(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = true;
        break;
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = false;
        break;
    }
  }

  setMode(mode) {
    this.mode = mode;
    const crosshair = document.getElementById('crosshair');
    const keyHints = document.getElementById('key-hints');

    if (mode === 'walk') {
      if (crosshair) crosshair.style.display = 'block';
      this.camera.position.set(0, this.eyeHeight, 5);
      this.euler.set(0, 0, 0);
      this.camera.quaternion.setFromEuler(this.euler);
      if (keyHints) {
        keyHints.innerHTML = `
          <div class="kh-row"><kbd>W A S D</kbd><span>Gerak</span></div>
          <div class="kh-row"><kbd>Mouse</kbd><span>Lihat 360°</span></div>
          <div class="kh-row"><kbd>Shift</kbd><span>Sprint</span></div>
          <div class="kh-row"><kbd>Klik</kbd><span>Kunci Kursor</span></div>
        `;
      }
    } else if (mode === 'orbit') {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      if (crosshair) crosshair.style.display = 'none';
      this.orbitRadius = 16;
      this.orbitTheta = Math.PI / 4;
      this.orbitPhi = Math.PI / 3.4;
      this.orbitTarget.set(0, 1.2, 0);
      this.updateOrbitCamera();
      if (keyHints) {
        keyHints.innerHTML = `
          <div class="kh-row"><kbd>Scroll / W S</kbd><span>Zoom Maju/Jauh</span></div>
          <div class="kh-row"><kbd>Drag Kiri / A D</kbd><span>Putar 360°</span></div>
          <div class="kh-row"><kbd>Drag Kanan</kbd><span>Geser (Pan)</span></div>
          <div class="kh-row"><kbd>Pinch</kbd><span>Zoom Layar</span></div>
        `;
      }
    }
  }

  updateOrbitCamera() {
    const x = this.orbitTarget.x + this.orbitRadius * Math.sin(this.orbitPhi) * Math.sin(this.orbitTheta);
    const y = this.orbitTarget.y + this.orbitRadius * Math.cos(this.orbitPhi);
    const z = this.orbitTarget.z + this.orbitRadius * Math.sin(this.orbitPhi) * Math.cos(this.orbitTheta);
    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.orbitTarget);
  }

  teleportTo(pos, lookAngle = { x: 0, y: 0 }) {
    audioManager.playTeleport?.();

    if (this.mode !== 'walk') {
      this.mode = 'walk';
      const crosshair = document.getElementById('crosshair');
      if (crosshair) crosshair.style.display = 'block';
      const btnWalk = document.getElementById('btn-mode-walk');
      const btnOrbit = document.getElementById('btn-mode-orbit');
      if (btnWalk && btnOrbit) {
        btnWalk.classList.add('active');
        btnOrbit.classList.remove('active');
      }
      const keyHints = document.getElementById('key-hints');
      if (keyHints) {
        keyHints.innerHTML = `
          <div class="kh-row"><kbd>W A S D</kbd><span>Gerak</span></div>
          <div class="kh-row"><kbd>Mouse</kbd><span>Lihat 360°</span></div>
          <div class="kh-row"><kbd>Shift</kbd><span>Sprint</span></div>
          <div class="kh-row"><kbd>Klik</kbd><span>Kunci Kursor</span></div>
        `;
      }
    }

    this.isTeleporting = true;
    this.teleportProgress = 0;
    this.teleportStartPos.copy(this.camera.position);
    this.teleportEndPos.set(pos.x, this.eyeHeight, pos.z);

    this.teleportStartLook.set(this.euler.x, this.euler.y);
    this.teleportEndLook.set(lookAngle.x, lookAngle.y);
  }

  addCollisionBox(minX, maxX, minZ, maxZ) {
    this.collisionBoxes.push({ minX, maxX, minZ, maxZ });
  }

  checkCollision(x, z) {
    // Room perimeter check:
    // Main hall: X from -7.3 to 7.3, Z from -7.3 to 7.3
    // Prep room entrance at X: -7.5 to -11.0, Z: -2.8 to 2.8
    const inMainHall = (x >= -7.3 && x <= 7.3 && z >= -7.3 && z <= 7.3);
    const inPrepRoom = (x >= -11.3 && x <= -7.0 && z >= -2.8 && z <= 2.8);

    if (!inMainHall && !inPrepRoom) {
      return true; // Wall collision
    }

    // Check against obstacle bounding boxes (student tables, cabinets)
    const padding = 0.35; // Player radius
    for (const box of this.collisionBoxes) {
      if (
        x > (box.minX - padding) && x < (box.maxX + padding) &&
        z > (box.minZ - padding) && z < (box.maxZ + padding)
      ) {
        return true; // Table collision
      }
    }

    return false;
  }

  update(delta) {
    // Handle Teleportation lerp
    if (this.isTeleporting) {
      this.teleportProgress += delta * 2.5;
      if (this.teleportProgress >= 1) {
        this.teleportProgress = 1;
        this.isTeleporting = false;
      }
      const t = 1 - Math.pow(1 - this.teleportProgress, 3); // Ease out cubic
      this.camera.position.lerpVectors(this.teleportStartPos, this.teleportEndPos, t);
      this.euler.x = THREE.MathUtils.lerp(this.teleportStartLook.x, this.teleportEndLook.x, t);
      this.euler.y = THREE.MathUtils.lerp(this.teleportStartLook.y, this.teleportEndLook.y, t);
      this.camera.quaternion.setFromEuler(this.euler);
      return;
    }

    if (this.mode === 'orbit') {
      let changed = false;
      const zoomSpeed = 12.0 * delta;
      const rotSpeed = 1.8 * delta;

      if (this.keys.forward) {
        this.orbitRadius = Math.max(2.5, this.orbitRadius - zoomSpeed);
        changed = true;
      }
      if (this.keys.backward) {
        this.orbitRadius = Math.min(36.0, this.orbitRadius + zoomSpeed);
        changed = true;
      }
      if (this.keys.left) {
        this.orbitTheta -= rotSpeed;
        changed = true;
      }
      if (this.keys.right) {
        this.orbitTheta += rotSpeed;
        changed = true;
      }
      if (changed) this.updateOrbitCamera();
      return;
    }

    if (this.mode !== 'walk') return;

    // Movement calculation
    const moveSpeed = this.keys.sprint ? 5.2 : 3.0;
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;

    this.direction.z = Number(this.keys.forward) - Number(this.keys.backward);
    this.direction.x = Number(this.keys.right) - Number(this.keys.left);
    this.direction.normalize();

    if (this.keys.forward || this.keys.backward) {
      this.velocity.z -= this.direction.z * moveSpeed * 8.0 * delta;
    }
    if (this.keys.left || this.keys.right) {
      this.velocity.x -= this.direction.x * moveSpeed * 8.0 * delta;
    }

    // Forward/sideway vectors according to yaw (euler.y)
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);

    const stepX = (forward.x * -this.velocity.z + right.x * -this.velocity.x) * delta;
    const stepZ = (forward.z * -this.velocity.z + right.z * -this.velocity.x) * delta;

    const currentX = this.camera.position.x;
    const currentZ = this.camera.position.z;

    // Test X move
    if (!this.checkCollision(currentX + stepX, currentZ)) {
      this.camera.position.x += stepX;
    }
    // Test Z move
    if (!this.checkCollision(this.camera.position.x, currentZ + stepZ)) {
      this.camera.position.z += stepZ;
    }

    // Footstep & Head Bobbing
    const actualSpeed = Math.sqrt(stepX * stepX + stepZ * stepZ);
    if (actualSpeed > 0.002) {
      this.bobTimer += delta * (this.keys.sprint ? 14 : 10);
      this.camera.position.y = this.eyeHeight + Math.sin(this.bobTimer) * 0.04;

      this.footstepDistance += actualSpeed;
      if (this.footstepDistance > 1.2) {
        audioManager.playFootstep();
        this.footstepDistance = 0;
      }
    } else {
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, this.eyeHeight, 0.1);
    }
  }
}
