# 🔒 Cipher Drop - Secure File Sharing

A zero-knowledge secure file sharing platform with end-to-end encryption. Your files are encrypted in your browser before uploading - the server never sees your data.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase)

## ✨ Features

- 🔐 **End-to-End Encryption** - AES-256-GCM encryption in browser
- 🚫 **Zero-Knowledge** - Server never sees unencrypted files or keys
- 🔑 **Password Protection** - Optional password for extra security
- ⏰ **Expiring Links** - Set custom expiry (1-30 days or never)
- 📊 **Download Limits** - Control how many times a file can be downloaded
- 🌓 **Dark/Light Mode** - Beautiful cosmic-themed UI
- 📱 **Responsive** - Works on desktop and mobile
- 🔗 **Google Sign-In** - Quick authentication with Firebase Auth

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Backend | Node.js, Express.js |
| Database | Firebase Firestore |
| File Storage | Firebase Cloud Storage |
| Auth | Firebase Authentication (Email/Password + Google) |
| Encryption | Web Crypto API (AES-256-GCM) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase Project (with Firestore, Storage, and Auth enabled)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd secure-file-sharing1
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install

   # Backend
   cd backend
   npm install
   ```

3. **Configure environment variables**

   **Frontend** (`.env.local`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

   **Backend** (`backend/.env`):
   ```env
   PORT=5000
   NODE_ENV=development
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
   MAX_FILE_SIZE=104857600
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

4. **Download Firebase Service Account Key**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `backend/serviceAccountKey.json`

5. **Run the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   npm run dev
   ```

6. **Open the app**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
secure-file-sharing1/
├── src/                    # Frontend React app
│   ├── components/         # Reusable UI components
│   ├── config/             # Firebase client configuration
│   ├── pages/              # Page components
│   ├── context/            # React contexts (Auth, Theme)
│   ├── services/           # API client
│   ├── utils/              # Crypto utilities
│   └── layouts/            # Layout components
├── backend/                # Express.js API
│   ├── config/             # Firebase Admin & Storage config
│   ├── controllers/        # Route handlers
│   ├── middleware/          # Auth (Firebase tokens), rate limiting
│   ├── models/             # Firestore data models
│   ├── services/           # Business logic
│   └── routes/             # API routes
└── public/                 # Static assets
```

## 🔒 Security Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Server    │────▶│  Firebase    │
│  (Encrypt)  │     │ (No Access) │     │  (Storage)   │
└─────────────┘     └─────────────┘     └─────────────┘
     │                                        │
     │         Encrypted data only            │
     └────────────────────────────────────────┘
```

1. Files are encrypted client-side using AES-256-GCM
2. Encryption key is generated per-file
3. For password-protected files, the key is encrypted with PBKDF2
4. Server only stores encrypted blobs and never sees plaintext

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/firebase` | Authenticate with Firebase token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/files/upload` | Upload encrypted file |
| GET | `/api/files` | List user's files |
| GET | `/api/files/stats` | Get user stats |
| GET | `/api/files/:id` | Get file metadata |
| GET | `/api/files/:id/download` | Download encrypted file |
| DELETE | `/api/files/:id` | Delete file |
| POST | `/api/shares` | Create share link |
| GET | `/api/shares` | List share links |
| GET | `/api/shares/:token` | Get shared file metadata |
| GET | `/api/shares/:token/download` | Download via share link |
| DELETE | `/api/shares/:id` | Revoke share link |

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com) - Database, auth, and storage
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Lucide Icons](https://lucide.dev) - Icons
