
# TorWatch Intelligence (Real Data Deployment)

Platform intelijen siber profesional untuk analisis jaringan Tor menggunakan **DATA REAL**. 
Dokumentasi ini dikhususkan untuk deployment pada server **202.134.10.198 (torwatch.cndigital.com)**.

## Arsitektur Sistem

1.  **Frontend (React):** Dashboard UI yang akan di-serve oleh Nginx.
2.  **Backend (Node.js):** Proxy API yang berjalan di port `3001` untuk menjembatani Frontend dengan jaringan Tor.
3.  **Tor Service:** Daemon sistem yang menangani routing anonim (SOCKS5 di port `9050`).

---

## Panduan Instalasi (Copy-Paste Ready)

Masuk ke server Anda via SSH dan jalankan perintah berikut secara berurutan.

### 1. Persiapan Sistem & Instalasi Tor

Update server dan install Tor service untuk koneksi ke Darkweb.

```bash
# Update repository
sudo apt update && sudo apt upgrade -y

# Install Tor, Git, Nginx, dan build tools
sudo apt install tor git nginx build-essential -y

# Pastikan Tor berjalan
sudo systemctl enable tor
sudo systemctl start tor
```

**Verifikasi Konfigurasi Tor:**
Pastikan Tor membuka port SOCKS5 standar. Cek konfigurasi default:
```bash
# Cek apakah port 9050 terbuka
sudo netstat -tuln | grep 9050
# Output harusnya: tcp 127.0.0.1:9050 ...
```

### 2. Instalasi Node.js & PM2

Backend membutuhkan Node.js versi terbaru.

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 untuk manajemen proses background
sudo npm install -g pm2
```

### 3. Setup Aplikasi TorWatch

Kita akan setup folder aplikasi di `/var/www/torwatch`.

```bash
# Buat direktori dan masuk (Sesuaikan URL git jika perlu, atau upload file manual)
sudo mkdir -p /var/www/torwatch
sudo chown -R $USER:$USER /var/www/torwatch
# [Upload file project Anda ke folder ini menggunakan SCP atau Git Clone]
# Contoh jika menggunakan git:
# git clone [REPO_URL] /var/www/torwatch
cd /var/www/torwatch
```

#### A. Setup Backend (API Proxy)

```bash
cd server
# Install dependencies
npm install

# Jalankan Backend dengan PM2
pm2 start index.js --name "torwatch-api"

# Pastikan berjalan otomatis saat restart server
pm2 save
pm2 startup
```
*Backend sekarang berjalan di `http://localhost:3001` dan terhubung ke Tor Proxy lokal.*

#### B. Setup Frontend (Build React)

Kembali ke folder root project.

```bash
cd ..
# Install dependencies frontend
npm install

# Buat file Environment (Opsional: Masukkan API Key Google Gemini jika ada)
echo "API_KEY=your_gemini_api_key_here" > .env

# Build aplikasi React untuk production
npm run build
```
*Hasil build akan berada di folder `/var/www/torwatch/dist`.*

### 4. Konfigurasi Nginx (Domain & IP)

Ini adalah konfigurasi khusus untuk **torwatch.cndigital.com**.

Buat file konfigurasi Nginx baru:
```bash
sudo nano /etc/nginx/sites-available/torwatch
```

**Copy & Paste konfigurasi berikut:**

```nginx
server {
    listen 80;
    server_name torwatch.cndigital.com 202.134.10.198;

    # Lokasi hasil build React
    root /var/www/torwatch/dist;
    index index.html;

    # Logging
    access_log /var/log/nginx/torwatch_access.log;
    error_log /var/log/nginx/torwatch_error.log;

    # Frontend Routing (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy (Forward ke Node.js)
    # Penting: Mengarahkan request /api/... ke localhost:3001
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Aktifkan Konfigurasi:**

```bash
# Buat symbolic link
sudo ln -s /etc/nginx/sites-available/torwatch /etc/nginx/sites-enabled/

# Hapus default config jika ada
sudo rm /etc/nginx/sites-enabled/default

# Cek error syntax
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 5. Setup Firewall (UFW)

Pastikan port HTTP/HTTPS terbuka.

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### 6. (Opsional) Setup SSL/HTTPS dengan Certbot

Disarankan agar aplikasi aman dan fitur browser (seperti clipboard/mic) berjalan lancar.

```bash
sudo apt install python3-certbot-nginx -y
sudo certbot --nginx -d torwatch.cndigital.com
```

---

## Verifikasi Deployment

1.  Buka browser dan akses: `http://torwatch.cndigital.com` atau `http://202.134.10.198`.
2.  Login ke aplikasi.
3.  Masuk ke menu **Deep Search** atau **Crawler**.
4.  Coba lakukan pencarian keyword (misal: "market").
5.  Jika muncul log *"Connected to Backend Proxy"*, berarti koneksi **Nginx -> Node.js -> Tor Service** berhasil.

