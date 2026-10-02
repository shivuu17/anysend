# Anysend 🚀

### Cross-Platform Local File Transfer Application (P2P Wi-Fi & Hotspot)

**LocalDrop** is a production-oriented, zero-cloud file transfer application inspired by AirDrop and LocalSend. It enables seamless, high-speed transfers of photos, 4K videos, documents, ZIP archives, and multi-gigabyte files between **iPhone, Android, Windows, macOS, and Linux** devices directly over your local network.

---

## 🌟 Key Features

* **Zero Cloud Dependency**: Transfers occur directly over local IPv4 LAN or mobile hotspot. No AWS S3, Supabase, or external uploads.
* **Web-First Architecture**: Open LocalDrop in your browser on iPhone or Android without installing native store apps.
* **Streaming & Chunking Engine**: 4 MB chunked HTTP streaming handles 100 MB, 1 GB, or 50 GB files without RAM buffering or memory crashes.
* **SHA-256 Integrity Verification**: Incremental browser calculation (`js-sha256`) and server-side stream verification ensure 100% bit-exact accuracy.
* **QR-Based Device Pairing**: Receiver generates a secure QR code payload with session token and expiration timestamp.
* **Real-Time Control Signaling**: Socket.IO events handle device registration, transfer requests (Accept/Reject), live speed (MB/s), ETA calculations, and progress updates.
* **Filename & Path Sanitization**: Strips dangerous characters and path traversal tokens (`../`) while resolving unique file collision paths (e.g. `file (1).mp4`).
* **AirDrop & Linear Inspired Aesthetic**: Modern minimalist UI built with React, Tailwind CSS, Lucide icons, and responsive mobile-first layouts.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, React Router v6, Socket.IO Client, Axios, `qrcode.react`, `html5-qrcode`, `js-sha256`.
* **Backend**: Node.js, Express.js, Socket.IO, Multer, Node.js Streams, Crypto module (`crypto.createHash('sha256')`), `uuid`, `dotenv`.
* **Networking**: HTTP over TCP (binary file chunks), WebSockets (control signaling), `os.networkInterfaces()` local IPv4 detection.

---

## 📂 Project Architecture

```
localdrop/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Common/        # Card, Button, ProgressBar, Modal, Badge
│   │   │   ├── Layout/        # Navbar, Sidebar, MobileNav, Layout
│   │   │   ├── Send/          # Dropzone, FileList, QRScannerModal, ManualConnectModal, SendingProgress
│   │   │   ├── Receive/       # QRCodeCard, IncomingRequestModal, ReceivingProgress
│   │   │   └── Settings/      # SettingsForm
│   │   ├── context/           # SocketContext, TransferContext, SettingsContext
│   │   ├── pages/             # Home, SendPage, ReceivePage, TransfersPage, SettingsPage, AboutPage
│   │   ├── services/          # api.js, fileChunker.js, cryptoService.js
│   │   └── utils/             # formatters.js, network.js
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/            # constants.js
│   │   ├── controllers/       # deviceController, sessionController, transferController
│   │   ├── middleware/        # errorHandler.js
│   │   ├── routes/            # apiRoutes.js
│   │   ├── services/          # fileService, sessionService, transferService
│   │   ├── sockets/           # socketHandler.js
│   │   ├── storage/           # metadataStore.js
│   │   ├── utils/             # network.js, crypto.js, sanitize.js, logger.js
│   │   └── server.js
│   ├── uploads/               # Stored transfers & temp chunks
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

---

### Step 1: Install Dependencies

```bash
# 1. Install server dependencies
cd server
npm install

# 2. Install client dependencies
cd ../client
npm install
```

---

### Step 2: Configure Environment Variables

Create `.env` in the `server` directory (optional defaults are already provided):

```env
PORT=5000
DEVICE_NAME=LocalDrop Host
UPLOAD_DIR=./uploads
AUTO_ACCEPT=false
MAX_CONCURRENT_TRANSFERS=5
```

---

### Step 3: Run Application

#### Option A: Development Mode (Concurrent Server & Client)

```bash
# Terminal 1: Start Node.js Backend Server
cd server
npm run dev

# Terminal 2: Start Vite Client Dev Server
cd client
npm run dev
```

* **Backend Server**: Runs on `http://<your-local-ip>:5000`
* **Frontend Web App**: Accessible at `http://localhost:3000` or `http://<your-local-ip>:3000`

#### Option B: Production Single-Port Serving

Build the frontend bundle to `client/dist`. The Node.js server will automatically host both the REST API, WebSocket signaling, and static React application on **port 5000**.

```bash
# Build client static bundle
cd client
npm run build

# Start production server
cd ../server
npm start
```

Open `http://<your-local-ip>:5000` from any phone, laptop, or tablet on your network.

---

## 📱 How to Use (Two-Device Transfer Flow)

1. **Start Receiver**:
   * Open LocalDrop on the host computer or phone.
   * Go to **Receive Mode** page.
   * A QR code and local IP address (e.g., `http://192.168.1.15:5000`) will be displayed.

2. **Connect Sender**:
   * On your mobile phone (iPhone or Android) connected to the same Wi-Fi or hotspot, open the browser and go to `http://192.168.1.15:5000` (or `http://192.168.1.15:3000` in dev).
   * Navigate to **Send Files**.
   * Drag and drop or browse photos, videos, or files.
   * Click **Scan QR Code** to scan the receiver's screen, or click **Manual IP Address** and enter `192.168.1.15`.

3. **Approve & Transfer**:
   * Click **Start File Transfer**.
   * The receiver screen will pop up an **Incoming File Transfer Request** modal with sender device details and file list.
   * Click **Accept & Receive**.
   * Live streaming progress, transfer speed (MB/s), and ETA will update on both devices.
   * Once finalized, SHA-256 integrity verification completes, and files are available under **Transfers** history.

---

## 🔒 Security & Verification Specifications

1. **No Cloud Exposure**: All payloads are sent directly over local HTTP chunk streams (`POST /api/transfer/:id/chunk`).
2. **Session Expiry**: QR tokens expire after 15 minutes to prevent unauthorized reuse.
3. **Path Traversal Protection**: Filenames undergo strict sanitization using `path.basename` and regex stripping of OS control characters.
4. **Collision Prevention**: Duplicate filenames are appended with numerical suffixes `(1)`, `(2)` to prevent overwrites.
5. **SHA-256 Checksums**: Both sender and receiver calculate independent SHA-256 digests over the raw binary content. If a checksum mismatch occurs due to network corruption, the temporary `.part` file is deleted and marked failed.

---

## ⚠️ Known Browser & Operating System Considerations

* **Local Network Reachability**: Ensure both devices are connected to the same Wi-Fi router or hotspot. Some public or corporate Wi-Fi networks enable **Client Isolation** (AP Isolation), which prevents devices on the same subnet from communicating. Use a mobile hotspot if AP isolation is active.
* **Camera Access for QR Scanning**: iOS Safari and Android Chrome require explicit camera permission when clicking **Scan QR Code**. If camera access is denied, use the **Manual IP Address** fallback option.
* **Browser Server Limitation**: A browser running on iOS/Android cannot run an unrestricted native listening TCP server. LocalDrop addresses this by hosting the Node.js process on a host machine, making it accessible to mobile browsers on the LAN.
