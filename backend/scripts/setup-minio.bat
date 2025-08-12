@echo off
echo Setting up MinIO bucket and policies...

echo Waiting for MinIO to be available...
:wait_loop
curl -f http://localhost:9000/minio/health/live >nul 2>&1
if %errorlevel% neq 0 (
    echo MinIO not ready yet, waiting...
    timeout /t 2 >nul
    goto wait_loop
)

echo Downloading MinIO client...
if not exist mc.exe (
    curl -L https://dl.min.io/client/mc/release/windows-amd64/mc.exe -o mc.exe
)

echo Configuring MinIO client...
mc.exe alias set local http://localhost:9000 minioadmin minioadmin

echo Creating bucket 'chauphim-videos'...
mc.exe mb local/chauphim-videos --ignore-existing

echo Setting bucket policy to public read...
mc.exe anonymous set public local/chauphim-videos

echo Creating CORS policy...
echo {> cors.json
echo   "CORSRules": [>> cors.json
echo     {>> cors.json
echo       "AllowedOrigins": ["*"],>> cors.json
echo       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],>> cors.json
echo       "AllowedHeaders": ["*"],>> cors.json
echo       "ExposeHeaders": ["ETag", "x-amz-request-id", "x-amz-id-2"],>> cors.json
echo       "MaxAgeSeconds": 3000>> cors.json
echo     }>> cors.json
echo   ]>> cors.json
echo }>> cors.json

mc.exe cors set cors.json local/chauphim-videos

echo MinIO setup completed!
echo Bucket URL: http://localhost:9000/chauphim-videos

del cors.json
pause
