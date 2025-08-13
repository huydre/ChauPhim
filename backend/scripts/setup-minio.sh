#!/bin/bash

# MinIO setup script
echo "Setting up MinIO bucket and policies..."

# Wait for MinIO to be ready
echo "Waiting for MinIO to be available..."
until curl -f http://localhost:9000/minio/health/live; do
  echo "MinIO not ready yet, waiting..."
  sleep 2
done

# Install mc (MinIO Client) if not exists
if ! command -v mc &> /dev/null; then
    echo "Installing MinIO client..."
    curl https://dl.min.io/client/mc/release/linux-amd64/mc -o mc
    chmod +x mc
    sudo mv mc /usr/local/bin/
fi

# Configure MinIO client
echo "Configuring MinIO client..."
mc alias set local http://localhost:9000 minioadmin minioadmin

# Create bucket if it doesn't exist
echo "Creating bucket 'chauphim-videos'..."
mc mb local/chauphim-videos --ignore-existing

# Set bucket policy to public read
echo "Setting bucket policy to public read..."
mc anonymous set public local/chauphim-videos

# Set CORS policy
echo "Setting CORS policy..."
cat > /tmp/cors.json << EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "x-amz-request-id", "x-amz-id-2"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

mc cors set /tmp/cors.json local/chauphim-videos

echo "MinIO setup completed!"
echo "Bucket URL: http://localhost:9000/chauphim-videos"
