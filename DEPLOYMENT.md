# <div align="center">🚀 Sales Suite Deployment Guide</div>

<div align="center">

[![Deployment Guide](https://img.shields.io/badge/deployment-guide-blue.svg)](DEPLOYMENT.md)
[![Production Ready](https://img.shields.io/badge/production-ready-green.svg)](https://github.com/phoenixdev100/Sales-Suite)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](https://docker.com)

**Complete guide to deploy Sales Suite to production environments**

📅 *Last updated: January 2025*

</div>

---

## 📋 Table of Contents

- [📋 Prerequisites](#-prerequisites)
- [⚙️ Environment Setup](#️-environment-setup)
- [🗄️ Database Setup](#️-database-setup)
- [🚀 Backend Deployment](#-backend-deployment)
- [🎨 Frontend Deployment](#-frontend-deployment)
- [🔒 SSL & Security](#-ssl--security)
- [📊 Monitoring](#-monitoring)
- [🔧 Troubleshooting](#-troubleshooting)

---

## 📋 Prerequisites

<div align="center">

### 🛠️ System Requirements

</div>

- ✅ **Node.js 18+** - Runtime environment
- ✅ **PostgreSQL 14+** - Production database
- ✅ **Domain name** (optional) - For custom URLs
- ✅ **SSL certificate** (recommended) - For secure connections
- ✅ **Git** - Version control
- ✅ **PM2/Docker** (recommended) - Process management

<div align="center">

### 🌐 Recommended Hosting Platforms

| Platform | Best For | Cost |
|----------|----------|------|
| **DigitalOcean** | Small to medium apps | 💰 Low |
| **AWS** | Enterprise applications | 💰 Medium |
| **Vercel/Netlify** | Static frontend | 💰 Free tier |
| **Railway** | Full-stack apps | 💰 Free tier |

</div>

---

## ⚙️ Environment Setup

<div align="center">

### 🔧 Production Configuration

</div>

### 🔐 Backend Environment Variables

Create `backend/.env.production`:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:5432/sales_db_prod"

# JWT Security (CHANGE THESE!)
JWT_SECRET="your-super-secure-jwt-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV="production"

# CORS Settings
FRONTEND_URL="https://yourdomain.com"

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### 🎨 Frontend Environment Variables

Create `frontend/.env.production`:

```env
# API Configuration
VITE_API_URL=https://api.yourdomain.com/api

# App Settings
VITE_APP_NAME="Sales Suite"
VITE_APP_VERSION="1.0.0"
VITE_ENVIRONMENT="production"
```

<div align="center">

**🔒 Security Note:** Never commit `.env` files to version control!

</div>

---

## 🗄️ Database Setup

<div align="center">

### 📊 Production Database Configuration

</div>

### 1️⃣ Create Production Database

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create production database
CREATE DATABASE sales_db_prod;

-- Create production user
CREATE USER sales_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE sales_db_prod TO sales_user;

-- Set timezone (optional)
ALTER DATABASE sales_db_prod SET timezone = 'UTC';
```

### 2️⃣ Run Migrations

```bash
# Navigate to backend directory
cd backend

# Generate Prisma client
npx prisma generate

# Run production migrations
npx prisma migrate deploy

# Seed production database (optional)
npm run db:seed
```

### 3️⃣ Verify Database Connection

```bash
# Test database connection
npx prisma studio --port 5556
```

---

## 🚀 Backend Deployment

<div align="center">

### 🏗️ Choose Your Deployment Method

</div>

### Option 1: PM2 (Recommended) 🚀

<div align="center">

#### ⚡ Fast & Reliable Process Management

</div>

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 ecosystem file:**
   ```bash
   # In backend directory
   nano ecosystem.config.js
   ```

   ```javascript
   module.exports = {
     apps: [{
       name: 'sales-suite-api',
       script: 'server.js',
       instances: 'max',          // Use all CPU cores
       exec_mode: 'cluster',      // Enable clustering
       env: {
         NODE_ENV: 'development'
       },
       env_production: {
         NODE_ENV: 'production',
         PORT: 5000
       },
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_file: './logs/combined.log',
       time: true
     }]
   }
   ```

3. **Deploy with PM2:**
   ```bash
   # Navigate to backend
   cd backend

   # Install production dependencies
   npm ci --production

   # Start application
   pm2 start ecosystem.config.js --env production

   # Save PM2 configuration
   pm2 save

   # Enable auto-start on system boot
   pm2 startup

   # Monitor application
   pm2 monit
   ```

<div align="center">

#### 📊 PM2 Management Commands

| Command | Description |
|---------|-------------|
| `pm2 status` | Show application status |
| `pm2 logs` | View application logs |
| `pm2 restart sales-suite-api` | Restart application |
| `pm2 stop sales-suite-api` | Stop application |
| `pm2 delete sales-suite-api` | Remove application |

</div>

### Option 2: Docker 🐳

<div align="center">

#### 📦 Containerized Deployment

</div>

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine

   # Set working directory
   WORKDIR /app

   # Copy package files
   COPY package*.json ./

   # Install dependencies
   RUN npm ci --only=production

   # Copy application code
   COPY . .

   # Generate Prisma client
   RUN npx prisma generate

   # Create logs directory
   RUN mkdir -p logs

   # Expose port
   EXPOSE 5000

   # Health check
   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
     CMD node healthcheck.js

   # Start application
   CMD ["npm", "start"]
   ```

2. **Create .dockerignore:**
   ```
   node_modules
   npm-debug.log
   .git
   .env
   logs
   *.md
   .dockerignore
   ```

3. **Build and run:**
   ```bash
   # Build Docker image
   docker build -t sales-suite-api .

   # Run container
   docker run -d \
     --name sales-suite-api \
     -p 5000:5000 \
     --env-file .env.production \
     --restart unless-stopped \
     sales-suite-api

   # View logs
   docker logs -f sales-suite-api
   ```

<div align="center">

### 📈 Performance Monitoring

</div>

**Recommended tools for monitoring:**

- 📊 **PM2 Monitoring**: `pm2 monit` - Real-time dashboard
- 📝 **Application Logs**: Check `/logs` directory
- 🔍 **Database Logs**: PostgreSQL query logs
- 🏥 **Health Checks**: Implement `/api/health` endpoint

---

## 🎨 Frontend Deployment

<div align="center">

### 🌐 Static Site Deployment Options

</div>

### Option 1: Netlify/Vercel (Recommended) ⚡

<div align="center">

#### 🚀 Zero-Configuration Deployment

</div>

1. **Build the application:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

3. **Configure redirects for SPA:**
   Create `frontend/public/_redirects`:
   ```
   /*    /index.html   200
   ```

### Option 2: Nginx 🌐

<div align="center">

#### 🏗️ Traditional Web Server Setup

</div>

1. **Build the application:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Configure Nginx:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/sales-suite;
       index index.html;

       # Gzip compression
       gzip on;
       gzip_types text/css application/javascript application/json;

       # SPA fallback
       location / {
           try_files $uri $uri/ /index.html;
       }

       # API proxy
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Enable site and restart:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/sales-suite /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

<div align="center">

### 🎯 Performance Optimization

</div>

**Frontend optimization tips:**

- ✅ **Enable gzip compression**
- ✅ **Use CDN for static assets**
- ✅ **Implement lazy loading**
- ✅ **Optimize images**
- ✅ **Enable browser caching**
- ✅ **Minimize bundle size**

---

## 🔒 SSL & Security

<div align="center">

### 🔐 Let's Encrypt SSL Certificate

</div>

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain certificate:**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

3. **Auto-renewal:**
   ```bash
   sudo systemctl enable certbot.timer
   sudo systemctl start certbot.timer
   ```

<div align="center">

### 🛡️ Security Checklist

</div>

- ✅ **HTTPS in production** - Always use SSL
- ✅ **Strong JWT secrets** - Use cryptographically secure keys
- ✅ **Environment variables** - Never hardcode secrets
- ✅ **CORS restrictions** - Only allow your domain
- ✅ **Rate limiting** - Prevent abuse
- ✅ **Strong database passwords** - Use complex passwords
- ✅ **Regular updates** - Keep dependencies current
- ✅ **Firewall rules** - Restrict access
- ✅ **Database encryption** - Encrypt connections
- ✅ **Security audits** - Regular vulnerability scans

---

## 📊 Monitoring & Logging

<div align="center">

### 📈 Application Monitoring

</div>

**Backend Logging:**
- 📝 **Application logs** - Check PM2/Docker logs
- 🔍 **Error tracking** - Implement error boundaries
- 📊 **Performance monitoring** - Track response times
- 🏥 **Health checks** - Monitor `/api/health` endpoint

**Frontend Monitoring:**
- 🌐 **Real user monitoring** - Track user interactions
- 🚨 **Error tracking** - Capture JavaScript errors
- 📱 **Performance metrics** - Core Web Vitals
- 📊 **Analytics** - User behavior tracking

<div align="center">

### 🛠️ Recommended Tools

</div>

| Tool | Purpose | Setup |
|------|---------|-------|
| **PM2 Monitoring** | Process monitoring | `pm2 monit` |
| **Sentry** | Error tracking | npm package |
| **Google Analytics** | User analytics | Script tag |
| **UptimeRobot** | Uptime monitoring | Web service |
| **DataDog** | Infrastructure monitoring | Agent |

---

## 🔧 Troubleshooting

<div align="center">

### 🐛 Common Issues & Solutions

</div>

#### 1️⃣ **Database Connection Errors**
- ✅ Check `DATABASE_URL` format
- ✅ Verify PostgreSQL is running
- ✅ Check firewall rules
- ✅ Test with `psql` command

#### 2️⃣ **CORS Issues**
- ✅ Verify `FRONTEND_URL` in backend
- ✅ Check API URL in frontend
- ✅ Clear browser cache
- ✅ Check SSL certificates

#### 3️⃣ **Build Failures**
- ✅ Clear `node_modules` and reinstall
- ✅ Check Node.js version compatibility
- ✅ Verify environment variables
- ✅ Check available disk space

<div align="center">

### 📞 Getting Help

</div>

**Need assistance? Here's where to look:**

- 📚 **Documentation** - [README.md](README.md)
- 🐛 **Issues** - [GitHub Issues](https://github.com/phoenixdev100/Sales-Suite/issues)
- 💬 **Discussions** - [Community](https://github.com/phoenixdev100/Sales-Suite/discussions)
- 📧 **Contact** - Project maintainers

<div align="center">

### 📋 Log Locations

</div>

| Component | Log Location |
|-----------|--------------|
| **PM2** | `~/.pm2/logs/` |
| **Nginx** | `/var/log/nginx/` |
| **Application** | `./logs/` (if configured) |
| **System** | `/var/log/syslog` |

---

<div align="center">

## 🎉 Deployment Complete!


**Congratulations!** 🎊 Your Sales Suite application is now running in production.

</div>

**Next Steps:**
- 📊 Set up monitoring and alerting
- 🔒 Configure regular backups
- 📈 Set up analytics tracking
- 🔄 Plan for scaling
- 📝 Document deployment process

---

<div align="center">

**🚀 Ready to scale your business with Sales Suite!**

</div>

---

<div align="center">

**Built with ❤️ by [phoenixdev100](https://github.com/phoenixdev100)**

📚 **[Back to README](README.md)** • 🤝 **[Contributing](CONTRIBUTING.md)** • 🔒 **[Security](SECURITY.md)**

</div>
