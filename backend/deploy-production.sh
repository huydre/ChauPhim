#!/bin/bash

# ChauPhim VOD Backend - Production Setup Script
# This script automates the production deployment on Ubuntu 20.04+ LTS

set -e

echo "🚀 ChauPhim VOD Backend - Production Setup"
echo "=========================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root" 
   exit 1
fi

# Configuration
APP_DIR="/var/www/chauphim-backend"
DB_NAME="vod_app"
DB_USER="vod_user"
DOMAIN=""
EMAIL=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    --email)
      EMAIL="$2"
      shift 2
      ;;
    --db-password)
      DB_PASSWORD="$2"
      shift 2
      ;;
    *)
      echo "Unknown option $1"
      echo "Usage: $0 --domain yourdomain.com --email your@email.com --db-password your_password"
      exit 1
      ;;
  esac
done

# Validate required parameters
if [[ -z "$DOMAIN" || -z "$EMAIL" || -z "$DB_PASSWORD" ]]; then
    echo "❌ Missing required parameters"
    echo "Usage: $0 --domain yourdomain.com --email your@email.com --db-password your_password"
    exit 1
fi

echo "📋 Configuration:"
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"
echo "   App Directory: $APP_DIR"
echo "   Database: $DB_NAME"
echo ""

read -p "Continue with production setup? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelled"
    exit 1
fi

echo "🔄 Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo "📦 Installing Node.js 18 LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "📦 Installing system dependencies..."
sudo apt install -y mysql-server redis-server nginx certbot python3-certbot-nginx ufw

echo "🔒 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "📦 Installing PM2..."
sudo npm install -g pm2

echo "🗄️ Configuring MySQL..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
sudo mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

echo "🔧 Configuring Redis..."
sudo systemctl enable redis-server
sudo systemctl start redis-server

echo "📁 Setting up application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

echo "📥 Cloning application..."
if [[ -d "$APP_DIR/.git" ]]; then
    echo "   Repository already exists, pulling latest changes..."
    cd $APP_DIR
    git pull
else
    echo "   Please provide the Git repository URL:"
    read -p "Repository URL: " REPO_URL
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

echo "📦 Installing application dependencies..."
npm install
npm run build

echo "⚙️ Configuring environment..."
if [[ ! -f ".env" ]]; then
    cp .env.example .env
    
    # Update environment file
    sed -i "s|NODE_ENV=development|NODE_ENV=production|g" .env
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME|g" .env
    sed -i "s|CORS_ORIGINS=.*|CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN|g" .env
    
    echo "🔑 Generated random JWT secrets..."
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env
    sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|g" .env
    
    echo "⚠️  Please review and update .env file with your specific configuration"
fi

echo "🗄️ Running database migrations..."
npm run db:deploy

echo "🌱 Seeding database..."
npm run db:seed

echo "📝 Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'chauphim-backend',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/chauphim-backend-error.log',
    out_file: '/var/log/pm2/chauphim-backend-out.log',
    log_file: '/var/log/pm2/chauphim-backend-combined.log',
    time: true,
    max_memory_restart: '500M',
    node_args: '--max-old-space-size=460'
  }]
};
EOF

echo "🚀 Starting application with PM2..."
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/chauphim-backend > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://localhost:3000/health;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/chauphim-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "🔒 Setting up SSL certificate..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive --redirect

echo "⏰ Setting up auto-renewal for SSL..."
(sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -

echo "🏥 Setting up health monitoring..."
cat > /tmp/health-check.sh << 'EOF'
#!/bin/bash
HEALTH_URL="http://localhost:3000/health"
if ! curl -f $HEALTH_URL > /dev/null 2>&1; then
    echo "Health check failed, restarting application..."
    pm2 restart chauphim-backend
fi
EOF

sudo mv /tmp/health-check.sh /usr/local/bin/health-check.sh
sudo chmod +x /usr/local/bin/health-check.sh
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/health-check.sh") | crontab -

echo ""
echo "✅ Production setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Review and update .env file: $APP_DIR/.env"
echo "   2. Configure external services (Redis, S3, SMTP)"
echo "   3. Set up monitoring and backups"
echo "   4. Test the application: https://$DOMAIN/health"
echo ""
echo "📊 Useful commands:"
echo "   pm2 status                 # Check application status"
echo "   pm2 logs chauphim-backend  # View application logs"
echo "   pm2 restart chauphim-backend # Restart application"
echo "   sudo nginx -t              # Test Nginx configuration"
echo "   sudo certbot renew --dry-run # Test SSL renewal"
echo ""
echo "🎉 Your ChauPhim VOD Backend is now running at: https://$DOMAIN"
