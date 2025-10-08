#!/bin/bash

# AXA Lens Presentation - Quick Deployment Script
# Usage: ./deploy.sh [local|docker|openshift]

set -e

DEPLOYMENT_TYPE=${1:-local}
PORT=${2:-8080}

echo "🚀 AXA Lens Presentation Deployment Script"
echo "=========================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required files exist
check_files() {
    print_info "Checking required files..."
    
    required_files=("index.html" "styles.css" "script.js")
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            print_error "Required file missing: $file"
            exit 1
        fi
    done
    
    if [[ ! -d "captures" ]]; then
        print_warning "Screenshots directory 'captures' not found"
        print_info "Creating captures directory..."
        mkdir -p captures
    fi
    
    print_success "All required files found"
}

# Local deployment using Python HTTP server
deploy_local() {
    print_info "Starting local development server..."
    
    # Check if Python is available
    if command -v python3 &> /dev/null; then
        print_info "Using Python 3 HTTP server on port $PORT"
        echo -e "${GREEN}🌐 Access your presentation at: http://localhost:$PORT${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
        echo ""
        python3 -m http.server $PORT
    elif command -v python &> /dev/null; then
        print_info "Using Python 2 HTTP server on port $PORT"
        echo -e "${GREEN}🌐 Access your presentation at: http://localhost:$PORT${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
        echo ""
        python -m SimpleHTTPServer $PORT
    else
        print_error "Python not found. Please install Python or use another deployment method."
        print_info "Alternative: Install Node.js and run 'npx http-server -p $PORT'"
        exit 1
    fi
}

# Docker deployment
deploy_docker() {
    print_info "Deploying with Docker..."
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found. Please install Docker first."
        exit 1
    fi
    
    # Create Dockerfile if it doesn't exist
    if [[ ! -f "Dockerfile" ]]; then
        print_info "Creating Dockerfile..."
        cat > Dockerfile << EOF
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
EOF
        print_success "Dockerfile created"
    fi
    
    # Build Docker image
    print_info "Building Docker image..."
    docker build -t axa-lens-presentation:latest . || {
        print_error "Failed to build Docker image"
        exit 1
    }
    print_success "Docker image built successfully"
    
    # Stop existing container if running
    if docker ps -q -f name=axa-lens-presentation | grep -q .; then
        print_info "Stopping existing container..."
        docker stop axa-lens-presentation
        docker rm axa-lens-presentation
    fi
    
    # Run container
    print_info "Starting Docker container..."
    docker run -d -p $PORT:8080 --name axa-lens-presentation axa-lens-presentation:latest || {
        print_error "Failed to start Docker container"
        exit 1
    }
    
    print_success "Docker deployment completed"
    echo -e "${GREEN}🌐 Access your presentation at: http://localhost:$PORT${NC}"
    echo -e "${BLUE}ℹ️  To stop: docker stop axa-lens-presentation${NC}"
    echo -e "${BLUE}ℹ️  To view logs: docker logs axa-lens-presentation${NC}"
}

# OpenShift deployment
deploy_openshift() {
    print_info "Deploying to OpenShift..."
    
    # Check if oc CLI is available
    if ! command -v oc &> /dev/null; then
        print_error "OpenShift CLI (oc) not found. Please install it first."
        print_info "Download from: https://console.redhat.com/openshift/downloads"
        exit 1
    fi
    
    # Check if logged in
    if ! oc whoami &> /dev/null; then
        print_error "Not logged in to OpenShift. Please run 'oc login' first."
        exit 1
    fi
    
    PROJECT_NAME="axa-lens-presentation"
    
    # Create project if it doesn't exist
    if ! oc project $PROJECT_NAME &> /dev/null; then
        print_info "Creating OpenShift project: $PROJECT_NAME"
        oc new-project $PROJECT_NAME || {
            print_warning "Project creation failed or already exists. Continuing..."
        }
    fi
    
    print_info "Using project: $PROJECT_NAME"
    oc project $PROJECT_NAME
    
    # Create application from current directory
    if oc get dc/axa-lens-presentation &> /dev/null; then
        print_info "Application exists. Triggering new build..."
        oc start-build axa-lens-presentation --from-dir=. --follow
    else
        print_info "Creating new application..."
        oc new-app . --name=axa-lens-presentation
    fi
    
    # Create route if it doesn't exist
    if ! oc get route axa-lens-presentation &> /dev/null; then
        print_info "Creating route..."
        oc expose service axa-lens-presentation
    fi
    
    # Wait for deployment
    print_info "Waiting for deployment to complete..."
    oc rollout status dc/axa-lens-presentation --timeout=300s
    
    # Get route URL
    ROUTE_URL=$(oc get route axa-lens-presentation -o jsonpath='{.spec.host}' 2>/dev/null)
    
    if [[ -n "$ROUTE_URL" ]]; then
        print_success "OpenShift deployment completed"
        echo -e "${GREEN}🌐 Access your presentation at: https://$ROUTE_URL${NC}"
    else
        print_warning "Deployment completed but route URL not found"
        print_info "Check routes with: oc get routes"
    fi
    
    print_info "To view status: oc get pods"
    print_info "To view logs: oc logs -f dc/axa-lens-presentation"
}

# Main deployment logic
main() {
    echo "Deployment type: $DEPLOYMENT_TYPE"
    echo "Port: $PORT"
    echo ""
    
    # Check files first
    check_files
    
    case $DEPLOYMENT_TYPE in
        "local")
            deploy_local
            ;;
        "docker")
            deploy_docker
            ;;
        "openshift")
            deploy_openshift
            ;;
        *)
            print_error "Unknown deployment type: $DEPLOYMENT_TYPE"
            echo ""
            echo "Usage: $0 [local|docker|openshift] [port]"
            echo ""
            echo "Examples:"
            echo "  $0 local 8080          # Local server on port 8080"
            echo "  $0 docker 9000         # Docker container on port 9000" 
            echo "  $0 openshift           # Deploy to OpenShift"
            echo ""
            exit 1
            ;;
    esac
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n${YELLOW}⚠️  Deployment interrupted${NC}"; exit 1' INT

# Run main function
main