# <div align="center">🚀 Sales Suite</div>

<div align="center">

A comprehensive sales and inventory management suite for modern businesses with role-based access control.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-brightgreen.svg)
![React](https://img.shields.io/badge/react-18-blue.svg)

---

📊 **Complete Sales & Inventory Management**

🔐 **Role-Based Access Control** 

📱 **Responsive Design**

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [📄 License](#-license)
- [🤝 Contributing](#-contributing)
- [🔒 Security](#-security)

---

## ✨ Features

<div align="center">

### 🏠 Dashboard & Analytics
📊 Real-time overview with interactive charts and performance metrics

### 📦 Product Management
🛍️ Complete CRUD operations with category management and stock tracking

### 💰 Sales Processing
🛒 Point-of-sale interface with transaction recording and customer management

### 📈 Reports & Analytics
📋 Export detailed reports in CSV/PDF with advanced filtering options

### 🚨 Smart Alerts
⚠️ Automated low-stock notifications and inventory monitoring

### 👥 User Management
🔐 Multi-role system with Admin, Manager, and Salesperson permissions

### 🔐 Security
🛡️ JWT authentication with secure password hashing and input validation

</div>

---

<div align="center">

## 🛠️ Tech Stack

</div>

<div align="center">

### 🎨 Frontend

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.5-38B2AC?style=flat&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-4.5.0-646CFF?style=flat&logo=vite)

</div>

- ⚡ React 18 with Vite for fast development
- 🎨 Tailwind CSS for modern, responsive styling
- 📊 Recharts for beautiful data visualizations
- 🎯 Lucide React for consistent iconography
- 📱 Fully responsive design for all devices

<div align="center">

### 🚀 Backend

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18.2-000000?style=flat&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5.6.0-2D3748?style=flat&logo=prisma)

</div>

- 🟢 Node.js with Express for robust API development
- 🐘 PostgreSQL for reliable data storage
- 🔄 Prisma ORM for type-safe database operations
- 🔐 JWT authentication with bcrypt password hashing
- ✅ Joi validation for secure input handling


---

## 📁 Project Structure

```
sales-suite/
├── 📁 backend/           # Express API server
│   ├── 📄 server.js     # Main application entry point
│   ├── 📁 routes/       # API route handlers
│   ├── 📁 middleware/   # Authentication & validation
│   ├── 📁 prisma/       # Database schema & migrations
│   └── 📄 package.json  # Backend dependencies
├── 🎨 frontend/         # React application
│   ├── 📄 index.html    # Main HTML template
│   ├── 📁 src/          # Source code
│   ├── 📁 public/       # Static assets
│   └── 📄 package.json  # Frontend dependencies
├── 📚 docs/             # Documentation files
│   ├── 📋 DEPLOYMENT.md # Deployment guide
│   ├── 🤝 CONTRIBUTING.md # Contribution guidelines
│   └── 🔒 SECURITY.md   # Security policy
└── 🛠️ scripts/          # Setup and utility scripts
```

---

## 🚀 Getting Started

<div align="center">

### 📋 Prerequisites

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat&logo=postgresql)
![npm](https://img.shields.io/badge/npm-9+-CB3837?style=flat&logo=npm)

</div>

### ⚡ Quick Installation

1. **📥 Clone the repository**
   ```bash
   git clone https://github.com/phoenixdev100/Sales-Suite.git
   cd Sales-Suite
   ```

2. **🔧 Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database configuration
   npx prisma migrate dev
   npm run db:seed
   npm run dev
   ```

3. **🎨 Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **🌐 Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

<div align="center">

### 🔑 Default Admin Credentials

| Role | Email | Password |
|------|-------|----------|
| 🔴 Admin | admin@example.com | admin123 |
| 🟡 Manager | manager@example.com | manager123 |
| 🟢 Salesperson | sales@example.com | sales123 |

</div>

---

## ⚙️ Environment Variables

<div align="center">

### 🔧 Backend Configuration

</div>

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sales_db"

# JWT Security
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server Settings
PORT=5000
NODE_ENV="development"

# CORS Configuration
FRONTEND_URL="http://localhost:5173"
```

<div align="center">

### 🎨 Frontend Configuration

</div>

```env
# API Connection
VITE_API_URL=http://localhost:5000/api

# App Settings
VITE_APP_NAME="Sales Suite"
VITE_APP_VERSION="1.0.0"
```

</div>

---

<div align="center">

## 📄 License

</div>

<div align="center">

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

</div>

---

<div align="center">

## 🤝 Contributing • 🔒 Security • 📚 Documentation

**Sales Suite** is an open-source project that welcomes community contributions!

</div>

- 📖 **[Contributing Guide](CONTRIBUTING.md)** - Learn how to contribute
- 🔒 **[Security Policy](SECURITY.md)** - Report security vulnerabilities
- 📋 **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community guidelines
- 🔄 **[Changelog](CHANGELOG.md)** - Version history and updates

---

<div align="center">

**Built with ❤️ by [phoenixdev100](https://github.com/phoenixdev100)**

⭐ Star this repository if you find it helpful!

[![GitHub stars](https://img.shields.io/github/stars/phoenixdev100/Sales-Suite.svg?style=social&label=Star)](https://github.com/phoenixdev100/Sales-Suite)
[![GitHub forks](https://img.shields.io/github/forks/phoenixdev100/Sales-Suite.svg?style=social&label=Fork)](https://github.com/phoenixdev100/Sales-Suite)

</div>