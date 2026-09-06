import * as THREE from 'three';
import { audioManager } from '../ui/audio.js';

export class SafetyBuilder {
  constructor(scene) {
    this.scene = scene;
    this.safetyObjects = [];
    this.isEmergencyTripped = false;
  }

  build() {
    const safetyGroup = new THREE.Group();

    // 1. APAR (ALAT PEMADAM API RINGAN) #1 - Near Main Door (X = 3.2, Z = 7.3)
    const apar1 = this.createApar();
    apar1.position.set(3.2, 1.2, 7.35);
    safetyGroup.add(apar1);
    this.safetyObjects.push(apar1);

    // APAR #2 - Near Prep Room Entry (X = -3.85, Z = 2.4)
    const apar2 = this.createApar();
    apar2.position.set(-3.85, 1.2, 2.4);
    apar2.rotation.y = Math.PI / 2;
    safetyGroup.add(apar2);
    this.safetyObjects.push(apar2);

    // 2. KOTAK P3K (FIRST AID CABINET) - On Rear Wall (X = 1.8, Z = 7.35)
    const p3kBox = this.createP3KBox();
    p3kBox.position.set(1.8, 1.5, 7.38);
    safetyGroup.add(p3kBox);
    this.safetyObjects.push(p3kBox);

    // 3. EMERGENCY EYE WASH STATION (X = 3.6, Z = 5.5)
    const eyeWash = this.createEyeWashStation();
    eyeWash.position.set(3.6, 0, 5.5);
    safetyGroup.add(eyeWash);
    this.safetyObjects.push(eyeWash);

    // 4. MASTER EMERGENCY POWER SHUTOFF (E-STOP) - On Front Wall (X = 3.2, Z = -7.38)
    const eStop = this.createEmergencyPowerSwitch();
    eStop.position.set(3.2, 1.4, -7.38);
    safetyGroup.add(eStop);
    this.safetyObjects.push(eStop);

    // 5. OUTWARD EMERGENCY EXIT DOORS (Rear Wall: Z = 7.4)
    const exitDoors = this.createExitDoors();
    exitDoors.position.set(0, 0, 7.4);
    safetyGroup.add(exitDoors);

    this.scene.add(safetyGroup);
    return safetyGroup;
  }

  createApar() {
    const group = new THREE.Group();

    // Red Cylinder (Height 0.55m, Radius 0.08m)
    const cylGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.55, 16);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3, metalness: 0.2 });
    const cyl = new THREE.Mesh(cylGeo, redMat);
    cyl.castShadow = true;
    group.add(cyl);

    // Top valve & handle
    const valveGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.08, 12);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const valve = new THREE.Mesh(valveGeo, metalMat);
    valve.position.y = 0.31;
    group.add(valve);

    // Pressure Gauge
    const gaugeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.015, 12);
    const gaugeMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const gauge = new THREE.Mesh(gaugeGeo, gaugeMat);
    gauge.rotation.x = Math.PI / 2;
    gauge.position.set(0, 0.33, 0.04);
    group.add(gauge);

    // Discharge Hose
    const hoseGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.45);
    const hoseMat = new THREE.MeshStandardMaterial({ color: 0x09090b });
    const hose = new THREE.Mesh(hoseGeo, hoseMat);
    hose.position.set(0.08, 0.08, 0);
    group.add(hose);

    // Instructional label on canister
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 128;
    labelCanvas.height = 128;
    const lctx = labelCanvas.getContext('2d');
    lctx.fillStyle = '#ffffff';
    lctx.fillRect(0, 0, 128, 128);
    lctx.fillStyle = '#dc2626';
    lctx.font = 'bold 26px sans-serif';
    lctx.textAlign = 'center';
    lctx.fillText('APAR', 64, 45);
    lctx.fillStyle = '#0f172a';
    lctx.font = 'bold 16px sans-serif';
    lctx.fillText('ABC DRY POWDER', 64, 75);
    lctx.fillText('6 KG', 64, 100);

    const labelTex = new THREE.CanvasTexture(labelCanvas);
    const labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.12, 0.12),
      new THREE.MeshBasicMaterial({ map: labelTex })
    );
    labelMesh.position.set(0, 0.05, 0.082);
    group.add(labelMesh);

    group.userData = {
      id: 'apar',
      type: 'safety',
      name: 'Alat Pemadam Api Ringan (APAR) ABC 6kg',
      category: 'Fasilitas K3 Wajib',
      description: 'Tabung pemadam serbuk kimia kering jenis ABC untuk penanganan darurat kebakaran listrik, peralatan optik, dan bahan laboratorium. Standar wajib: minimal 1 unit / 100 m².',
      regulationCitation: 'Permendikbud No. 24/2007 Bagian K3 Laboratorium.'
    };

    return group;
  }

  createP3KBox() {
    const group = new THREE.Group();

    // White metal cabinet (0.4m x 0.5m x 0.15m)
    const boxGeo = new THREE.BoxGeometry(0.4, 0.5, 0.15);
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const box = new THREE.Mesh(boxGeo, whiteMat);
    box.castShadow = true;
    group.add(box);

    // Front door canvas with green cross
    const crossCanvas = document.createElement('canvas');
    crossCanvas.width = 256;
    crossCanvas.height = 256;
    const cctx = crossCanvas.getContext('2d');
    cctx.fillStyle = '#ffffff';
    cctx.fillRect(0, 0, 256, 256);
    cctx.fillStyle = '#10b981';
    // Green Cross
    cctx.fillRect(106, 30, 44, 196);
    cctx.fillRect(30, 106, 196, 44);
    cctx.fillStyle = '#065f46';
    cctx.font = 'bold 26px sans-serif';
    cctx.textAlign = 'center';
    cctx.fillText('KOTAK P3K', 128, 240);

    const crossTex = new THREE.CanvasTexture(crossCanvas);
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(0.38, 0.48),
      new THREE.MeshBasicMaterial({ map: crossTex })
    );
    door.position.set(0, 0, 0.076);
    group.add(door);

    group.userData = {
      id: 'p3k',
      type: 'safety',
      name: 'Kotak P3K & Tanggap Darurat Medis Lab',
      category: 'Fasilitas K3 Wajib',
      description: 'Berisi perban steril, larutan antiseptik povidone iodine, plester luka bakar, larutan saline pencuci mata, pinset, dan buku panduan SOP P3K kemendikbud.',
      regulationCitation: 'Permendikbud No. 24/2007 Lampiran IV Butir D (Kesehatan & Keselamatan Kerja).'
    };

    return group;
  }

  createEyeWashStation() {
    const group = new THREE.Group();

    // Pedestal support pole
    const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.95);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const pole = new THREE.Mesh(poleGeo, metalMat);
    pole.position.y = 0.475;
    pole.castShadow = true;
    group.add(pole);

    // Safety yellow round basin
    const basinGeo = new THREE.CylinderGeometry(0.2, 0.15, 0.14, 16);
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
    const basin = new THREE.Mesh(basinGeo, yellowMat);
    basin.position.y = 0.95;
    group.add(basin);

    // Dual Eyewash spray heads
    const headGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.06);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });
    [-0.05, 0.05].forEach(hx => {
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(hx, 1.05, 0);
      group.add(head);
    });

    // Push Flag Handle
    const flagGeo = new THREE.BoxGeometry(0.08, 0.12, 0.01);
    const flagMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0.18, 1.02, 0);
    group.add(flag);

    group.userData = {
      id: 'eyewash',
      type: 'safety',
      name: 'Pancuran Bilas Mata Darurat (Emergency Eye Wash)',
      category: 'Fasilitas K3 Wajib',
      description: 'Stasiun pencuci mata bertekanan lembut dengan tuas cepat untuk membilas mata bila terkena serbuk logam, zat kimia praktikum, atau partikel panas.',
      regulationCitation: 'Standar Sanitasi dan Keselamatan Laboratorium IPA/Fisika Kemendikbudristek.'
    };

    return group;
  }

  createEmergencyPowerSwitch() {
    const group = new THREE.Group();

    // Yellow Caution Mounting Box
    const boxGeo = new THREE.BoxGeometry(0.2, 0.25, 0.08);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    group.add(box);

    // Big Red Mushroom Push-Button
    const btnGeo = new THREE.CylinderGeometry(0.05, 0.035, 0.04, 16);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 });
    const btn = new THREE.Mesh(btnGeo, redMat);
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0, 0, 0.05);
    group.add(btn);

    // Signage: "EMERGENCY POWER OFF"
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 128;
    const sctx = signCanvas.getContext('2d');
    sctx.fillStyle = '#0f172a';
    sctx.fillRect(0, 0, 256, 128);
    sctx.fillStyle = '#ef4444';
    sctx.font = 'bold 26px sans-serif';
    sctx.textAlign = 'center';
    sctx.fillText('EMERGENCY', 128, 45);
    sctx.fillText('POWER OFF', 128, 80);
    sctx.fillStyle = '#facc15';
    sctx.font = '16px monospace';
    sctx.fillText('SAKLAR SENTRAL LAB', 128, 110);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.25, 0.12),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    signMesh.position.set(0, 0.2, 0.01);
    group.add(signMesh);

    group.userData = {
      id: 'emergency_stop',
      type: 'safety',
      name: 'Master Emergency Power Cut-off (E-Stop)',
      category: 'Proteksi Kelistrikan Lab',
      description: 'Saklar darurat tombol jamur pemutus daya sentral seluruh 10 meja praktikum siswa secara instan untuk melindungi siswa dari sengatan listrik atau korsleting.',
      regulationCitation: 'Permendikbud No. 24/2007 (Instalasi Daya Listrik Terpusat).'
    };

    return group;
  }

  createExitDoors() {
    const group = new THREE.Group();

    // Double doors (Width 1.8m total, Height 2.4m)
    // Left Leaf & Right Leaf
    const doorGeo = new THREE.BoxGeometry(0.85, 2.35, 0.05);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 });

    const leftDoor = new THREE.Mesh(doorGeo, doorMat);
    leftDoor.position.set(-0.45, 1.175, 0);
    group.add(leftDoor);

    const rightDoor = new THREE.Mesh(doorGeo, doorMat);
    rightDoor.position.set(0.45, 1.175, 0);
    group.add(rightDoor);

    // Panic Push Bars (Outward emergency opening bar)
    const barGeo = new THREE.BoxGeometry(0.7, 0.04, 0.04);
    const barMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });

    const leftBar = new THREE.Mesh(barGeo, barMat);
    leftBar.position.set(-0.45, 1.05, -0.04);
    group.add(leftBar);

    const rightBar = new THREE.Mesh(barGeo, barMat);
    rightBar.position.set(0.45, 1.05, -0.04);
    group.add(rightBar);

    // Illuminated Exit Sign above doors
    const exitCanvas = document.createElement('canvas');
    exitCanvas.width = 256;
    exitCanvas.height = 96;
    const ectx = exitCanvas.getContext('2d');
    ectx.fillStyle = '#065f46';
    ectx.fillRect(0, 0, 256, 96);
    ectx.fillStyle = '#34d399';
    ectx.font = 'bold 36px sans-serif';
    ectx.textAlign = 'center';
    ectx.fillText('EXIT / KELUAR', 128, 58);

    const exitTex = new THREE.CanvasTexture(exitCanvas);
    const exitSign = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.3),
      new THREE.MeshBasicMaterial({ map: exitTex })
    );
    exitSign.position.set(0, 2.6, -0.03);
    group.add(exitSign);

    return group;
  }

  triggerEmergencyPower() {
    this.isEmergencyTripped = !this.isEmergencyTripped;
    if (this.isEmergencyTripped) {
      audioManager.playEmergencyAlarm();
    } else {
      audioManager.playClick();
    }
    return this.isEmergencyTripped;
  }
}
