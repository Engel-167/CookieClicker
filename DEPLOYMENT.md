# Deploying Cookie Clicker to Red Hat httpd Server

## 🚀 Deployment Guide

### Option 1: Node.js Server with httpd Reverse Proxy (Recommended)

This setup runs Node.js on port 8080 and uses httpd as a reverse proxy.

#### Step 1: Copy Files to Server
```bash
# Copy your project to the server
sudo mkdir -p /var/www/cookieclicker
sudo cp -r /home/orbmod/Desktop/Custom/Web-projects/COOKIECLIEKER2/* /var/www/cookieclicker/
sudo chown -R $USER:$USER /var/www/cookieclicker/
```

#### Step 2: Install Node.js on Red Hat (if not installed)
```bash
# Install Node.js
sudo dnf module install nodejs:20

# Verify installation
node --version
npm --version
```

#### Step 3: Install Dependencies
```bash
cd /var/www/cookieclicker
npm install
```

#### Step 4: Create Systemd Service (Run Node.js as a Service)
```bash
sudo nano /etc/systemd/system/cookieclicker.service
```

Add this content:
```ini
[Unit]
Description=Cookie Clicker Game Server
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/var/www/cookieclicker
Environment=NODE_ENV=production
Environment=PORT=8080
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Replace `YOUR_USERNAME` with your actual username.

#### Step 5: Enable and Start Service
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable cookieclicker

# Start the service
sudo systemctl start cookieclicker

# Check status
sudo systemctl status cookieclicker
```

#### Step 6: Configure httpd as Reverse Proxy
```bash
# Enable required modules
sudo dnf install mod_proxy mod_proxy_http

# Create Apache config
sudo nano /etc/httpd/conf.d/cookieclicker.conf
```

Add this content:
```apache
<VirtualHost *:80>
    ServerName your-server.com
    # Or use ServerName localhost for local testing

    # Reverse proxy to Node.js
    ProxyPreserveHost On
    ProxyPass / http://localhost:8080/
    ProxyPassReverse / http://localhost:8080/

    # WebSocket support (if needed in future)
    RewriteEngine on
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://localhost:8080/$1" [P,L]

    ErrorLog /var/log/httpd/cookieclicker-error.log
    CustomLog /var/log/httpd/cookieclicker-access.log combined
</VirtualHost>
```

#### Step 7: Configure SELinux (Red Hat specific)
```bash
# Allow httpd to make network connections
sudo setsebool -P httpd_can_network_connect 1

# Set proper context for files
sudo semanage fcontext -a -t httpd_sys_content_t "/var/www/cookieclicker(/.*)?"
sudo restorecon -Rv /var/www/cookieclicker
```

#### Step 8: Configure Firewall
```bash
# Allow HTTP traffic
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

#### Step 9: Restart httpd
```bash
sudo systemctl restart httpd
sudo systemctl enable httpd
```

#### Step 10: Test
Open browser and go to:
- `http://your-server-ip`
- `http://localhost` (if testing locally)

---

### Option 2: Standalone Node.js Server (Simpler)

If you don't need httpd, just run Node.js directly:

#### Step 1-3: Same as above

#### Step 4: Run on Port 80 (requires root)
Modify `server.js`:
```javascript
const PORT = process.env.PORT || 80;
```

#### Step 5: Create systemd service as above but with port 80

#### Step 6: Allow Node.js to bind to port 80
```bash
sudo setcap 'cap_net_bind_service=+ep' /usr/bin/node
```

#### Step 7: Configure firewall (same as above)

---

## 🔍 Useful Commands

### Check Node.js Service
```bash
# View logs
sudo journalctl -u cookieclicker -f

# Restart service
sudo systemctl restart cookieclicker

# Stop service
sudo systemctl stop cookieclicker

# Check status
sudo systemctl status cookieclicker
```

### Check httpd
```bash
# Test configuration
sudo httpd -t

# View logs
sudo tail -f /var/log/httpd/cookieclicker-error.log
sudo tail -f /var/log/httpd/error_log

# Restart
sudo systemctl restart httpd
```

### Monitor Node.js Process
```bash
# Find Node.js process
ps aux | grep node

# Check what's listening on port 8080
sudo ss -tlnp | grep 8080
```

---

## 🛠️ Troubleshooting

### Port 8080 already in use
```bash
# Find what's using the port
sudo lsof -i :8080

# Kill the process
sudo kill -9 PID
```

### Permission denied
```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/cookieclicker

# Fix permissions
sudo chmod -R 755 /var/www/cookieclicker
```

### SELinux blocking connections
```bash
# Check SELinux denials
sudo ausearch -m avc -ts recent

# Temporarily disable (for testing only)
sudo setenforce 0

# Re-enable
sudo setenforce 1
```

### Cannot access from other computers
```bash
# Check firewall
sudo firewall-cmd --list-all

# Check if service is running
sudo systemctl status cookieclicker
sudo systemctl status httpd

# Check if Node.js is listening
sudo netstat -tlnp | grep 8080
```

---

## 📊 Production Best Practices

### 1. Use PM2 Instead of systemd (Optional)
```bash
# Install PM2
sudo npm install -g pm2

# Start app
cd /var/www/cookieclicker
pm2 start server.js --name cookieclicker

# Save configuration
pm2 save

# Setup startup script
pm2 startup systemd
```

### 2. Add Environment Variables
```bash
# Create .env file
cd /var/www/cookieclicker
nano .env
```

Add:
```
NODE_ENV=production
PORT=8080
```

### 3. Enable HTTPS (Recommended)
```bash
# Install certbot
sudo dnf install certbot python3-certbot-apache

# Get certificate
sudo certbot --apache -d your-domain.com
```

### 4. Backup User Data
```bash
# Create backup script
sudo nano /usr/local/bin/backup-cookieclicker.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/cookieclicker"
mkdir -p $BACKUP_DIR
cp /var/www/cookieclicker/data/users.json $BACKUP_DIR/users-$(date +%Y%m%d-%H%M%S).json
# Keep only last 7 days
find $BACKUP_DIR -name "users-*.json" -mtime +7 -delete
```

Make it executable and add to cron:
```bash
sudo chmod +x /usr/local/bin/backup-cookieclicker.sh
sudo crontab -e
# Add: 0 */6 * * * /usr/local/bin/backup-cookieclicker.sh
```

---

## 🌐 Access Your Game

After deployment:
- Local: `http://localhost`
- Network: `http://YOUR_SERVER_IP`
- Domain: `http://your-domain.com`

Your users can now:
1. Sign up from any computer
2. Login from any device
3. Their progress is saved on the server
4. Continue playing from anywhere!

---

## ✅ Deployment Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] systemd service created and running
- [ ] httpd configured as reverse proxy
- [ ] SELinux configured
- [ ] Firewall rules added
- [ ] httpd service running
- [ ] Can access from browser
- [ ] User registration works
- [ ] Login works
- [ ] Game data persists
- [ ] Backup script created

---

Need help? Check the logs:
```bash
sudo journalctl -u cookieclicker -f
sudo tail -f /var/log/httpd/error_log
```
