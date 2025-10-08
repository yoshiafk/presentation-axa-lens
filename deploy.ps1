# AXA Lens Presentation - Windows PowerShell Deployment Script
# Usage: .\deploy.ps1 [local|docker|openshift] [port]

param(
    [string]$DeploymentType = "local",
    [int]$Port = 8080
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🚀 AXA Lens Presentation Deployment Script" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Helper functions
function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# Check if required files exist
function Test-RequiredFiles {
    Write-Info "Checking required files..."
    
    $requiredFiles = @("index.html", "styles.css", "script.js")
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            Write-Error "Required file missing: $file"
            exit 1
        }
    }
    
    if (-not (Test-Path "captures" -PathType Container)) {
        Write-Warning "Screenshots directory 'captures' not found"
        Write-Info "Creating captures directory..."
        New-Item -ItemType Directory -Name "captures" -Force | Out-Null
    }
    
    Write-Success "All required files found"
}

# Local deployment using Python HTTP server
function Start-LocalDeployment {
    Write-Info "Starting local development server..."
    
    # Check if Python is available
    if (Get-Command python -ErrorAction SilentlyContinue) {
        Write-Info "Using Python HTTP server on port $Port"
        Write-Host "🌐 Access your presentation at: " -NoNewline -ForegroundColor Green
        Write-Host "http://localhost:$Port" -ForegroundColor Cyan
        Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow
        
        try {
            python -m http.server $Port
        }
        catch {
            Write-Error "Failed to start Python server: $_"
        }
    }
    elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
        Write-Info "Using Python 3 HTTP server on port $Port"
        Write-Host "🌐 Access your presentation at: " -NoNewline -ForegroundColor Green
        Write-Host "http://localhost:$Port" -ForegroundColor Cyan
        Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow
        
        try {
            python3 -m http.server $Port
        }
        catch {
            Write-Error "Failed to start Python server: $_"
        }
    }
    elseif (Get-Command node -ErrorAction SilentlyContinue) {
        Write-Info "Python not found. Checking for Node.js..."
        if (Get-Command npx -ErrorAction SilentlyContinue) {
            Write-Info "Using Node.js HTTP server on port $Port"
            Write-Host "🌐 Access your presentation at: " -NoNewline -ForegroundColor Green
            Write-Host "http://localhost:$Port" -ForegroundColor Cyan
            Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow
            
            try {
                npx http-server -p $Port -c-1
            }
            catch {
                Write-Error "Failed to start Node.js server: $_"
            }
        }
        else {
            Write-Error "npx not found. Please install Node.js or use: npm install -g http-server"
        }
    }
    else {
        Write-Error "Neither Python nor Node.js found."
        Write-Info "Please install one of the following:"
        Write-Info "- Python: https://python.org/downloads"
        Write-Info "- Node.js: https://nodejs.org/download"
        exit 1
    }
}

# Docker deployment
function Start-DockerDeployment {
    Write-Info "Deploying with Docker..."
    
    # Check if Docker is available
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker not found. Please install Docker Desktop first."
        Write-Info "Download from: https://www.docker.com/products/docker-desktop"
        exit 1
    }
    
    # Create Dockerfile if it doesn't exist
    if (-not (Test-Path "Dockerfile")) {
        Write-Info "Creating Dockerfile..."
        
        $dockerfileContent = @"
FROM nginx:alpine

# Copy presentation files
COPY . /usr/share/nginx/html/

# Create nginx configuration
RUN echo 'server { \
    listen 8080; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    \
    # Cache static assets \
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    location / { \
        try_files \$uri \$uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
"@
        
        $dockerfileContent | Out-File -FilePath "Dockerfile" -Encoding UTF8
        Write-Success "Dockerfile created"
    }
    
    # Build Docker image
    Write-Info "Building Docker image..."
    try {
        docker build -t axa-lens-presentation:latest .
        Write-Success "Docker image built successfully"
    }
    catch {
        Write-Error "Failed to build Docker image: $_"
        exit 1
    }
    
    # Stop existing container if running
    $existingContainer = docker ps -q -f name=axa-lens-presentation 2>$null
    if ($existingContainer) {
        Write-Info "Stopping existing container..."
        docker stop axa-lens-presentation | Out-Null
        docker rm axa-lens-presentation | Out-Null
    }
    
    # Run container
    Write-Info "Starting Docker container..."
    try {
        docker run -d -p "${Port}:8080" --name axa-lens-presentation axa-lens-presentation:latest | Out-Null
        Write-Success "Docker deployment completed"
        Write-Host "🌐 Access your presentation at: " -NoNewline -ForegroundColor Green
        Write-Host "http://localhost:$Port" -ForegroundColor Cyan
        Write-Info "To stop: docker stop axa-lens-presentation"
        Write-Info "To view logs: docker logs axa-lens-presentation"
    }
    catch {
        Write-Error "Failed to start Docker container: $_"
        exit 1
    }
}

# OpenShift deployment
function Start-OpenShiftDeployment {
    Write-Info "Deploying to OpenShift..."
    
    # Check if oc CLI is available
    if (-not (Get-Command oc -ErrorAction SilentlyContinue)) {
        Write-Error "OpenShift CLI (oc) not found. Please install it first."
        Write-Info "Download from: https://console.redhat.com/openshift/downloads"
        exit 1
    }
    
    # Check if logged in
    try {
        $null = oc whoami 2>$null
    }
    catch {
        Write-Error "Not logged in to OpenShift. Please run 'oc login' first."
        exit 1
    }
    
    $projectName = "axa-lens-presentation"
    
    # Create project if it doesn't exist
    try {
        $null = oc project $projectName 2>$null
        Write-Info "Using existing project: $projectName"
    }
    catch {
        Write-Info "Creating OpenShift project: $projectName"
        try {
            oc new-project $projectName | Out-Null
        }
        catch {
            Write-Warning "Project creation failed or already exists. Continuing..."
        }
    }
    
    Write-Info "Using project: $projectName"
    oc project $projectName | Out-Null
    
    # Create application from current directory
    try {
        $null = oc get dc/axa-lens-presentation 2>$null
        Write-Info "Application exists. Triggering new build..."
        oc start-build axa-lens-presentation --from-dir=. --follow
    }
    catch {
        Write-Info "Creating new application..."
        oc new-app . --name=axa-lens-presentation
    }
    
    # Create route if it doesn't exist
    try {
        $null = oc get route axa-lens-presentation 2>$null
    }
    catch {
        Write-Info "Creating route..."
        oc expose service axa-lens-presentation | Out-Null
    }
    
    # Wait for deployment
    Write-Info "Waiting for deployment to complete..."
    try {
        oc rollout status dc/axa-lens-presentation --timeout=300s | Out-Null
    }
    catch {
        Write-Warning "Deployment status check timed out. Check manually with 'oc get pods'"
    }
    
    # Get route URL
    try {
        $routeUrl = oc get route axa-lens-presentation -o jsonpath='{.spec.host}' 2>$null
        if ($routeUrl) {
            Write-Success "OpenShift deployment completed"
            Write-Host "🌐 Access your presentation at: " -NoNewline -ForegroundColor Green
            Write-Host "https://$routeUrl" -ForegroundColor Cyan
        }
        else {
            Write-Warning "Deployment completed but route URL not found"
            Write-Info "Check routes with: oc get routes"
        }
    }
    catch {
        Write-Warning "Could not retrieve route URL"
        Write-Info "Check routes with: oc get routes"
    }
    
    Write-Info "To view status: oc get pods"
    Write-Info "To view logs: oc logs -f dc/axa-lens-presentation"
}

# Main deployment logic
function Main {
    Write-Host "Deployment type: $DeploymentType" -ForegroundColor White
    Write-Host "Port: $Port`n" -ForegroundColor White
    
    # Check files first
    Test-RequiredFiles
    
    switch ($DeploymentType.ToLower()) {
        "local" {
            Start-LocalDeployment
        }
        "docker" {
            Start-DockerDeployment
        }
        "openshift" {
            Start-OpenShiftDeployment
        }
        default {
            Write-Error "Unknown deployment type: $DeploymentType"
            Write-Host "`nUsage: .\deploy.ps1 [local|docker|openshift] [port]" -ForegroundColor White
            Write-Host "`nExamples:" -ForegroundColor White
            Write-Host "  .\deploy.ps1 local 8080          # Local server on port 8080" -ForegroundColor Gray
            Write-Host "  .\deploy.ps1 docker 9000         # Docker container on port 9000" -ForegroundColor Gray
            Write-Host "  .\deploy.ps1 openshift           # Deploy to OpenShift" -ForegroundColor Gray
            exit 1
        }
    }
}

# Handle Ctrl+C gracefully
try {
    Main
}
catch {
    Write-Host "`n⚠️  Deployment interrupted" -ForegroundColor Yellow
    exit 1
}