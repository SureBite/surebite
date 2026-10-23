# 🍽️ SureBite

> **AI Infers. Humans Verify. Diners Stay Safe.**

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green.svg)](https://www.mongodb.com/)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933.svg)](https://nodejs.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-4285F4.svg)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg)](https://tailwindcss.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

**SureBite** is an intelligent, full-stack allergy and dietary safety platform designed for restaurants and diners. It bridges the critical safety gap in modern dining by converting paper menus into interactive, allergen-filtered digital menus. 

Using **Google Gemini Multimodal AI**, SureBite scans menu photos, transcribes dishes, and identifies allergens and dietary types. To safeguard diner health, SureBite employs a strict **human-in-the-loop verification workflow**: AI results must be reviewed and confirmed by restaurant staff before a digital menu can ever be published. Diners can then scan a dynamic table QR code to explore dishes safely tailored to their personal dietary needs.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [The SureBite Safety Philosophy](#-the-surebite-safety-philosophy)
- [Canonical Allergens & Dietary Types](#-canonical-allergens--dietary-types)
- [System Architecture & Tech Stack](#-system-architecture--tech-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Zero-Backend Mock Mode](#-zero-backend-mock-mode)
- [Deployment](#-deployment)
- [License](#-license)

---

## ✨ Key Features

### 🏢 For Restaurant Managers
- **Multi-Image Menu Ingestion**: Upload high-resolution scans, multi-page menus, or take photos directly with mobile/tablet cameras.
- **Multimodal AI OCR & Inference**: Automatically extracts dish names, descriptions, categories, prices, and canonical allergens via Google Gemini.
- **Interactive Verification Studio**: Inspect extracted items side-by-side with original menu photos using a built-in zoomable image inspector.
- **Enforced Safety Verification**: Menus cannot be published until every dish is manually reviewed and approved.
- **Dynamic QR Code Generation**: Download high-resolution PNG or SVG QR codes formatted for table tents and print collateral.
- **Secure Manager Accounts**: Email OTP verification, JWT-based session security, and self-serve password recovery.

### 🥗 For Diners & Guests
- **Zero-App Instant Access**: Diners simply scan the QR code to open the restaurant's live web menu on any mobile browser.
- **Interactive Allergen Exclusion**: Filter out single or multiple allergens (e.g., dairy, gluten, peanuts, shellfish) in real-time.
- **Dietary Preference Filtering**: Switch seamlessly between Vegetarian, Non-Vegetarian, and Eggetarian options.
- **Smart Search & Categories**: Quickly find dishes by keywords, dietary flags, or course categories.
- **Transparent Kitchen Disclaimers**: Upfront notices about kitchen cross-contact and allergen handling protocols.

---

## 🛡️ The SureBite Safety Philosophy

Commercial kitchens are high-stakes environments where an undetected allergen can trigger life-threatening anaphylaxis. SureBite enforces strict safety rules throughout its pipeline:

1. **AI is an Assistant, Not an Authority**: Every allergen flagged by Google Gemini is labeled as **"AI Inferred"** until a human manager marks it verified.
2. **Mandatory 100% Verification**: The "Publish" action is strictly disabled until every dish in the menu has been reviewed.
3. **Dirty-State Invalidation**: Any subsequent edits to a dish's ingredients, title, or allergens immediately reset its status to `isVerified: false`.
4. **Never "100% Allergen-Free"**: The public diner menu prominently displays commercial kitchen cross-contact disclaimers rather than falsely promising complete allergen absence.

---

## 🌾 Canonical Allergens & Dietary Types

SureBite standardizes allergen detection against **14 major canonical allergens** recognized internationally (FDA & EU FIC Annex II):

| Allergen | Key Sources |
|---|---|
| 🥛 **Dairy** | Milk, butter, cheese, cream, ghee, whey |
| 🌾 **Gluten** | Wheat, barley, rye, bread, pasta, flour |
| 🥚 **Eggs** | Whole eggs, egg wash, mayonnaise, meringue |
| 🥜 **Peanuts** | Peanuts, peanut butter, peanut oil |
| 🌰 **Tree Nuts** | Almonds, walnuts, cashews, pistachios, hazelnuts |
| 🌱 **Soy** | Tofu, edamame, soy sauce, miso |
| 🐟 **Fish** | Salmon, tuna, cod, fish sauce |
| 🦐 **Shellfish** | Prawns, shrimp, crab, lobster |
| 🥯 **Sesame** | Sesame seeds, tahini, sesame oil |
| 🌭 **Mustard** | Mustard seeds, prepared mustard, dressings |
| 🥬 **Celery** | Celery stalks, leaves, seeds, celeriac |
| 🌸 **Lupin** | Lupin flour, lupin seeds |
| 🦪 **Molluscs** | Clams, mussels, oysters, squid, octopus |
| 🍷 **Sulfites** | Wine, dried fruits, preservatives |

### Dietary Classifications
- 🟢 **Veg** (Vegetarian)
- 🔴 **Non-Veg** (Meat, poultry, seafood)
- 🟡 **Egg** (Eggetarian / contains eggs)

---

## 🏗️ System Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Tier                           │
│  React 18 + Vite + Tailwind CSS + Lucide Icons + React Router│
└──────────────┬───────────────────────────────▲──────────────┘
               │ HTTP / JSON API               │ Dynamic Web Menu
               ▼                               │ (/m/:slug)
┌─────────────────────────────────────────────────────────────┐
│                       Server Tier                           │
│     Node.js + Express 5 (ES Modules) + Zod + JWT Auth       │
└───────┬──────────────────────┬──────────────────────┬───────┘
        │                      │                      │
        ▼                      ▼                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   MongoDB    │       │Google Gemini │       │  Cloudinary  │
│  (Mongoose)  │       │  Vision AI   │       │ Image Media  │
└──────────────┘       └──────────────┘       └──────────────┘
```

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router v6, QRCode.
- **Backend**: Node.js, Express (ESM), Mongoose, Zod, Multer, Helmet, CORS, Morgan.
- **Artificial Intelligence**: Google Generative AI (`@google/generative-ai`) via Gemini Flash models.
- **Media & Cloud Storage**: Cloudinary for uploaded physical menu images.
- **Mailing & Communication**: Nodemailer (Gmail SMTP) for 6-digit OTP delivery and password resets.
- **Database**: MongoDB (Atlas or local instance).

---

## 📁 Repository Structure

```text
SureBite/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers (auth, menus, diner)
│   │   ├── middlewares/      # JWT authentication, file upload (Multer)
│   │   ├── models/           # Mongoose schemas (User, Menu, Otp)
│   │   ├── routes/           # API endpoints (/auth, /menus, /diner)
│   │   ├── services/         # Gemini AI extraction & Nodemailer email services
│   │   ├── utils/            # Cloudinary uploader, validators, constants
│   │   ├── app.js            # Express application setup & middleware
│   │   └── server.js         # HTTP server entry point & MongoDB connection
│   ├── .env.example          # Sample backend environment variables
│   └── package.json
│
├── frontend/
│   ├── public/               # Static assets & icons
│   ├── src/
│   │   ├── api/              # Axios HTTP client & mock API client
│   │   ├── components/       # UI elements (Navbar, FilterBar, DishCard, ImageInspector)
│   │   ├── context/          # AuthContext for global user state
│   │   ├── hooks/            # Custom hooks (useAuth, useMenus, useMenuFilter)
│   │   ├── pages/            # View pages (Home, Auth, Dashboard, Upload, Verify, DinerMenu, QrCode)
│   │   ├── utils/            # Constants, formatting, and validation helpers
│   │   ├── App.jsx           # Routing & layout configuration
│   │   └── main.jsx          # React app entry point
│   ├── .env.example          # Sample frontend environment variables
│   ├── vercel.json           # Vercel deployment rewrite rules
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/) (v9.x or later)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas URI)
- [Google Gemini API Key](https://aistudio.google.com/)
- [Cloudinary Account](https://cloudinary.com/) (Cloud Name, API Key, API Secret)

---

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create and configure your environment file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MongoDB URI, Gemini API key, Cloudinary keys, and SMTP credentials.

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:5000` (or your configured `PORT`).

---

### 2. Frontend Setup

1. Open a second terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Create your local environment configuration:
   ```bash
   cp .env.example .env
   ```
   Configure the API target and mock flag:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_USE_MOCK=false
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Port for the Express server | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/surebite` |
| `JWT_SECRET` | Secret key used to sign JWT tokens | `your_super_secret_jwt_key` |
| `CLIENT_URL` | Allowed origin for CORS | `http://localhost:5173` |
| `GEMINI_API_KEY` | Google Gemini AI API key | `AIzaSy...` |
| `EMAIL_USER` | Gmail address for sending OTP emails | `restaurant@gmail.com` |
| `EMAIL_PASS` | Gmail App Password (16 characters) | `abcd efgh ijkl mnop` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud identifier | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API access key | `123456789012345` |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret | `abcdef123456...` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend REST API | `http://localhost:5000/api` |
| `VITE_USE_MOCK` | Enable standalone demo mode via `localStorage` | `false` |

---

## 📡 API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new manager account & trigger OTP.
- `POST /api/auth/verify-otp` — Confirm 6-digit OTP and activate account.
- `POST /api/auth/resend-otp` — Resend verification OTP code.
- `POST /api/auth/login` — Sign in with email and password (returns JWT & user data).
- `POST /api/auth/logout` — Clear auth cookie / sign out.
- `GET /api/auth/me` — Retrieve the currently authenticated user profile.
- `POST /api/auth/forgot-password` — Send a password reset email token.
- `POST /api/auth/reset-password/:token` — Set a new password using reset token.

### Menu Management (`/api/menus`) *(Requires Bearer Token)*
- `GET /api/menus` — List all menus owned by the logged-in manager.
- `POST /api/menus/upload` — Upload menu image(s) (`multipart/form-data`) & trigger Gemini AI parsing.
- `GET /api/menus/:id` — Fetch menu details and item list for verification.
- `PUT /api/menus/:id` — Update menu title, currency, and dish items.
- `PATCH /api/menus/:id/publish` — Publish menu and generate public diner slug (requires 100% verified dishes).
- `GET /api/menus/:id/qr` — Generate QR code data URLs (PNG & SVG) for the published menu.
- `DELETE /api/menus/:id` — Delete a menu and its associated assets.

### Diner Access (`/api/diner`) *(Public)*
- `GET /api/diner/:slug` — Retrieve public verified menu data for diner browsing.
- `POST /api/diner/:slug/scan` — Increment and record table scan metrics.

### System
- `GET /api/health` — Health check endpoint.

---

## 🧪 Zero-Backend Mock Mode

Need to demonstrate the user interface or test UI components without running MongoDB, Gemini, or Cloudinary? 

1. In `frontend/.env`, set:
   ```env
   VITE_USE_MOCK=true
   ```
2. Restart the frontend (`npm run dev`).
3. Use the built-in demo credentials:
   - **Email:** `ananya@saffrontable.in`
   - **Password:** `saffron123`
4. The mock mode stores state in your browser's `localStorage` (`surebite_mock_db`), simulating upload extraction, verification workflows, and QR generation offline.

---

## 🌐 Deployment

### Frontend (Vercel)
The repository includes `frontend/vercel.json` configured with SPA fallback rewrites.
1. Connect your GitHub repository to [Vercel](https://vercel.com/).
2. Set the **Root Directory** to `frontend`.
3. Set the Environment Variables:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://surebite-api.onrender.com/api`)
   - `VITE_USE_MOCK`: `false`
4. Deploy!

### Backend (Render / Railway / Cloud Host)
1. Set the **Root Directory** to `backend`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Configure all environment variables from `.env.example` in your cloud host settings.
5. Ensure your MongoDB Atlas cluster allows incoming connections from your backend IP.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
