# 🚀 Nginx Deployment Guide for Trading Dry-Run Robot

## 📋 Prerequisites

- Ubuntu/Debian server (or similar Linux distribution)
- Root or sudo access
- Domain name (optional, can use IP address)

## 🔧 Step 1: Install Nginx

```bash
# Update package list
sudo apt update

# Install nginx
sudo apt install nginx

# Start and enable nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check nginx status
sudo systemctl status nginx
```

## 📁 Step 2: Create Project Directory Structure

```bash
# Create project directory
sudo mkdir -p /var/www/trading-robot

# Create subdirectories
sudo mkdir -p /var/www/trading-robot/html
sudo mkdir -p /var/www/trading-robot/logs
sudo mkdir -p /var/www/trading-robot/ssl

# Set proper ownership
sudo chown -R www-data:www-data /var/www/trading-robot
sudo chmod -R 755 /var/www/trading-robot
```

## 📝 Step 3: Create the HTML File

Save your trading robot HTML file as `/var/www/trading-robot/html/index.html`:

```bash
# Create the HTML file
sudo nano /var/www/trading-robot/html/index.html
```

Copy and paste the complete HTML content from the trading robot artifact into this file.

## ⚙️ Step 4: Nginx Configuration

### Basic Configuration

Create nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/trading-robot
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Replace with your domain or server IP
    
    root /var/www/trading-robot/html;
    index index.html index.htm;
    
    # Logging
    access_log /var/www/trading-robot/logs/access.log;
    error_log /var/www/trading-robot/logs/error.log;
    
    # Main location
    location / {
        try_files $uri $uri/ =404;
        
        # Add security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Security: Hide nginx version
    server_tokens off;
    
    # Prevent access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### Advanced Configuration with API Proxy (Optional)

If you want to add a backend API or proxy external APIs:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    root /var/www/trading-robot/html;
    index index.html index.htm;
    
    # Logging
    access_log /var/www/trading-robot/logs/access.log;
    error_log /var/www/trading-robot/logs/error.log;
    
    # Main application
    location / {
        try_files $uri $uri/ =404;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' *.alphavantage.co *.yahoo.com *.iexapis.com" always;
    }
    
    # Proxy for stock APIs to avoid CORS issues
    location /api/stock/ {
        # Alpha Vantage proxy
        rewrite ^/api/stock/(.*)$ /query?function=TIME_SERIES_INTRADAY&symbol=$1&interval=5min&apikey=YOUR_API_KEY break;
        proxy_pass https://www.alphavantage.co;
        proxy_set_header Host www.alphavantage.co;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, Authorization, Accept" always;
        add_header Access-Control-Max-Age 3600 always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Origin, Authorization, Accept" always;
            add_header Access-Control-Max-Age 3600 always;
            add_header Content-Type "text/plain; charset=utf-8";
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Rate limiting for API calls
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        limit_req_status 429;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}

# Rate limiting zone definition (add to main nginx.conf)
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
}
```

## 🔒 Step 5: SSL/HTTPS Configuration (Recommended)

### Install Certbot for Let's Encrypt SSL

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal setup
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual SSL Configuration

If you have your own SSL certificates:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /var/www/trading-robot/ssl/certificate.crt;
    ssl_certificate_key /var/www/trading-robot/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    root /var/www/trading-robot/html;
    index index.html index.htm;
    
    # Rest of your configuration...
}
```

## 🌐 Step 6: Enable the Site

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/trading-robot /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## 🔥 Step 7: Configure Firewall

```bash
# Allow nginx through firewall
sudo ufw allow 'Nginx Full'

# If using specific ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check firewall status
sudo ufw status
```

## 📊 Step 8: Monitoring and Logs

### Log Rotation

Create log rotation configuration:

```bash
sudo nano /etc/logrotate.d/trading-robot
```

Add:

```
/var/www/trading-robot/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

### Monitoring Script

Create a simple monitoring script:

```bash
sudo nano /var/www/trading-robot/monitor.sh
```

```bash
#!/bin/bash
# Trading Robot Monitoring Script

LOG_FILE="/var/www/trading-robot/logs/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check if nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "$DATE - ERROR: Nginx is not running" >> $LOG_FILE
    sudo systemctl start nginx
else
    echo "$DATE - INFO: Nginx is running" >> $LOG_FILE
fi

# Check disk space
DISK_USAGE=$(df /var/www/trading-robot | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "$DATE - WARNING: Disk usage is ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check log file sizes
find /var/www/trading-robot/logs -name "*.log" -size +100M -exec echo "$DATE - WARNING: Large log file found: {}" \; >> $LOG_FILE
```

```bash
# Make executable
sudo chmod +x /var/www/trading-robot/monitor.sh

# Add to crontab for hourly monitoring
sudo crontab -e
# Add: 0 * * * * /var/www/trading-robot/monitor.sh
```

## 🐳 Docker Alternative (Optional)

If you prefer Docker deployment:

### Dockerfile

```dockerfile
FROM nginx:alpine

# Copy HTML files
COPY html/ /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
```

### Docker Compose

```yaml
version: '3.8'

services:
  trading-robot:
    build: .
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./html:/usr/share/nginx/html
      - ./logs:/var/log/nginx
      - ./ssl:/etc/nginx/ssl
    restart: unless-stopped
    environment:
      - NGINX_HOST=your-domain.com
      - NGINX_PORT=80
```

## 🔧 Yahoo Finance Integration Setup

### JavaScript Client-Side Integration

If you want to use the proxy endpoints from your trading robot, update the `fetchStockData` function:

```javascript
// Updated fetchStockData function to use nginx proxy
async function fetchYahooFinanceData(symbol) {
    // Use nginx proxy endpoints to avoid CORS
    const quoteUrl = `/api/yahoo/v8/finance/chart/${symbol}?range=1d&interval=5m`;
    const historyUrl = `/api/yahoo/v8/finance/chart/${symbol}?range=3mo&interval=1d`;
    
    try {
        const [quoteResponse, historyResponse] = await Promise.all([
            fetch(quoteUrl),
            fetch(historyUrl)
        ]);
        
        if (!quoteResponse.ok || !historyResponse.ok) {
            throw new Error('Yahoo Finance API request failed');
        }
        
        const quoteData = await quoteResponse.json();
        const historyData = await historyResponse.json();
        
        // Process data as before...
        return processYahooData(quoteData, historyData, symbol);
        
    } catch (error) {
        console.error(`Yahoo Finance proxy error for ${symbol}:`, error);
        throw error;
    }
}

async function fetchAlternativeData(symbol) {
    // Use nginx proxy for Financial Modeling Prep
    const apiUrl = `/api/fmp/api/v3/quote/${symbol}?apikey=demo`;
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Alternative API request failed');
        }
        
        const data = await response.json();
        // Process data as before...
        return processAlternativeData(data, symbol);
        
    } catch (error) {
        console.error(`Alternative API proxy error for ${symbol}:`, error);
        throw error;
    }
}
```

### Direct Yahoo Finance Integration (No Proxy)

The trading robot now includes direct Yahoo Finance integration with multiple fallbacks:

1. **Primary**: Yahoo Finance API (real-time data)
2. **Fallback**: Financial Modeling Prep API
3. **Demo**: Realistic simulated data

### Yahoo Finance API Endpoints Used

```javascript
// Current price and intraday data (5-minute intervals)
const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=5m`;

// Historical data (3 months of daily data)
const historyUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=3mo&interval=1d`;
```

### Cache Configuration

Create cache directory and set permissions:

```bash
# Create cache directory
sudo mkdir -p /var/cache/nginx/trading-robot
sudo chown -R www-data:www-data /var/cache/nginx/trading-robot
sudo chmod -R 755 /var/cache/nginx/trading-robot
```

### Nginx Main Configuration

Edit `/etc/nginx/nginx.conf`:

```nginx
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 30;
    types_hash_max_size 2048;
    
    # Buffer sizes
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    output_buffers 1 32k;
    postpone_output 1460;
    
    # Timeouts
    client_header_timeout 3m;
    client_body_timeout 3m;
    send_timeout 3m;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;
    
    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        application/x-font-ttf
        application/vnd.ms-fontobject
        font/opentype
        image/svg+xml
        image/x-icon;
    gzip_disable "MSIE [1-6]\.";
    
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

## 🔍 Troubleshooting

### Common Issues and Solutions

1. **Permission Denied**
   ```bash
   sudo chown -R www-data:www-data /var/www/trading-robot
   sudo chmod -R 755 /var/www/trading-robot
   ```

2. **Nginx Configuration Test**
   ```bash
   sudo nginx -t
   sudo nginx -T  # Show full configuration
   ```

3. **Check Logs**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/www/trading-robot/logs/error.log
   ```

4. **Restart Services**
   ```bash
   sudo systemctl restart nginx
   sudo systemctl status nginx
   ```

## 📱 Mobile Optimization

The trading robot is already responsive, but you can add these nginx headers for better mobile experience:

```nginx
# Add to your server block
add_header X-UA-Compatible "IE=edge";
add_header Vary "Accept-Encoding";

# Mobile-specific caching
location ~* \.(jpg|jpeg|gif|png|svg|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
}
```

This comprehensive setup will give you a production-ready deployment of your trading robot with nginx, including security, performance optimization, monitoring, and SSL support!