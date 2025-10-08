# AXA Lens Presentation Deployment Guide

## 📋 Overview

This guide provides comprehensive instructions for deploying the AXA Lens presentation on various platforms including OpenShift, local machines, and cloud services.

## 📁 Project Structure

```
axa-lens-presentation/
├── index.html          # Main presentation file
├── styles.css          # Styling and animations
├── script.js           # Interactive functionality
├── app_icon.png        # Application icon
├── captures/           # Screenshot images
│   ├── Splash Screen.png
│   ├── Home Screen.png
│   ├── OCR Extraction.png
│   ├── Passport Verification.png
│   └── Policy Generation.png
└── deployment/         # Deployment configurations
```

## 🚀 Deployment Options

### 1. Local Development Server

#### Option A: Python HTTP Server (Recommended)
```bash
# Navigate to project directory
cd /path/to/axa-lens-presentation

# Python 3
python -m http.server 8080

# Python 2 (legacy)
python -m SimpleHTTPServer 8080

# Access at: http://localhost:8080
```

#### Option B: Node.js HTTP Server
```bash
# Install http-server globally
npm install -g http-server

# Navigate to project directory
cd /path/to/axa-lens-presentation

# Start server
http-server -p 8080 -c-1

# Access at: http://localhost:8080
```

#### Option C: PHP Built-in Server
```bash
# Navigate to project directory
cd /path/to/axa-lens-presentation

# Start PHP server
php -S localhost:8080

# Access at: http://localhost:8080
```

### 2. OpenShift Deployment

#### Prerequisites
- OpenShift CLI (oc) installed
- Access to OpenShift cluster
- Project/namespace permissions

#### Step 1: Prepare Docker Configuration

Create `Dockerfile`:
```dockerfile
FROM nginx:alpine

# Copy presentation files
COPY . /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    
    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript text/javascript;
    
    server {
        listen 8080;
        server_name localhost;
        
        root /usr/share/nginx/html;
        index index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Cache static assets
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Main route
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

#### Step 2: Create OpenShift Resources

Create `openshift-deployment.yaml`:
```yaml
apiVersion: v1
kind: List
items:
- apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: axa-lens-presentation
    labels:
      app: axa-lens-presentation
  spec:
    replicas: 2
    selector:
      matchLabels:
        app: axa-lens-presentation
    template:
      metadata:
        labels:
          app: axa-lens-presentation
      spec:
        containers:
        - name: axa-lens-presentation
          image: axa-lens-presentation:latest
          ports:
          - containerPort: 8080
          resources:
            requests:
              memory: "64Mi"
              cpu: "50m"
            limits:
              memory: "128Mi"
              cpu: "100m"
          livenessProbe:
            httpGet:
              path: /
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5

- apiVersion: v1
  kind: Service
  metadata:
    name: axa-lens-presentation-service
    labels:
      app: axa-lens-presentation
  spec:
    selector:
      app: axa-lens-presentation
    ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
    type: ClusterIP

- apiVersion: route.openshift.io/v1
  kind: Route
  metadata:
    name: axa-lens-presentation-route
    labels:
      app: axa-lens-presentation
  spec:
    to:
      kind: Service
      name: axa-lens-presentation-service
    port:
      targetPort: 8080
    tls:
      termination: edge
      insecureEdgeTerminationPolicy: Redirect
```

#### Step 3: Deploy to OpenShift

```bash
# Login to OpenShift
oc login https://your-openshift-cluster-url

# Create or switch to project
oc new-project axa-lens-presentation
# OR
oc project axa-lens-presentation

# Build and deploy from source
oc new-app . --name=axa-lens-presentation

# Alternative: Deploy from Git repository
oc new-app https://github.com/your-org/axa-lens-presentation.git

# Apply deployment configuration
oc apply -f openshift-deployment.yaml

# Create route (if not using the YAML)
oc expose service axa-lens-presentation-service

# Check deployment status
oc get pods
oc get routes

# Get application URL
oc get route axa-lens-presentation-route -o jsonpath='{.spec.host}'
```

### 3. Docker Deployment

#### Build Docker Image
```bash
# Build image
docker build -t axa-lens-presentation:latest .

# Run container
docker run -d -p 8080:8080 --name axa-lens-presentation axa-lens-presentation:latest

# Access at: http://localhost:8080
```

#### Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  axa-lens-presentation:
    build: .
    ports:
      - "8080:8080"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/var/log/nginx
```

Run with:
```bash
docker-compose up -d
```

### 4. Cloud Platform Deployment

#### Netlify (Static Hosting)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir .
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### GitHub Pages
1. Push code to GitHub repository
2. Go to repository Settings > Pages
3. Select source branch (main/master)
4. Set folder to root (/)

## 🔧 Configuration Options

### Environment Variables
```bash
# Production mode
export NODE_ENV=production

# Custom port
export PORT=8080

# Enable analytics
export ENABLE_ANALYTICS=true
```

### Performance Optimization

#### Enable Gzip Compression
For Nginx:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

For Apache (.htaccess):
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

#### Cache Headers
```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔒 Security Considerations

### Security Headers
```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self';" always;
```

### HTTPS Configuration
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Your server configuration...
}
```

## 📊 Monitoring and Logging

### Basic Monitoring
```bash
# Check container health
docker ps
docker logs axa-lens-presentation

# OpenShift monitoring
oc get pods
oc logs deployment/axa-lens-presentation
```

### Log Rotation (Nginx)
```nginx
error_log /var/log/nginx/error.log warn;
access_log /var/log/nginx/access.log combined;
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :8080
   
   # Kill process
   kill -9 <PID>
   ```

2. **Permission Denied**
   ```bash
   # Fix file permissions
   chmod -R 755 /path/to/axa-lens-presentation
   ```

3. **Images Not Loading**
   - Check file paths are relative
   - Verify image files exist in captures/ directory
   - Check web server MIME types configuration

4. **Animations Not Working**
   - Ensure JavaScript is enabled
   - Check browser console for errors
   - Verify CSS animations are supported

### OpenShift Troubleshooting
```bash
# Check pod status
oc describe pod <pod-name>

# View logs
oc logs <pod-name> -f

# Debug networking
oc get services
oc get routes
oc describe route axa-lens-presentation-route

# Scale deployment
oc scale deployment axa-lens-presentation --replicas=3
```

## 🚀 Performance Tips

1. **Enable compression** for CSS, JS, and HTML files
2. **Optimize images** - compress PNG files in captures/ directory
3. **Use CDN** for faster global delivery
4. **Enable browser caching** for static assets
5. **Minify CSS and JavaScript** for production

## 📝 Maintenance

### Regular Updates
```bash
# Update deployment
oc rollout restart deployment/axa-lens-presentation

# Update from Git
git pull origin main
docker build -t axa-lens-presentation:latest .
oc import-image axa-lens-presentation:latest
```

### Backup
```bash
# Backup presentation files
tar -czf axa-lens-presentation-backup-$(date +%Y%m%d).tar.gz .

# Backup OpenShift resources
oc get all -o yaml > openshift-backup.yaml
```

## 📞 Support

For deployment issues or questions:
- Check this documentation first
- Review logs for error messages
- Contact the development team
- Create issue in project repository

---

**Note**: This presentation contains sensitive business information. Ensure proper access controls and security measures are in place for production deployments.