const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const fileNameDisplay = document.getElementById('fileName');
const predictBtn = document.getElementById('predictBtn');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview = document.getElementById('imagePreview');
const uploadIcon = document.querySelector('.upload-icon');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const themeToggle = document.getElementById('themeToggle');
const navItems = document.querySelectorAll('.nav-link');

const resultCard = document.getElementById('result');
const loadingContainer = document.getElementById('loading');
const messageBox = document.getElementById('messageBox');
const resetBtn = document.getElementById('resetBtn');
const startCameraBtn = document.getElementById('startCameraBtn');
const stopCameraBtn = document.getElementById('stopCameraBtn');
const captureBtn = document.getElementById('captureBtn');
const cameraVideo = document.getElementById('cameraVideo');

let cameraStream = null;
let selectedFiles = [];
let currentFileIndex = 0;

// NIGHT MODE
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cloudai_theme', theme);
    const icon = themeToggle.querySelector('i');
    if (theme === 'light') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

function loadTheme() {
    const saved = localStorage.getItem('cloudai_theme') || 'dark';
    setTheme(saved);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
});

loadTheme();

// NAV TOGGLE MOBILE
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});

function setOrientationStatus() {
    let orientation = 'Unknown';
    if (window.screen && window.screen.orientation && window.screen.orientation.type) {
        orientation = window.screen.orientation.type.includes('landscape') ? 'Landscape' : 'Portrait';
    } else if (typeof window.orientation !== 'undefined') {
        orientation = (window.orientation === 90 || window.orientation === -90) ? 'Landscape' : 'Portrait';
    }
    const status = document.getElementById('orientationStatus');
    if (status) status.innerText = `Orientasi perangkat: ${orientation}`;
}

window.addEventListener('orientationchange', setOrientationStatus);
window.addEventListener('deviceorientation', () => setOrientationStatus());

function highlightMenuOnScroll() {
    const sections = document.querySelectorAll('section');
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (!link) return;
        if (scrollPos >= top && scrollPos < bottom) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

window.addEventListener('scroll', highlightMenuOnScroll);
window.addEventListener('DOMContentLoaded', () => {
    highlightMenuOnScroll();
    setOrientationStatus();
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.click();
});

startCameraBtn.addEventListener('click', startCamera);
stopCameraBtn.addEventListener('click', stopCamera);
captureBtn.addEventListener('click', capturePhoto);

async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showMessage('Fitur kamera tidak didukung di perangkat ini. Gunakan upload gambar saja.', 'error');
        return;
    }

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        cameraVideo.srcObject = cameraStream;
        cameraVideo.style.display = 'block';
        stopCameraBtn.style.display = 'inline-flex';
        captureBtn.style.display = 'inline-flex';
        startCameraBtn.style.display = 'none';
        cameraVideo.play();
        showMessage('Kamera menyala. Ambil foto setelah siap.', 'info');
    } catch (error) {
        console.error(error);
        showMessage('Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan.', 'error');
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    cameraVideo.srcObject = null;
    cameraVideo.style.display = 'none';
    stopCameraBtn.style.display = 'none';
    captureBtn.style.display = 'none';
    startCameraBtn.style.display = 'inline-flex';
    showMessage('Kamera dimatikan.', 'info');
}

function capturePhoto() {
    if (!cameraVideo.srcObject) {
        showMessage('Kamera belum aktif.', 'error');
        return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/jpeg');

    fetch(dataURL)
        .then(res => res.blob())
        .then(blob => {
            const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
            handleFiles([file]);
            stopCamera();
        });
}

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length === 0) {
        showMessage('Gunakan file gambar yang valid (JPG/PNG).', 'error');
        return;
    }
    fileInput.files = e.dataTransfer.files;
    handleFiles(files);
});

fileInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        fileInput.click();
    }
});

// EVENT: Saat Foto Dipilih
fileInput.addEventListener('change', function() {
    if (!this.files || this.files.length === 0) return;
    handleFiles(Array.from(this.files));
    this.value = '';
});

function handleFiles(files) {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
        showMessage('Tidak ada file gambar yang valid.', 'error');
        return;
    }

    selectedFiles = validFiles.map((file) => ({ file, processedFile: null, name: file.name }));
    currentFileIndex = 0;

    // tidak lagi menggunakan list antrean; hanya proses file pertama untuk kemudahan
    if (selectedFiles.length > 1) {
        showMessage(`${selectedFiles.length} foto dipilih; hanya foto pertama yang diproses saat ini.`, 'info');
    }

    showCurrentFile();
    predictBtn.disabled = false;
    resetBtn.style.display = 'inline-flex';
    showMessage('Foto siap diproses (1:1 crop + auto-level).', 'success');
}

function getCroppedSquareFile(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const minSide = Math.min(img.width, img.height);
            const sx = (img.width - minSide) / 2;
            const sy = (img.height - minSide) / 2;
            const canvas = document.createElement('canvas');
            canvas.width = minSide;
            canvas.height = minSide;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, minSide, minSide);
            canvas.toBlob(blob => {
                const croppedFile = new File([blob], file.name, { type: 'image/jpeg' });
                callback(croppedFile, canvas.toDataURL('image/jpeg'));
            }, 'image/jpeg', 0.95);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function showCurrentFile() {
    const item = selectedFiles[currentFileIndex];
    if (!item) return;
    fileNameDisplay.innerText = `(${currentFileIndex+1}/${selectedFiles.length}) ${item.name}`;
    const expireCallback = (cropped) => {
        item.processedFile = cropped;
    };
    getCroppedSquareFile(item.file, (croppedFile, croppedDataURL) => {
        item.processedFile = croppedFile;
        imagePreview.src = croppedDataURL;
        imagePreviewContainer.style.display = 'block';
        uploadIcon.style.display = 'none';
        imagePreview.classList.add('preview-blur');
        setTimeout(() => imagePreview.classList.remove('preview-blur'), 1100);
    });
    document.getElementById('result').style.display = 'none';
    messageBox.style.display = 'none';
}

function showMessage(message, type = 'info') {
    const messageBox = document.getElementById('messageBox');
    messageBox.innerText = message;
    messageBox.className = `message-box ${type}`;
    messageBox.style.display = 'block';
}

function resetApp() {
    selectedFiles = [];
    currentFileIndex = 0;
    fileInput.value = '';
    fileNameDisplay.innerText = 'Klik atau Tarik Foto Awan di Sini';
    imagePreviewContainer.style.display = 'none';
    imagePreview.src = '';
    uploadIcon.style.display = 'block';
    predictBtn.disabled = true;
    resultCard.style.display = 'none';
    loadingContainer.style.display = 'none';
    messageBox.style.display = 'none';
    resetBtn.style.display = 'none';
}

function getPredictionAdvice(prediksi) {
    const normalized = prediksi.toLowerCase();
    if (normalized.includes('hujan')) return 'Bawalah payung dan hindari area genangan air.';
    if (normalized.includes('mendung')) return 'Siapkan jaket ringan, kemungkinan kondisi basah masih mungkin.';
    if (normalized.includes('cerah')) return 'Sempurna untuk aktivitas luar ruangan, tetap hidrasi.';
    return 'Pantau kondisi cuaca secara berkala untuk memastikan ketepatan prediksi.';
}

function getAccuracyColor(score) {
    if (score >= 90) return '#16a34a';
    if (score >= 75) return '#ea580c';
    return '#dc2626';
}

// FUNGSI: Mengirim Gambar ke AI (Flask)
async function uploadImage() {
    const item = selectedFiles[currentFileIndex];
    if (!item) {
        showMessage('Tidak ada file untuk diprediksi.', 'error');
        return;
    }

    const targetFile = item.processedFile || item.file;
    const formData = new FormData();
    formData.append('file', targetFile);

    // Persiapan Tampilan Loading
    resultCard.style.display = 'none';
    loadingContainer.style.display = 'block';
    predictBtn.disabled = true;

    try {
        const response = await fetch('/predict', { 
            method: 'POST', 
            body: formData 
        });

        if (!response.ok) {
            const issue = await response.text();
            throw new Error(`Server error: ${response.status} - ${issue}`);
        }

        const data = await response.json();

        // Menyembunyikan Loading, Tampilkan Hasil
        loadingContainer.style.display = 'none';
        resultCard.style.display = 'block';
        predictBtn.disabled = false;

        // Memasukkan Data ke HTML
        document.getElementById('cloudType').innerText = data.awan;
        document.getElementById('accuracy').innerText = data.akurasi + "%";
        document.getElementById('prediction').innerText = data.prediksi;

        const adviceText = getPredictionAdvice(data.prediksi);
        document.getElementById('predictionAdvice').innerText = adviceText;

        // ANIMASI: Progress Bar Akurasi
        const accuracyFill = document.getElementById('accuracyFill');
        const accuracyPercentage = parseFloat(data.akurasi);
        accuracyFill.style.width = '0%'; // Reset dulu
        accuracyFill.style.background = getAccuracyColor(accuracyPercentage);
        setTimeout(() => {
            accuracyFill.style.width = accuracyPercentage + '%';
        }, 100);

        showMessage('Prediksi berhasil. Lihat hasil di bawah.', 'success');

    } catch (error) {
        console.error(error);
        showMessage('Terjadi kesalahan sistem. Pastikan app.py aktif dan jaringan tersambung.', 'error');
        loadingContainer.style.display = 'none';
        predictBtn.disabled = false;
    }
}

// Sistem antrean dihapus sehingga nextImage tidak dibutuhkan.

resetBtn.addEventListener('click', resetApp);
