import * as THREE from 'three';

export class FurnitureBuilder {
  constructor(scene, controls) {
    this.scene = scene;
    this.controls = controls;
    this.materials = {};
    this.tables = [];
    this.initMaterials();
  }

  initMaterials() {
    // Lab bench top: Anti-chemical epoxy black/charcoal
    this.materials.benchTop = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.2,
      metalness: 0.1
    });

    // Steel leg frame
    this.materials.steelLeg = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.8,
      roughness: 0.3
    });

    // Stainless steel sink
    this.materials.sink = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2
    });

    // Chrome faucet
    this.materials.chrome = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1
    });

    // Electrical console
    this.materials.powerConsole = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4
    });

    // Stool chair seat (Teak wood / polymer)
    this.materials.chairSeat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6, // Institutional blue lab stool
      roughness: 0.5,
      metalness: 0.1
    });

    // Glass cabinet material
    this.materials.cabinetWood = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6
    });

    this.materials.cabinetGlass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      opacity: 0.5,
      transparent: true,
      roughness: 0.1
    });
  }

  build() {
    const furnitureGroup = new THREE.Group();

    // 1. BUILD 10 ISLAND PRAKTIKUM TABLES (FOR 40-50 STUDENTS)
    // Arranged in 2 columns: Left Column (X = -2.0), Right Column (X = +2.0)
    // 5 Rows along Z: [-3.8, -1.9, 0.0, +1.9, +3.8]
    const xColumns = [-2.0, 2.0];
    const zRows = [-3.8, -1.9, 0.0, 1.9, 3.8];

    let tableIndex = 1;
    for (let c = 0; c < xColumns.length; c++) {
      for (let r = 0; r < zRows.length; r++) {
        const xPos = xColumns[c];
        const zPos = zRows[r];
        const table = this.createStudentTable(tableIndex, xPos, zPos);
        furnitureGroup.add(table);

        // Register table for collision in walk mode
        this.controls.addCollisionBox(xPos - 1.05, xPos + 1.05, zPos - 0.58, zPos + 0.58);
        this.tables.push({ index: tableIndex, x: xPos, z: zPos, group: table });

        tableIndex++;
      }
    }

    // 2. TEACHER DEMONSTRATION TABLE & PODIUM (Z = -5.8)
    const demoStation = this.createTeacherDemoStation();
    furnitureGroup.add(demoStation);
    this.controls.addCollisionBox(-2.3, 2.3, -6.6, -5.0);

    // 3. PREPARATION ROOM FURNITURE
    const prepFurniture = this.createPreparationFurniture();
    furnitureGroup.add(prepFurniture);

    this.scene.add(furnitureGroup);
    return furnitureGroup;
  }

  createStudentTable(index, x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Dimensions: Length 2.0m (along X), Width 1.0m (along Z), Height 0.8m
    const tableLength = 2.0;
    const tableWidth = 1.0;
    const tableHeight = 0.8;
    const topThickness = 0.05;

    // Tabletop
    const topGeo = new THREE.BoxGeometry(tableLength, topThickness, tableWidth);
    const topMesh = new THREE.Mesh(topGeo, this.materials.benchTop);
    topMesh.position.y = tableHeight - topThickness / 2;
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    group.add(topMesh);

    // 4 Steel Legs
    const legRadius = 0.03;
    const legGeo = new THREE.CylinderGeometry(legRadius, legRadius, tableHeight - topThickness);
    const legPositions = [
      { lx: -tableLength / 2 + 0.08, lz: -tableWidth / 2 + 0.08 },
      { lx:  tableLength / 2 - 0.08, lz: -tableWidth / 2 + 0.08 },
      { lx: -tableLength / 2 + 0.08, lz:  tableWidth / 2 - 0.08 },
      { lx:  tableLength / 2 - 0.08, lz:  tableWidth / 2 - 0.08 }
    ];

    legPositions.forEach(p => {
      const leg = new THREE.Mesh(legGeo, this.materials.steelLeg);
      leg.position.set(p.lx, (tableHeight - topThickness) / 2, p.lz);
      leg.castShadow = true;
      group.add(leg);
    });

    // Central Integrated Utility Console (Sink + Power Box)
    // Sink at center
    const sinkGeo = new THREE.BoxGeometry(0.35, 0.15, 0.3);
    const sinkMesh = new THREE.Mesh(sinkGeo, this.materials.sink);
    sinkMesh.position.set(0, tableHeight - 0.07, 0);
    group.add(sinkMesh);

    // Gooseneck Faucet
    const faucetGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.22);
    const faucet = new THREE.Mesh(faucetGeo, this.materials.chrome);
    faucet.position.set(0, tableHeight + 0.1, 0.12);
    group.add(faucet);

    // Dual Electrical Power Console with AC/DC Outlets
    const consoleGeo = new THREE.BoxGeometry(0.4, 0.12, 0.15);
    const consoleMesh = new THREE.Mesh(consoleGeo, this.materials.powerConsole);
    consoleMesh.position.set(0, tableHeight + 0.06, -0.15);
    group.add(consoleMesh);

    // Power Indicator LED (Green glow)
    const ledGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(0.12, tableHeight + 0.08, -0.07);
    group.add(led);

    // Table Identification Badge: "MEJA #01 (5 SISWA)"
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 256;
    badgeCanvas.height = 64;
    const bctx = badgeCanvas.getContext('2d');
    bctx.fillStyle = '#0f172a';
    bctx.fillRect(0, 0, 256, 64);
    bctx.strokeStyle = '#38bdf8';
    bctx.lineWidth = 4;
    bctx.strokeRect(2, 2, 252, 60);
    bctx.fillStyle = '#38bdf8';
    bctx.font = 'bold 22px monospace';
    bctx.textAlign = 'center';
    bctx.fillText(`MEJA PRAKTIKUM #${index < 10 ? '0' + index : index}`, 128, 30);
    bctx.fillStyle = '#94a3b8';
    bctx.font = '16px sans-serif';
    bctx.fillText('KAPASITAS: 5 SISWA', 128, 52);

    const badgeTex = new THREE.CanvasTexture(badgeCanvas);
    const badgeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.45, 0.12),
      new THREE.MeshBasicMaterial({ map: badgeTex })
    );
    badgeMesh.position.set(0, tableHeight + 0.07, 0.51);
    group.add(badgeMesh);

    // 5 STOOL CHAIRS PER TABLE (For 40-50 students total)
    // 2 chairs on north side, 2 chairs on south side, 1 chair on outer end
    const stoolPositions = [
      { sx: -0.5, sz: -0.65 },
      { sx:  0.5, sz: -0.65 },
      { sx: -0.5, sz:  0.65 },
      { sx:  0.5, sz:  0.65 },
      { sx:  x > 0 ? 1.15 : -1.15, sz: 0 }
    ];

    stoolPositions.forEach(sp => {
      const stool = this.createStoolChair();
      stool.position.set(sp.sx, 0, sp.sz);
      group.add(stool);
    });

    // Tag group for raycasting & interactivity
    group.userData = {
      type: 'student_table',
      index: index,
      name: `Meja Praktikum Siswa #${index}`,
      capacity: '4–5 Siswa (Regulasi Permendikbud)',
      specs: 'Dilengkapi sink wastafel sentral, terminal stop kontak AC 220V, port catu daya DC teregulasi 0-12V, serta 5 kursi stool ergonomis.'
    };

    return group;
  }

  createStoolChair() {
    const chairGroup = new THREE.Group();
    const seatHeight = 0.52;
    const seatRadius = 0.17;

    // Circular seat top
    const seatGeo = new THREE.CylinderGeometry(seatRadius, seatRadius, 0.035, 16);
    const seatMesh = new THREE.Mesh(seatGeo, this.materials.chairSeat);
    seatMesh.position.y = seatHeight;
    seatMesh.castShadow = true;
    chairGroup.add(seatMesh);

    // Center shaft & 4 flared legs
    const shaftGeo = new THREE.CylinderGeometry(0.02, 0.02, seatHeight - 0.05);
    const shaft = new THREE.Mesh(shaftGeo, this.materials.steelLeg);
    shaft.position.y = (seatHeight - 0.05) / 2;
    chairGroup.add(shaft);

    // Base ring footrest
    const ringGeo = new THREE.TorusGeometry(0.12, 0.008, 8, 16);
    const ring = new THREE.Mesh(ringGeo, this.materials.steelLeg);
    ring.position.y = 0.2;
    ring.rotation.x = Math.PI / 2;
    chairGroup.add(ring);

    return chairGroup;
  }

  createTeacherDemoStation() {
    const group = new THREE.Group();
    group.position.set(0, 0, -5.8);

    // 1. Raised Wooden/Carpet Podium Platform (Elevasi 15cm)
    const podiumGeo = new THREE.BoxGeometry(4.6, 0.15, 2.0);
    const podiumMesh = new THREE.Mesh(
      podiumGeo,
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.2 })
    );
    podiumMesh.position.y = 0.075;
    podiumMesh.receiveShadow = true;
    group.add(podiumMesh);

    // 2. Demonstration Desk (Length 2.8m x Width 0.9m x Height 0.85m)
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.06, 0.9),
      this.materials.benchTop
    );
    deskTop.position.set(0, 0.15 + 0.85, 0);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    group.add(deskTop);

    // Desk Base / Cabinet Panels
    const baseMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.7, 0.82, 0.8),
      this.materials.cabinetWood
    );
    baseMesh.position.set(0, 0.15 + 0.41, 0);
    baseMesh.castShadow = true;
    group.add(baseMesh);

    // Teacher Laptop / Presentation Console
    const laptopGeo = new THREE.BoxGeometry(0.35, 0.02, 0.25);
    const laptop = new THREE.Mesh(laptopGeo, this.materials.powerConsole);
    laptop.position.set(-0.7, 0.15 + 0.89, 0);
    group.add(laptop);

    // Screen
    const screenGeo = new THREE.BoxGeometry(0.35, 0.22, 0.015);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(-0.7, 0.15 + 1.0, -0.12);
    group.add(screen);

    // Demo Sink & Water Tap
    const demoSink = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.35), this.materials.sink);
    demoSink.position.set(0.9, 0.15 + 0.8, 0);
    group.add(demoSink);

    const demoFaucet = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3), this.materials.chrome);
    demoFaucet.position.set(0.9, 0.15 + 1.02, 0.15);
    group.add(demoFaucet);

    // Master Power Switch Box with keylock
    const masterBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.12, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xdc2626 })
    );
    masterBox.position.set(0.2, 0.15 + 0.94, -0.2);
    group.add(masterBox);

    group.userData = {
      type: 'demo_station',
      name: 'Meja Demonstrasi Guru & Panggung Elevasi',
      capacity: 'Stasiun Guru & Instruktur',
      specs: 'Ukuran 2.8m x 0.9m di atas panggung elevasi 15cm. Menghadap seluruh siswa, dilengkapi catu daya sentral, panel audio-visual proyektor, dan wastafel demonstrasi.'
    };

    return group;
  }

  createPreparationFurniture() {
    const group = new THREE.Group();

    // 1. Preparation Desk for Laboran (X = -7.5, Z = 0)
    const prepDesk = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.8, 0.9),
      this.materials.cabinetWood
    );
    prepDesk.position.set(-7.5, 0.4, 0);
    prepDesk.castShadow = true;
    group.add(prepDesk);
    this.controls.addCollisionBox(-8.6, -6.4, -0.5, 0.5);

    // 2. 4 Locked Glass Storage Cabinets (Lemari A, B, C, D) along West Wall (X = -9.5)
    const cabinetNames = [
      { name: "Lemari A: Kit Mekanika & Dinamika", z: -1.3 },
      { name: "Lemari B: Kit Optik & Gelombang", z: -0.4 },
      { name: "Lemari C: Kit Listrik & Magnet", z: 0.5 },
      { name: "Lemari D: Kit Termofisika", z: 1.4 }
    ];

    cabinetNames.forEach(cab => {
      const cabinet = this.createStorageCabinet(cab.name);
      cabinet.position.set(-9.4, 0, cab.z);
      group.add(cabinet);
      this.controls.addCollisionBox(-9.8, -9.0, cab.z - 0.4, cab.z + 0.4);
    });

    return group;
  }

  createStorageCabinet(title) {
    const cabGroup = new THREE.Group();
    // Height 2.0m, Width 0.8m, Depth 0.5m
    const bodyGeo = new THREE.BoxGeometry(0.5, 2.0, 0.8);
    const body = new THREE.Mesh(bodyGeo, this.materials.cabinetWood);
    body.position.y = 1.0;
    body.castShadow = true;
    cabGroup.add(body);

    // Glass door on the front (+X face)
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(0.72, 1.8),
      this.materials.cabinetGlass
    );
    glass.position.set(0.26, 1.0, 0);
    glass.rotation.y = Math.PI / 2;
    cabGroup.add(glass);

    // Internal Shelves with equipment boxes inside
    for (let sy = 0.5; sy <= 1.5; sy += 0.5) {
      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.02, 0.76),
        this.materials.steelLeg
      );
      shelf.position.set(0, sy, 0);
      cabGroup.add(shelf);

      // Kit storage container box
      const boxMat = new THREE.MeshStandardMaterial({
        color: Math.random() > 0.5 ? 0x0284c7 : 0x059669,
        roughness: 0.4
      });
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.5), boxMat);
      box.position.set(0, sy + 0.1, 0);
      cabGroup.add(box);
    }

    cabGroup.userData = {
      type: 'storage_cabinet',
      name: title,
      capacity: 'Penyimpanan Tertutup & Terkunci',
      specs: 'Lemari kabinet kaca standar kementerian dengan kunci pengaman untuk mencegah kehilangan dan kerusakan komponen presisi.'
    };

    return cabGroup;
  }
}
