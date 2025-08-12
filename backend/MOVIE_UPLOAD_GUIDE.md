# 🎬 Hướng dẫn Upload Movie lên ChauPhim

## 📋 Tổng quan
Tài liệu này mô tả quy trình hoàn chỉnh để upload và phát hành một bộ phim trên nền tảng ChauPhim, từ file video gốc đến khi user có thể xem được trên website.

## 🔧 Yêu cầu hệ thống
- **Quyền Admin**: Tài khoản admin với JWT token
- **File video**: Định dạng MP4, MOV, AVI (khuyến nghị MP4)
- **Metadata**: Thông tin phim (tiêu đề, mô tả, poster, etc.)
- **Subtitles**: File phụ đề định dạng VTT (tùy chọn)

## 🚀 Quy trình Upload Movie (Chi tiết từng bước)

### **Bước 1: Đăng nhập Admin**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@chauphim.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "admin-id", "role": "ADMIN" },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**⚠️ Lưu ý:** Lưu `accessToken` để sử dụng cho các requests tiếp theo.

---

### **Bước 2: Tạo Upload URL cho Video File**
```bash
POST /admin/movies/upload-url
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "filename": "avengers-endgame.mp4",
  "contentType": "video/mp4"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "http://localhost:9000/vod/uploads/raw/1723489200-abc123.mp4?X-Amz-Algorithm=...",
    "videoKey": "uploads/raw/1723489200-abc123.mp4",
    "expiresAt": "2025-08-12T20:00:00.000Z"
  }
}
```

**📝 Ghi chú:** 
- `uploadUrl`: URL để upload file video trực tiếp lên MinIO
- `videoKey`: Key để reference file sau này
- URL có thời hạn 1 giờ

---

### **Bước 3: Upload Video File**
```bash
# Upload file video sử dụng presigned URL
PUT {uploadUrl}
Content-Type: video/mp4

[Binary video file data]
```

**Ví dụ với cURL:**
```bash
curl -X PUT "{uploadUrl}" \
  -H "Content-Type: video/mp4" \
  --data-binary "@/path/to/avengers-endgame.mp4"
```

**Ví dụ với JavaScript:**
```javascript
const videoFile = document.getElementById('fileInput').files[0];

fetch(uploadUrl, {
  method: 'PUT',
  body: videoFile,
  headers: {
    'Content-Type': 'video/mp4'
  }
}).then(response => {
  if (response.ok) {
    console.log('Video uploaded successfully!');
  }
});
```

---

### **Bước 4: Tạo Movie Metadata**
```bash
POST /admin/movies
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "slug": "avengers-endgame",
  "titleVi": "Biệt Đội Siêu Anh Hùng: Hồi Kết",
  "titleEn": "Avengers: Endgame",
  "descriptionVi": "Sau sự kiện tàn khốc trong Infinity War, vũ trụ đang trong tình trạng hỗn loạn...",
  "descriptionEn": "After the devastating events of Infinity War, the universe is in ruins...",
  "type": "MOVIE",
  "year": 2019,
  "posterUrl": "https://example.com/avengers-endgame-poster.jpg",
  "backdropUrl": "https://example.com/avengers-endgame-backdrop.jpg",
  "ageRating": "PG13",
  "durationMinutes": 181,
  "genreIds": [
    "action-genre-uuid",
    "adventure-genre-uuid",
    "sci-fi-genre-uuid"
  ],
  "castIds": [
    "robert-downey-jr-uuid",
    "chris-evans-uuid",
    "mark-ruffalo-uuid"
  ],
  "rawVideoKey": "uploads/raw/1723489200-abc123.mp4"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "movie-uuid-12345",
    "slug": "avengers-endgame",
    "titleVi": "Biệt Đội Siêu Anh Hùng: Hồi Kết",
    "titleEn": "Avengers: Endgame",
    "isPublished": false,
    "createdAt": "2025-08-12T10:00:00.000Z",
    "genres": [...],
    "casts": [...]
  }
}
```

**📝 Ghi chú:** 
- Movie được tạo với `isPublished: false` (chưa xuất bản)
- Lưu `movieId` để sử dụng cho các bước tiếp theo

---

### **Bước 5: Bắt đầu Video Transcoding**
```bash
POST /admin/movies/{movieId}/transcode
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "rawVideoKey": "uploads/raw/1723489200-abc123.mp4",
  "qualities": ["480p", "720p", "1080p"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "transcode-job-12345",
    "status": "queued",
    "message": "Transcoding job started successfully"
  }
}
```

**📝 Ghi chú:** 
- Quá trình transcode diễn ra ở background
- Có thể mất 15-60 phút tùy độ dài video
- Job được xếp hàng và xử lý tự động

---

### **Bước 6: Theo dõi tiến độ Transcoding**
```bash
GET /admin/movies/{movieId}/transcode/status
Authorization: Bearer {accessToken}
```

**Response (Đang xử lý):**
```json
{
  "success": true,
  "data": {
    "status": "processing",
    "progress": 45,
    "message": "Transcoding in progress..."
  }
}
```

**Response (Hoàn thành):**
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "progress": 100,
    "message": "Transcoding completed successfully",
    "hlsManifestKey": "videos/movie-uuid-12345/hls/master.m3u8"
  }
}
```

**📝 Ghi chú:** 
- Kiểm tra định kỳ mỗi 30 giây
- Status: `queued` → `processing` → `completed`/`failed`

---

### **Bước 7: Upload Subtitles (Tùy chọn)**

#### **7a. Tạo Upload URL cho Subtitle**
```bash
POST /admin/movies/{movieId}/subtitles/upload-url
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "language": "vi"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "http://localhost:9000/vod/videos/movie-uuid/subtitles/vi.vtt?X-Amz-Algorithm=...",
    "subtitleKey": "videos/movie-uuid-12345/subtitles/vi.vtt",
    "language": "vi",
    "expiresAt": "2025-08-12T20:00:00.000Z"
  }
}
```

#### **7b. Upload Subtitle File**
```bash
PUT {subtitleUploadUrl}
Content-Type: text/vtt

[VTT subtitle file content]
```

#### **7c. Đăng ký Subtitle với Movie**
```bash
POST /admin/movies/{movieId}/subtitles
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "language": "vi",
  "subtitleKey": "videos/movie-uuid-12345/subtitles/vi.vtt"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Subtitle uploaded successfully",
    "subtitles": [
      {
        "lang": "vi",
        "label": "Tiếng Việt",
        "key": "videos/movie-uuid-12345/subtitles/vi.vtt"
      }
    ]
  }
}
```

---

### **Bước 8: Xuất bản Movie**
```bash
PATCH /admin/movies/{movieId}/publish
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "isPublished": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "movie-uuid-12345",
    "slug": "avengers-endgame",
    "titleVi": "Biệt Đội Siêu Anh Hùng: Hồi Kết",
    "titleEn": "Avengers: Endgame",
    "isPublished": true,
    "movieSources": [
      {
        "hlsManifestKey": "videos/movie-uuid-12345/hls/master.m3u8",
        "isPublished": true,
        "subtitlesJson": [...]
      }
    ]
  }
}
```

**🎉 Chúc mừng!** Movie đã được xuất bản và user có thể xem!

---

## 🔍 Kiểm tra kết quả

### **Xem Movie trong danh sách công khai:**
```bash
GET /videos?page=1&limit=10
```

### **Xem chi tiết Movie:**
```bash
GET /videos/avengers-endgame
```

### **Test streaming (cần đăng nhập user):**
```bash
GET /stream/movie-uuid-12345
Authorization: Bearer {userToken}
```

---

## 📊 Quy trình Auto-Monitoring

### **Script tự động theo dõi:**
```javascript
async function monitorTranscoding(movieId, accessToken) {
  let status = 'processing';
  
  while (status === 'processing' || status === 'queued') {
    const response = await fetch(`/admin/movies/${movieId}/transcode/status`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    const result = await response.json();
    status = result.data.status;
    
    console.log(`Transcoding ${status}: ${result.data.progress}%`);
    
    if (status === 'completed') {
      console.log('✅ Transcoding completed! Ready to publish.');
      break;
    } else if (status === 'failed') {
      console.log('❌ Transcoding failed!');
      break;
    }
    
    // Wait 30 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
}
```

---

## 🗂️ File Structure sau khi Upload

```
MinIO Storage:
├── uploads/raw/
│   └── 1723489200-abc123.mp4          # Original video file
└── videos/movie-uuid-12345/
    ├── hls/
    │   ├── master.m3u8                 # Master playlist
    │   ├── 480p/
    │   │   ├── playlist.m3u8
    │   │   ├── segment_000.ts
    │   │   ├── segment_001.ts
    │   │   └── ...
    │   ├── 720p/
    │   │   ├── playlist.m3u8
    │   │   ├── segment_000.ts
    │   │   └── ...
    │   └── 1080p/
    │       ├── playlist.m3u8
    │       ├── segment_000.ts
    │       └── ...
    └── subtitles/
        ├── vi.vtt                      # Vietnamese subtitles
        ├── en.vtt                      # English subtitles
        └── ...
```

---

## 🚨 Xử lý lỗi thường gặp

### **1. Upload URL hết hạn**
```json
{
  "error": "SignatureDoesNotMatch",
  "message": "Upload URL expired"
}
```
**Giải pháp:** Tạo lại upload URL mới (Bước 2)

### **2. Transcode thất bại**
```json
{
  "success": true,
  "data": {
    "status": "failed",
    "message": "FFmpeg processing error"
  }
}
```
**Giải pháp:** 
- Kiểm tra format video (khuyến nghị MP4)
- Thử lại với qualities thấp hơn
- Kiểm tra kích thước file (< 5GB)

### **3. Không thể publish**
```json
{
  "success": false,
  "message": "Cannot publish movie without transcoded video source"
}
```
**Giải pháp:** Đảm bảo transcoding đã hoàn thành trước khi publish

### **4. Subtitle upload thất bại**
**Giải pháp:** 
- Đảm bảo file subtitle định dạng VTT
- Kiểm tra encoding UTF-8
- Subtitle file size < 1MB

---

## 📈 Best Practices

### **1. Chuẩn bị Video:**
- **Format:** MP4 với H.264 codec
- **Resolution:** Tối thiểu 720p, khuyến nghị 1080p
- **Bitrate:** 2-8 Mbps cho 1080p
- **Audio:** AAC codec, 48kHz

### **2. Optimize Upload:**
- Upload vào giờ ít traffic (đêm khuya)
- Kiểm tra kết nối internet ổn định
- Split video lớn thành nhiều parts nếu cần

### **3. Content Management:**
- Slug phải unique và SEO-friendly
- Poster/backdrop resolution: 1920x1080
- Metadata đầy đủ để SEO tốt
- Test streaming trước khi publish

### **4. Quality Control:**
- Preview video sau transcoding
- Kiểm tra sync subtitle
- Test trên nhiều device/browser
- Monitor user feedback sau publish

---

## 🔐 Security Notes

### **Admin Access:**
- JWT token có thời hạn (15 phút)
- Refresh token tự động khi cần
- Không chia sẻ admin credentials

### **File Upload:**
- Presigned URLs có thời hạn ngắn (1 giờ)
- Chỉ accept video MIME types
- Scan virus trước khi process

### **Content Protection:**
- Stream URLs có thời hạn (15 phút)
- Authentication required cho streaming
- Rate limiting cho API calls

---

## 📞 Support & Troubleshooting

### **Logs to check:**
```bash
# Server logs
tail -f logs/app.log

# Queue logs
tail -f logs/queue.log

# MinIO logs
docker logs minio
```

### **Health check:**
```bash
GET /health
GET /admin/movies?page=1&limit=1
```

### **Contact:**
- GitHub Issues: [Repository URL]
- Email: admin@chauphim.com
- Documentation: http://localhost:3000/api-docs

---

**🎬 Chúc bạn upload movie thành công!** 

*Tài liệu này được cập nhật lần cuối: 12/08/2025*
