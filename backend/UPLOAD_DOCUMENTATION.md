# File Upload System Documentation

Complete documentation for the file upload functionality with multer.

## Overview

The file upload system provides:
- Secure file uploads with validation
- Multiple file type support (images, documents, archives)
- File size limits
- Automatic file naming and sanitization
- Task attachment integration
- Avatar upload for user profiles
- File management utilities

## Architecture

```
Client Upload → Multer Middleware → Validation → Controller → Service → Storage
                                                      ↓
                                                   Database
```

## Configuration

### Environment Variables

```env
# File Upload Configuration
MAX_FILE_SIZE=5242880        # 5MB in bytes
UPLOAD_PATH=./uploads        # Upload directory path
```

### Supported File Types

**Images:**
- Extensions: jpg, jpeg, png, gif, webp
- Max Size: 5MB
- Use Case: Avatars, screenshots

**Documents:**
- Extensions: pdf, doc, docx, txt, xls, xlsx, csv
- Max Size: 10MB
- Use Case: Task attachments, reports

**Archives:**
- Extensions: zip, rar, 7z, tar, gz
- Max Size: 20MB
- Use Case: Compressed files, backups

**All Types:**
- Max Size: 20MB (largest allowed)
- Combines all above types

## API Endpoints

### 1. Upload Task Attachment

**Endpoint:** `POST /api/upload/task/:taskId`

**Access:** Private (Must have access to task's project)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: The file to upload (required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "File uploaded and attached to task successfully",
  "data": {
    "file": {
      "filename": "document-1714734000000-123456789.pdf",
      "originalName": "project-report.pdf",
      "mimetype": "application/pdf",
      "size": 1024000,
      "url": "http://localhost:5000/uploads/document-1714734000000-123456789.pdf"
    },
    "task": {
      "_id": "507f1f77bcf86cd799439020",
      "title": "Review project report",
      "attachments": [
        {
          "_id": "507f1f77bcf86cd799439030",
          "filename": "document-1714734000000-123456789.pdf",
          "originalName": "project-report.pdf",
          "mimetype": "application/pdf",
          "size": 1024000,
          "url": "http://localhost:5000/uploads/document-1714734000000-123456789.pdf",
          "uploadedBy": {
            "_id": "507f1f77bcf86cd799439010",
            "name": "John Doe",
            "email": "john@example.com"
          },
          "uploadedAt": "2026-05-03T10:00:00.000Z"
        }
      ]
    }
  }
}
```

**Error Responses:**
- `400` - No file uploaded or validation error
- `403` - Access denied to task
- `404` - Task not found
- `500` - Server error

---

### 2. Upload Multiple Task Attachments

**Endpoint:** `POST /api/upload/task/:taskId/multiple`

**Access:** Private

**Content-Type:** `multipart/form-data`

**Form Data:**
- `files`: Multiple files (max 10 files)

**Success Response (200):**
```json
{
  "success": true,
  "message": "3 file(s) uploaded successfully",
  "data": {
    "attachments": [
      {
        "filename": "image-1714734000000-123456789.png",
        "originalName": "screenshot.png",
        "mimetype": "image/png",
        "size": 512000,
        "url": "http://localhost:5000/uploads/image-1714734000000-123456789.png"
      }
    ],
    "task": {...},
    "failed": [
      {
        "filename": "invalid.exe",
        "error": "Invalid file type. Allowed types: jpg, jpeg, png, ..."
      }
    ]
  }
}
```

---

### 3. Upload Avatar

**Endpoint:** `POST /api/upload/avatar`

**Access:** Private

**Content-Type:** `multipart/form-data`

**Form Data:**
- `avatar`: Image file (required)

**Validation:**
- Only image files allowed (jpg, jpeg, png, gif, webp)
- Max size: 5MB

**Success Response (200):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "file": {
      "filename": "avatar-1714734000000-123456789.jpg",
      "originalName": "profile-pic.jpg",
      "mimetype": "image/jpeg",
      "size": 256000,
      "url": "http://localhost:5000/uploads/avatar-1714734000000-123456789.jpg"
    }
  }
}
```

**Usage:**
After uploading, use the returned URL to update user profile:
```javascript
PUT /api/auth/profile
{
  "avatar": "http://localhost:5000/uploads/avatar-1714734000000-123456789.jpg"
}
```

---

### 4. Delete File

**Endpoint:** `DELETE /api/upload/:filename`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Error Responses:**
- `404` - File not found
- `500` - Error deleting file

---

### 5. Get Upload Statistics

**Endpoint:** `GET /api/upload/stats`

**Access:** Private (Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalFiles": 150,
      "totalSize": 52428800,
      "totalSizeFormatted": "50 MB",
      "files": [
        {
          "name": "document-1714734000000-123456789.pdf",
          "size": 1024000,
          "created": "2026-05-03T10:00:00.000Z",
          "modified": "2026-05-03T10:00:00.000Z"
        }
      ]
    }
  }
}
```

---

### 6. Clean Old Files

**Endpoint:** `POST /api/upload/clean`

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "daysOld": 30
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cleaned 15 old file(s)",
  "data": {
    "success": true,
    "deletedCount": 15,
    "deletedFiles": [
      "old-file-1.pdf",
      "old-file-2.jpg"
    ]
  }
}
```

---

## File Validation

### Automatic Validation

All uploads are automatically validated for:
1. **File Type** - Extension and MIME type
2. **File Size** - Based on file type category
3. **Filename** - Sanitized and made unique

### Validation Rules

```javascript
// Images
- Extensions: jpg, jpeg, png, gif, webp
- MIME types: image/jpeg, image/png, image/gif, image/webp
- Max size: 5MB

// Documents
- Extensions: pdf, doc, docx, txt, xls, xlsx, csv
- MIME types: application/pdf, application/msword, etc.
- Max size: 10MB

// Archives
- Extensions: zip, rar, 7z, tar, gz
- MIME types: application/zip, application/x-rar-compressed, etc.
- Max size: 20MB
```

### Custom Validation

Use the file service for custom validation:

```javascript
import { validateFileType } from '../services/file.service.js';

// Validate as image
validateFileType(file, 'images');

// Validate as document
validateFileType(file, 'documents');

// Validate as any allowed type
validateFileType(file, 'all');
```

---

## Security Features

### 1. Filename Sanitization

All filenames are automatically sanitized:
- Special characters removed
- Spaces replaced with underscores
- Unique timestamp and random suffix added
- Lowercase conversion

**Example:**
```
Original: "My Project Report (Final).pdf"
Sanitized: "my_project_report_final-1714734000000-123456789.pdf"
```

### 2. File Type Validation

Double validation:
- Extension check
- MIME type check

Prevents malicious file uploads disguised with fake extensions.

### 3. Size Limits

Enforced at multiple levels:
- Multer middleware
- File service validation
- Environment configuration

### 4. Access Control

All upload endpoints require authentication:
- Task attachments: Must be project member
- Avatar: Any authenticated user
- Admin operations: Admin role only

### 5. Automatic Cleanup

Failed uploads are automatically deleted:
- Validation failures
- Database errors
- Access denied scenarios

---

## Client-Side Implementation

### Upload Task Attachment

```javascript
const uploadTaskAttachment = async (taskId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`http://localhost:5000/api/upload/task/${taskId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data;
};
```

### Upload Multiple Files

```javascript
const uploadMultipleFiles = async (taskId, files) => {
  const formData = new FormData();
  
  // Append multiple files
  for (const file of files) {
    formData.append('files', file);
  }

  const response = await fetch(`http://localhost:5000/api/upload/task/${taskId}/multiple`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  return await response.json();
};
```

### Upload Avatar

```javascript
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch('http://localhost:5000/api/upload/avatar', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data = await response.json();
  
  if (data.success) {
    // Update user profile with avatar URL
    await updateProfile({ avatar: data.data.file.url });
  }

  return data;
};
```

### React Example with Progress

```javascript
import { useState } from 'react';

const FileUpload = ({ taskId }) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          console.log('Upload successful:', data);
        }
        setUploading(false);
      });

      xhr.open('POST', `http://localhost:5000/api/upload/task/${taskId}`);
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} disabled={uploading} />
      {uploading && <progress value={progress} max="100" />}
    </div>
  );
};
```

---

## Testing

### Using cURL

**Upload Task Attachment:**
```bash
curl -X POST http://localhost:5000/api/upload/task/507f1f77bcf86cd799439020 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/document.pdf"
```

**Upload Multiple Files:**
```bash
curl -X POST http://localhost:5000/api/upload/task/507f1f77bcf86cd799439020/multiple \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "files=@/path/to/file1.pdf" \
  -F "files=@/path/to/file2.jpg" \
  -F "files=@/path/to/file3.png"
```

**Upload Avatar:**
```bash
curl -X POST http://localhost:5000/api/upload/avatar \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "avatar=@/path/to/profile.jpg"
```

**Delete File:**
```bash
curl -X DELETE http://localhost:5000/api/upload/document-1714734000000-123456789.pdf \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Create a new POST request
2. Set URL: `http://localhost:5000/api/upload/task/:taskId`
3. Add Authorization header: `Bearer YOUR_ACCESS_TOKEN`
4. Go to Body tab
5. Select `form-data`
6. Add key `file` with type `File`
7. Choose file to upload
8. Send request

---

## File Service Utilities

### Available Functions

```javascript
import * as fileService from '../services/file.service.js';

// Validate file type
fileService.validateFileType(file, 'images');

// Sanitize filename
const clean = fileService.sanitizeFilename('My File (1).pdf');
// Returns: my_file_1.pdf

// Generate unique filename
const unique = fileService.generateUniqueFilename('document.pdf');
// Returns: document-1714734000000-123456789.pdf

// Get file info
const info = fileService.getFileInfo(file, 'http://localhost:5000');

// Delete file
await fileService.deleteFile('filename.pdf');

// Delete multiple files
await fileService.deleteFiles(['file1.pdf', 'file2.jpg']);

// Check if file exists
const exists = await fileService.fileExists('filename.pdf');

// Format file size
const formatted = fileService.formatFileSize(1024000);
// Returns: "1 MB"

// Get file extension
const ext = fileService.getFileExtension('document.pdf');
// Returns: "pdf"

// Check if image
const isImg = fileService.isImage('photo.jpg');
// Returns: true

// Ensure upload directory exists
await fileService.ensureUploadDir();

// Get upload statistics
const stats = await fileService.getUploadStats();

// Clean old files
const result = await fileService.cleanOldFiles(30);
```

---

## Error Handling

### Common Errors

**File Too Large:**
```json
{
  "success": false,
  "message": "File size exceeds 5MB limit"
}
```

**Invalid File Type:**
```json
{
  "success": false,
  "message": "Invalid file type. Allowed types: jpg, jpeg, png, gif, webp"
}
```

**No File Uploaded:**
```json
{
  "success": false,
  "message": "No file uploaded"
}
```

**Access Denied:**
```json
{
  "success": false,
  "message": "Access denied to this task"
}
```

---

## Best Practices

1. **Always validate on client-side** before uploading
2. **Show upload progress** for better UX
3. **Handle errors gracefully** with user-friendly messages
4. **Compress images** before uploading when possible
5. **Use appropriate file types** for the use case
6. **Clean up old files** periodically (admin task)
7. **Monitor storage usage** using stats endpoint
8. **Implement retry logic** for failed uploads
9. **Validate file content** not just extension
10. **Use HTTPS** in production for secure uploads

---

## Storage Management

### Directory Structure

```
uploads/
├── document-1714734000000-123456789.pdf
├── image-1714734000000-987654321.jpg
├── avatar-1714734000000-555555555.png
└── ...
```

### Cleanup Strategy

**Manual Cleanup (Admin):**
```bash
POST /api/upload/clean
{
  "daysOld": 30
}
```

**Automated Cleanup (Cron Job):**
```javascript
import cron from 'node-cron';
import { cleanOldFiles } from './services/file.service.js';

// Run cleanup every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running file cleanup...');
  const result = await cleanOldFiles(30);
  console.log(`Cleaned ${result.deletedCount} files`);
});
```

---

## Future Enhancements

Consider implementing:
- [ ] Cloud storage integration (AWS S3, Cloudinary)
- [ ] Image resizing and optimization
- [ ] Virus scanning
- [ ] File versioning
- [ ] Thumbnail generation
- [ ] Direct browser-to-cloud uploads
- [ ] File encryption at rest
- [ ] CDN integration
- [ ] Bandwidth monitoring
- [ ] File sharing with expiration links