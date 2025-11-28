# Docker Deployment Guide

## Build and Run Locally

### 1. Build the Docker image:
\`\`\`bash
docker build -t vertex-ai-admin .
\`\`\`

### 2. Run the container:
\`\`\`bash
docker run -p 3000:3000 \
  -e GOOGLE_CLOUD_API_KEY="your-google-api-key" \
  -e MY_INTERNAL_API_KEY="your-internal-api-key" \
  vertex-ai-admin
\`\`\`

### 3. Access the application:
- Admin Panel: http://localhost:3000/admin
- API Endpoint: http://localhost:3000/api/vertex

## Deploy to Cloud Platforms

### Docker Hub / Container Registry

\`\`\`bash
# Tag the image
docker tag vertex-ai-admin your-username/vertex-ai-admin:latest

# Push to registry
docker push your-username/vertex-ai-admin:latest
\`\`\`

### Google Cloud Run

\`\`\`bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/vertex-ai-admin

# Deploy to Cloud Run
gcloud run deploy vertex-ai-admin \
  --image gcr.io/YOUR_PROJECT_ID/vertex-ai-admin \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_API_KEY=your-key,MY_INTERNAL_API_KEY=your-key
\`\`\`

### AWS ECS / Azure Container Instances

Use the Docker image and configure environment variables in your cloud provider's container service.

## Environment Variables

Required environment variables:
- `GOOGLE_CLOUD_API_KEY`: Your Google Cloud API key for Vertex AI
- `MY_INTERNAL_API_KEY`: Internal API key for securing your endpoints

## Health Check

The application runs on port 3000. You can add health check endpoints if needed.
