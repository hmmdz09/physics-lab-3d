/**
 * Standar Sarana & Prasarana Laboratorium Fisika SMA/MA/SMK
 * Berdasarkan Regulasi Kementerian Pendidikan:
 * 1. Permendikbud No. 24 Tahun 2007 (Standar Sarana dan Prasarana SMA/MA)
 * 2. Permendikbudristek No. 22 Tahun 2023 (Standar Sarana dan Prasarana PAUD, Dikdas, dan Dikmen)
 */

export const LAB_REGULATIONS = {
  meta: {
    regulationName: "Permendikbud No. 24/2007 & Permendikbudristek No. 22/2023",
    facilityType: "Laboratorium Fisika SMA / SMK / MA",
    cohortCapacity: "40 - 50 Peserta Didik",
    complianceScore: 100,
    status: "Terpenuhi Sempurna (100% Compliant)"
  },
  
  dimensions: {
    ratioPerStudent: "2.4 m² / peserta didik",
    minimumStudentCapacity: 40,
    maximumStudentCapacity: 50,
    
    mainLab: {
      length: 15.0, // meter
      width: 8.0,   // meter
      height: 3.8,  // meter
      area: 120.0,  // m² (Memenuhi syarat 50 x 2.4 = 120 m², min lebar 8m)
      complianceNote: "Memenuhi rasio 2.4 m² x 50 siswa = 120 m² dengan lebar ruang 8 meter (standar kementerian mensyaratkan lebar min 8m)."
    },
    
    preparationRoom: {
      length: 6.0,  // meter
      width: 4.0,   // meter
      height: 3.8,  // meter
      area: 24.0,   // m² (Standar kementerian mensyaratkan min 18 m²)
      complianceNote: "Luas 24 m² melebihi batas minimum 18 m² untuk ruang persiapan & gudang alat tertutup."
    },
    
    totalArea: 144.0 // 120 m² + 24 m²
  },

  furnitureSpecs: [
    {
      id: "student_tables",
      name: "Meja Praktikum Peserta Didik (Island Type)",
      standardQuantity: "1 buah / 4-5 peserta didik (10 unit untuk 50 siswa)",
      currentQuantity: 10,
      spec: "Ukuran 2.2m x 1.1m x 0.8m. Permukaan anti-asam, tahan panas, dan tahan getaran. Dilengkapi stop kontak ganda & wastafel tanam.",
      status: "PASS",
      points: 10
    },
    {
      id: "student_chairs",
      name: "Kursi Praktikum (Stool Lab)",
      standardQuantity: "1 buah / peserta didik (50 unit)",
      currentQuantity: 50,
      spec: "Kursi stool kokoh tanpa sandaran / putar ketinggian 50-65cm, memudahkan mobilitas kerja kelompok.",
      status: "PASS",
      points: 10
    },
    {
      id: "demo_table",
      name: "Meja Demonstrasi Guru & Panggung",
      standardQuantity: "1 unit di depan kelas menghadap siswa",
      currentQuantity: 1,
      spec: "Ukuran 2.8m x 1.0m x 0.9m di atas panggung elevasi 15cm. Dilengkapi instalasi listrik master, gas/air, dan proyektor presentasi.",
      status: "PASS",
      points: 10
    },
    {
      id: "prep_table",
      name: "Meja Persiapan Guru / Laboran",
      standardQuantity: "1 unit di ruang persiapan",
      currentQuantity: 1,
      spec: "Meja kerja persiapan eksperimen lengkap dengan laci instrumen dan buku inventaris alat.",
      status: "PASS",
      points: 10
    },
    {
      id: "tool_cabinets",
      name: "Lemari Alat & Bahan Terkunci",
      standardQuantity: "Minimal 3 unit lemari berkaca dengan kunci",
      currentQuantity: 4,
      spec: "Lemari kayu jati/besi berlapis kaca tebal untuk Kit Mekanika, Kit Optik, Kit Listrik, dan Kit Termodinamika.",
      status: "PASS",
      points: 10
    },
    {
      id: "sinks",
      name: "Bak Cuci (Wastafel) & Saluran Air Bersih",
      standardQuantity: "Tersedia di setiap meja praktikum / perimeter",
      currentQuantity: 11, // 10 di meja siswa + 1 di meja demo
      spec: "Bak porselen/stainless anti-korosi dengan keran leher angsa dan saluran pembuangan lancar.",
      status: "PASS",
      points: 10
    }
  ],

  safetySpecs: [
    {
      id: "apar",
      name: "Alat Pemadam Api Ringan (APAR)",
      standardQuantity: "Minimal 1 unit per 100 m² (disediakan 2 unit)",
      currentQuantity: 2,
      spec: "Jenis ABC Dry Chemical Powder (6 kg) & CO₂ ditempatkan di dekat pintu keluar laboratorium.",
      status: "PASS",
      points: 10
    },
    {
      id: "p3k",
      name: "Kotak P3K & Panduan Tanggap Darurat",
      standardQuantity: "1 unit di dinding dekat pintu/meja persiapan",
      currentQuantity: 1,
      spec: "Berisi perban steril, larutan antiseptik, plester luka bakar, larutan saline pencuci, dan buku SOP P3K.",
      status: "PASS",
      points: 10
    },
    {
      id: "eyewash",
      name: "Emergency Eye Wash Station",
      standardQuantity: "1 unit pancuran bilas mata darurat",
      currentQuantity: 1,
      spec: "Pancuran bilas mata ganda dengan tuas cepat untuk penanganan darurat cipratan bahan/debu berbahaya.",
      status: "PASS",
      points: 10
    },
    {
      id: "emergency_stop",
      name: "Master Emergency Power Cut-off (E-Stop)",
      standardQuantity: "1 saklar sentral utama di dinding depan",
      currentQuantity: 1,
      spec: "Tombol jamur merah (*mushroom emergency switch*) pemutus daya seketika seluruh stop kontak meja siswa.",
      status: "PASS",
      points: 10
    },
    {
      id: "emergency_doors",
      name: "Pintu Evakuasi Darurat Keluar (Outward Swing)",
      standardQuantity: "Pintu ganda membuka ke arah luar koridor",
      currentQuantity: 2,
      spec: "Lebar bukaan $\\ge$ 1.6m dengan daun pintu membuka ke luar sesuai standar evakuasi kebakaran Kemendikbud.",
      status: "PASS",
      points: 10
    },
    {
      id: "ventilation",
      name: "Ventilasi Udara & Pencahayaan Alami",
      standardQuantity: "Luas jendela $\\ge$ 20% luas lantai + Exhaust Fan",
      currentQuantity: "10 Jendela Besar + 4 Exhaust Fan Mekanik",
      spec: "Pencahayaan alami merata tanpa silau langsung dan sirkulasi udara kontinu untuk kenyamanan 50 siswa.",
      status: "PASS",
      points: 10
    }
  ],

  physicsKits: [
    {
      id: "mechanics_kit",
      station: "Meja Siswa 1 - 3 & Lemari A",
      name: "Kit Percobaan Mekanika",
      items: [
        "Rel Presisi Dinamika (Precision Track) & Kereta Bergerak",
        "Pencatat Waktu Ketik (Ticker Timer) & Pita Kertas",
        "Neraca Teknis Ohaus 3 Lengan & Neraca Digital Presisi",
        "Jangka Sorong (Vernier Caliper) 0.05 mm & Mikrometer Sekrup 0.01 mm",
        "Statif, Balok Gesek, Katrol Tunggal/Ganda, dan Beban Bercelah"
      ],
      experiments: ["Hukum II Newton", "Gerak Lurus Beraturan (GLB & GLBB)", "Koefisien Gesek Statis & Kinetis", "Hukum Kekekalan Momentum"]
    },
    {
      id: "optics_kit",
      station: "Meja Siswa 4 - 6 & Lemari B",
      name: "Kit Percobaan Optik & Gelombang",
      items: [
        "Bangku Optik Presisi 1.5 Meter dengan Skala Milimeter",
        "Sumber Sinar Diode Laser Merah (650 nm) & Laser Hijau (532 nm)",
        "Set Lensa Cembung/Cekung, Prisma Kaca Segitiga, Balok Kaca Planparalel",
        "Kisi Difraksi (100, 300, 600 garis/mm) & Layar Tangkap",
        "Garpu Tala Beresonansi & Tabung Resonansi Bunyi Kundt"
      ],
      experiments: ["Hukum Pembiasan Snellius", "Penentuan Jarak Fokus Lensa", "Difraksi & Interferensi Cahaya", "Cepat Rambat Bunyi di Udara"]
    },
    {
      id: "electricity_kit",
      station: "Meja Siswa 7 - 8 & Lemari C",
      name: "Kit Percobaan Listrik & Magnet",
      items: [
        "Osiloskop Digital Dual Channel 50 MHz dengan Generator Fungsi",
        "Catu Daya Variabel DC 0-12V Teregulasi & Sumber Tegangan AC",
        "Multimeter Digital Auto-ranging & Galvanometer Sensitif",
        "Resistor Variabel (Hambatan Geser / Rheostat) & Papan Rangkaian",
        "Solenoida, Magnet Batang Alnico, dan Kompas Perunut Medan"
      ],
      experiments: ["Hukum Ohm & Hambatan Jenis Kawat", "Rangkaian Resistor Seri & Paralel", "Induksi Elektromagnetik Faraday", "Karakteristik Gelombang AC pada Osiloskop"]
    },
    {
      id: "thermodynamics_kit",
      station: "Meja Siswa 9 - 10 & Lemari D",
      name: "Kit Percobaan Termofisika",
      items: [
        "Kalorimeter Joule Bertutup Isolator dengan Pengaduk",
        "Termometer Digital Probe Suhu Cepat & Termometer Raksa/Alkohol",
        "Bejana Pemanas Air Listrik Aman & Stopwatch Presisi",
        "Set Silinder Logam Spesifik (Tembaga, Aluminium, Kuningan, Besi)",
        "Aparatus Muai Panjang Logam (Dilatometer)"
      ],
      experiments: ["Asas Black & Penentuan Kalor Jenis Logam", "Tara Kalor Mekanik Joule", "Koefisien Muai Panjang Berbagai Logam"]
    }
  ]
};
