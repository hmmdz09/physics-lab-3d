# 🔬 Laboratorium Fisika Sekolah 3D Modern (Standar Kemendikbudristek RI)

[![Three.js](https://img.shields.io/badge/Three.js-r165-0284c7.svg)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff.svg)](https://vitejs.dev/)
[![Permendikbud](https://img.shields.io/badge/Permendikbud-No.%2024%2F2007-10b981.svg)](#)
[![Kapasitas](https://img.shields.io/badge/Kapasitas-40--50%20Siswa-f59e0b.svg)](#)

Aplikasi web eksplorasi 3D interaktif modern untuk **Laboratorium Fisika Sekolah (SMA/SMK/MA)** berkapasitas **40–50 peserta didik**, dirancang presisi sesuai regulasi **Permendikbud No. 24 Tahun 2007** dan **Permendikbudristek No. 22 Tahun 2023** tentang Standar Sarana dan Prasarana Laboratorium IPA/Fisika.

---

## 🏛️ Ketentuan Sarana & Prasarana Kementerian

- **Rasio Luas Lantai**: $2{,}4\text{ m}^2$ per peserta didik.
- **Ruang Praktikum Utama**: $15\text{ m} \times 8\text{ m} = \mathbf{120\text{ m}^2}$ (Memenuhi syarat untuk 50 siswa, lebar ruang $8\text{ m}$).
- **Ruang Persiapan & Gudang Alat**: $6\text{ m} \times 4\text{ m} = \mathbf{24\text{ m}^2}$ (Standar kementerian minimum $18\text{ m}^2$).
- **Total Luas Bangunan**: **$144\text{ m}^2$**.
- **10 Meja Praktikum Siswa (Island Type)**: Masing-masing untuk 4–5 siswa ($10 \times 5 = 50\text{ siswa}$) lengkap dengan wastafel *stainless* sentral dan stop kontak ganda AC 220V + catu daya DC aman (0–12V).
- **50 Kursi Praktikum (Stool Lab)**: Fleksibel tanpa sandaran untuk kenyamanan kerja eksperimen kelompok.
- **Meja Demonstrasi Guru**: Ukuran $2{,}8\text{ m}$ di atas panggung elevasi $15\text{ cm}$ menghadap seluruh meja siswa.
- **Standar K3 Wajib**:
  - 2 Unit APAR ABC Dry Chemical Powder 6kg dekat pintu darurat.
  - Kotak P3K standar lengkap dengan SOP medis.
  - *Emergency Eye Wash Station* (Pancuran bilas mata darurat).
  - *Master Emergency Power Cut-off* (Saklar tombol jamur pemutus daya 10 meja siswa seketika).
  - Pintu ganda dengan sistem *outward-swinging* (membuka ke arah luar).
  - 6 Jendela besar aluminium (pencahayaan alami $\ge 20\%$ luas lantai) + *exhaust fan*.

---

## 🎮 Fitur Jelajah 3D Interaktif

1. **First-Person Walk Controller**:
   - `W, A, S, D` atau tombol arah untuk jalan kaki.
   - Mouse look 360° untuk melihat sekeliling.
   - Deteksi tabrakan (*collision boundary*) lorong dan meja lab.
   - `Shift` untuk lari cepat (*sprint*).
   - Efek suara langkah kaki prosedural (Web Audio API).
2. **Orbit / Inspector View**:
   - Kamera layang bebas untuk menginspeksi denah arsitektur $144\text{ m}^2$ dan zonasi lab.
3. **Radar Minimap 2D Live**:
   - Menampilkan koordinat meter ($X, Z$), tata letak meja, dan kerucut arah pandang pemain (*view cone*).
4. **Dock Teleportasi Instan**:
   - Loncat seketika ke Meja Guru, Meja Siswa 1–5, Meja Siswa 6–10, Stasiun Osiloskop, Bangku Optik, Ruang Persiapan, atau Titik K3.
5. **Simulator Peralatan Fisika**:
   - **Osiloskop Digital Dual Channel**: Layar CRT gelombang dinamis dengan pengaturan frekuensi, amplitudo, bentuk gelombang (Sinus, Kotak, Segitiga), dan audio synthesizer.
   - **Bangku Optik Laser & Prisma**: Sinar laser merah terbias melalui prisma kaca menghasilkan spektrum dispersi dan kalkulator interaktif Hukum Snellius.
   - **Rel Dinamika Presisi & Ticker Timer**: Demonstrasi Hukum II Newton ($F = m \cdot a$).
   - **Kalorimeter Joule**: Eksperimen Asas Black dan penentuan kalor jenis logam.
   - **Tombol Darurat E-Stop**: Simulasi drill keselamatan kerja K3.

---

## 🛠️ Instalasi & Menjalankan

```bash
# Clone repositori
git clone https://github.com/hmmdz09/physics-lab-3d.git

# Masuk ke direktori
cd physics-lab-3d

# Install dependensi
npm install

# Jalankan server lokal
npm run dev
```

Buka browser di `http://localhost:5173/`.

---

## 📜 Lisensi
MIT License © 2026. Dikembangkan untuk simulasi standar sarana prasarana pendidikan fisika.
