# 🔐 DataFort — Zero-Trust Personal Data Vault

<p align="center">
  <img src="https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20Prisma-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Encryption-AES--256--GCM-green?style=for-the-badge" />
</p>

> **DataFort** is a Zero-Trust personal data vault designed to securely store documents, credentials, and sensitive information using end-to-end encryption, access controls, and privacy-first security principles.

---

## ✨ Features

| Category | Feature |
|----------|---------|
| 🛡️ Security | AES-256-GCM end-to-end encryption (client-side) |
| 🔑 Auth | JWT-based authentication + bcrypt password hashing |
| 🗄️ Vault | Multiple named vaults per user |
| 🔐 Credentials | Encrypted username/password/notes storage |
| 📄 Documents | Encrypted file upload/download |
| 📋 Audit | Full access log for every sensitive action |
| 🚦 Zero Trust | Every request re-verified — no implicit trust |
| 🐳 Docker | PostgreSQL + server via Docker Compose |

---

## 🏗️ Architecture

```
DataFort/
├── client/          # React + Vite (frontend)
├── server/          # Node.js + Express + Prisma (backend)
├── .github/         # GitHub Actions CI
├── docker-compose.yml
├── .env.example
└── README.md
```

### Security Model

- **Zero-Knowledge**: The server **never** sees plaintext data. All encryption/decryption happens in the browser using the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).
- **Zero-Trust**: Every API request requires a valid, unexpired JWT. No session-based trust.
- **Key Derivation**: Master password → PBKDF2 → Encryption key (never stored on server).
- **AES-256-GCM**: All credentials and documents encrypted with unique IVs.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or Docker)
- npm or pnpm

### 1. Clone

```bash
git clone https://github.com/Abhi-0888/DataFort.git
cd DataFort
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Database (Docker)

```bash
docker-compose up -d db
```

### 4. Backend

```bash
cd server
npm install
npx prisma migrate dev --name init
npm run dev
```

### 5. Frontend

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🔌 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/vault` | List all vaults |
| POST | `/api/vault` | Create a new vault |
| GET | `/api/credentials/:vaultId` | List credentials in vault |
| POST | `/api/credentials` | Add encrypted credential |
| POST | `/api/documents/upload` | Upload encrypted document |
| GET | `/api/documents/:id/download` | Download & decrypt document |
| GET | `/api/audit` | View audit log |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite**
- **React Router DOM** — routing
- **TanStack Query** — data fetching & caching
- **Zustand** — lightweight state management
- **Framer Motion** — animations
- **Lucide React** — icons
- **React Hook Form** + **Zod** — form validation
- **Web Crypto API** — client-side AES-256-GCM encryption

### Backend
- **Node.js** + **Express**
- **Prisma ORM** — type-safe DB queries
- **PostgreSQL** — primary database
- **bcryptjs** — password hashing
- **jsonwebtoken** — JWT auth
- **multer** — file uploads
- **helmet** — HTTP security headers
- **express-rate-limit** — rate limiting

---

## 📊 Database Schema

```
User ──< Vault ──< Credential
                └──< Document
User ──< AuditLog
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT © [Abhi-0888](https://github.com/Abhi-0888)
