# Cloud Predictor AI (IYSA 2026)

Proyek Flask + AI untuk klasifikasi awan (Cumulonimbus/Cumulus/Stratus) dan prediksi cuaca lokal.

## Struktur proyek
- `app.py`: server Flask, route `/` + `/predict`.
- `model_awan_rafi_v3.h5`: model CNN Keras.
- `templates/index.html`: UI halaman.
- `static/style.css`: styling Dark/Light, responsive.
- `static/script.js`: UI logic, file upload, camera, cropping, fetch.
- `requirements.txt`: dependensi.

## Fitur yang sudah selesai
- upload foto awan (drag-drop / file picker).
- camera capture (facing environment).
- orientation display (portrait/landscape).
- auto-crop jadi 1:1 square + preview.
- `predict` via Flask model endpoint.
- hasil prediksi + akurasi + saran cuaca.
- dark/light theme (localStorage persisten).
- reset `Coba Foto Lain`.

## Perbaikan dilakukan
- Queue fungsional dihapus (hanya 1 foto aktif), sisa CSS `.queue-*` juga sudah dibersihkan.
- file input di-reset di `click` + `change` agar tidak perlu dua kali pilih foto sama.
- tangani event drag/drop dan click terutama di `dropZone`.
- responsive mobile dan navbar toggle.

## Cara run
1. `python -m pip install -r requirements.txt`
2. `python app.py`
3. buka `http://127.0.0.1:5000`

## Catatan
- Pastikan `tensorflow` kompatibel (dari environment, ex: `python 3.11`/`tensorflow 2.21`).
- Jika error camera, cek izin browser.

---

Dibangun oleh: Muhammad Rafi Nur Setiawan - IYSA 2024
