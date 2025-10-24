# <div align="center">🤝 Contributing to Sales Suite</div>

<div align="center">

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)
[![Issues Open](https://img.shields.io/badge/issues-open-blue.svg?style=flat)](https://github.com/phoenixdev100/Sales-Suite/issues)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Code of Conduct](https://img.shields.io/badge/code%20of-conduct-ff69b4.svg)](CODE_OF_CONDUCT.md)

**Thank you for your interest in contributing to Sales Suite!** 🌟
We welcome contributions from the community and are pleased to have you join us.

</div>

---

## 📋 Table of Contents

- [📜 Code of Conduct](#-code-of-conduct)
- [🚀 Getting Started](#-getting-started)
- [💡 How to Contribute](#-how-to-contribute)
- [⚙️ Development Setup](#️-development-setup)
- [🔄 Pull Request Process](#-pull-request-process)
- [📏 Coding Standards](#-coding-standards)
- [🐛 Reporting Issues](#-reporting-issues)
- [📞 Getting Help](#-getting-help)

---

## 📜 Code of Conduct

<div align="center">

This project and everyone participating in it is governed by our [📋 Code of Conduct](CODE_OF_CONDUCT.md).

By participating, you are expected to uphold this code. Let's create a welcoming and inclusive community together! 💝

</div>

---

## 🚀 Getting Started

<div align="center">

### 📝 Step-by-Step Guide

</div>

1. **🍴 Fork the repository** on GitHub
2. **📥 Clone your fork** locally
   ```bash
   git clone https://github.com/phoenixdev100/Sales-Suite.git
   cd Sales-Suite
   ```
3. **⚙️ Set up the development environment** (see [Development Setup](#️-development-setup))
4. **🌿 Create a new branch** for your feature or bug fix
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-issue
   ```
5. **✨ Make your changes** and test them thoroughly
6. **📤 Submit a pull request** following our guidelines

---

## 💡 How to Contribute

<div align="center">

### 🐛 Found a Bug?
### 💭 Have an Idea?
### 💻 Want to Code?

We welcome all types of contributions! Here's how:

</div>

### 🔍 Reporting Bugs

<div align="center">

**Before creating bug reports, please check the existing [issues](https://github.com/phoenixdev100/Sales-Suite/issues) to avoid duplicates.**

</div>

When creating a bug report, please include:

- ✅ **Clear and descriptive title**
- ✅ **Exact steps to reproduce** the problem
- ✅ **Expected vs actual behavior**
- ✅ **Screenshots** if applicable
- ✅ **Environment details** (OS, Node.js version, browser, etc.)
- ✅ **Error logs** if available

**💡 Tip:** Use our [🐛 Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) for consistent formatting!

### 💭 Suggesting Enhancements

<div align="center">

**Enhancement suggestions are always welcome!** 🎉

</div>

Please provide:

- ✅ **Clear and descriptive title**
- ✅ **Detailed description** of the enhancement
- ✅ **Explanation** of why this would be useful
- ✅ **Mockups or examples** if applicable
- ✅ **User story** format when possible

**💡 Tip:** Use our [✨ Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md)!

### 💻 Contributing Code

<div align="center">

**Ready to write some code?** Here's the process:

</div>

1. **🎯 Choose an issue** - Look for labels like `good first issue` or `help wanted`
2. **💬 Comment on the issue** - Let others know you're working on it
3. **🌿 Fork and create a branch** - Use descriptive names
4. **✨ Make your changes** - Follow our [coding standards](#-coding-standards)
5. **🧪 Test thoroughly** - Ensure all tests pass and add new ones if needed
6. **📤 Submit a pull request** - Use our [PR template](.github/pull_request_template.md)

---

## ⚙️ Development Setup

<div align="center">

### 📋 Prerequisites

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat&logo=postgresql)
![npm](https://img.shields.io/badge/npm-9+-CB3837?style=flat&logo=npm)

</div>

### 🚀 Installation Steps

<div align="center">

#### 1️⃣ Clone & Install

</div>

```bash
# Clone your fork
git clone https://github.com/phoenixdev100/Sales-Suite.git
cd Sales-Suite

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2️⃣ Environment Configuration

```bash
# Backend setup
cd backend
cp .env.example .env
# Edit .env with your database configuration

# Frontend setup (if needed)
cd ../frontend
cp .env.example .env
```

#### 3️⃣ Database Setup

```bash
cd backend
npx prisma migrate dev
npm run db:seed
```

#### 4️⃣ Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

<div align="center">

🌐 **Application URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

</div>

---

## 🔄 Pull Request Process

<div align="center">

### 📝 Before Submitting

</div>

1. **📚 Update documentation** - Ensure any new features are documented
2. **🧪 Add tests** - Include tests for new functionality
3. **📋 Update CHANGELOG.md** - Add your changes to the unreleased section
4. **✅ Ensure CI passes** - All tests and linting must pass
5. **👀 Request review** - Tag relevant maintainers for review
6. **🔄 Address feedback** - Make requested changes promptly

<div align="center">

### 📝 PR Title Format

Use **conventional commit** format:

</div>

```bash
feat: add user profile management
fix: resolve inventory calculation bug
docs: update API documentation
style: improve dashboard layout
refactor: optimize database queries
test: add unit tests for sales module
```

---

## 📏 Coding Standards

<div align="center">

### 💻 JavaScript/React Guidelines

</div>

- ✅ **ES6+ features** - Use modern JavaScript syntax
- ✅ **ESLint configuration** - Follow our linting rules
- ✅ **Functional components** - Use React hooks when possible
- ✅ **Descriptive names** - Clear variable and function names
- ✅ **JSDoc comments** - Document complex functions

### 🎨 CSS/Styling Guidelines

- ✅ **Tailwind CSS** - Use utility-first approach
- ✅ **Mobile-first** - Responsive design principles
- ✅ **Consistent spacing** - Maintain visual harmony
- ✅ **Semantic classes** - Clear custom CSS naming

### 🗄️ Database Guidelines

- ✅ **Descriptive names** - Clear table and column names
- ✅ **Prisma conventions** - Follow ORM best practices
- ✅ **Proper indexing** - Optimize for performance
- ✅ **Reversible migrations** - Safe database changes

### 🔌 API Guidelines

- ✅ **RESTful conventions** - Standard HTTP methods
- ✅ **Proper status codes** - Meaningful HTTP responses
- ✅ **Error handling** - Comprehensive error management
- ✅ **Input validation** - Secure data handling
- ✅ **Clear documentation** - Well-documented endpoints

---

## 🧪 Testing

<div align="center">

### 🏃‍♂️ Running Tests

</div>

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# End-to-end tests
npm run test:e2e
```

<div align="center">

### 📝 Writing Tests

</div>

- ✅ **Unit tests** for all new functions
- ✅ **Integration tests** for API endpoints
- ✅ **Component tests** for React components
- ✅ **Good coverage** - Aim for >80% test coverage
- ✅ **Clear descriptions** - Test names should explain intent

---

## 📚 Documentation

<div align="center">

### 📖 What to Document

</div>

- ✅ **README.md** - Update for significant changes
- ✅ **JSDoc comments** - Add to new functions
- ✅ **API docs** - Update for endpoint changes
- ✅ **Examples** - Include usage examples

---

## 📞 Getting Help

<div align="center">

### 🤔 Need Assistance?

</div>

- 🔍 **Check existing [issues](https://github.com/phoenixdev100/Sales-Suite/issues)**
- 💬 **Join our [discussions](https://github.com/phoenixdev100/Sales-Suite/discussions)**
- 📖 **Read the [documentation](README.md)**
- 📧 **Contact maintainers** for questions

<div align="center">

### 🎯 Quick Links

| Resource | Link |
|----------|------|
| 🐛 **Issues** | [GitHub Issues](https://github.com/phoenixdev100/Sales-Suite/issues) |
| 💬 **Discussions** | [GitHub Discussions](https://github.com/phoenixdev100/Sales-Suite/discussions) |
| 📚 **Wiki** | [Project Wiki](https://github.com/phoenixdev100/Sales-Suite/wiki) |
| 📖 **Documentation** | [README.md](README.md) |

</div>

---

## 🏆 Recognition

<div align="center">

### 🌟 Contributors Will Be Recognized In:

</div>

- 📋 **CHANGELOG.md** - Each release notes
- 👥 **README.md** - Contributors section
- ⭐ **GitHub** - Repository contributors
- ❤️ **Community** - Recognition and thanks

<div align="center">

**Thank you for contributing to Sales Suite!** 🎉

Your efforts help make this project better for everyone. Every contribution, no matter how small, is valuable and appreciated!

</div>

---

<div align="center">

**Built with ❤️ by phoenixdev100**

[![Contributors](https://img.shields.io/github/contributors/phoenixdev100/Sales-Suite.svg?style=flat)](https://github.com/phoenixdev100/Sales-Suite/graphs/contributors)
[![Last Commit](https://img.shields.io/github/last-commit/phoenixdev100/Sales-Suite.svg?style=flat)](https://github.com/phoenixdev100/Sales-Suite/commits)

</div>
