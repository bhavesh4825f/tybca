# ⚠️ File Upload Warning for Free Hosting

## Important: Ephemeral Storage on Render

**Render's free tier uses ephemeral storage**, which means:

### 🔴 What This Means:
- **Files are temporary**: Uploaded files (photos, documents) are stored temporarily
- **Deleted on restart**: Every time your app restarts (sleep/wake, redeploy), all uploaded files are deleted
- **Not persistent**: Files won't survive beyond the current session

### ✅ Solutions:

#### Option 1: Use Cloud Storage (Recommended for Production)
Use a cloud storage service for file uploads:

1. **Cloudinary** (Free tier: 25GB storage, 25GB bandwidth/month)
   - https://cloudinary.com
   - Perfect for images and documents
   - Easy Node.js integration

2. **AWS S3** (Free tier: 5GB storage for 12 months)
   - https://aws.amazon.com/s3/
   - Highly reliable
   - Pay-as-you-go after free tier

3. **Google Cloud Storage** (Free tier: 5GB)
   - https://cloud.google.com/storage
   - Good integration with Firebase

4. **Supabase Storage** (Free tier: 1GB)
   - https://supabase.com/storage
   - PostgreSQL-based
   - Easy to use

#### Option 2: For Development/Testing Only
For testing purposes, uploads will work but:
- Be aware files disappear on app restart
- Users need to re-upload after each deployment
- Not suitable for production use

### 📝 How to Implement Cloudinary (Easiest Option)

1. **Sign up for Cloudinary**
   - Go to https://cloudinary.com
   - Create a free account
   - Get your cloud name, API key, and API secret

2. **Install Cloudinary SDK**
   ```bash
   cd backend
   npm install cloudinary multer-storage-cloudinary
   ```

3. **Update backend/middleware/upload.middleware.js**
   ```javascript
   const cloudinary = require('cloudinary').v2;
   const { CloudinaryStorage } = require('multer-storage-cloudinary');
   const multer = require('multer');

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
   });

   const storage = new CloudinaryStorage({
     cloudinary: cloudinary,
     params: {
       folder: 'dgsc-uploads',
       allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
       resource_type: 'auto'
     }
   });

   const upload = multer({ 
     storage: storage,
     limits: { fileSize: 5 * 1024 * 1024 }
   });

   module.exports = upload;
   ```

4. **Add to .env in Render**
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Update application code to use Cloudinary URLs**
   - Files will be stored on Cloudinary servers
   - You'll get permanent URLs like: `https://res.cloudinary.com/your-cloud/image/upload/...`
   - These URLs work forever, even after restarts

### 🎯 Current Status

✅ Basic file upload working (temporary storage)
⚠️ Files deleted on restart (Render limitation)
💡 Use Cloudinary for permanent storage

### 📊 Comparison

| Feature | Ephemeral (Current) | Cloudinary | AWS S3 |
|---------|---------------------|------------|--------|
| Free Tier | ✅ Unlimited | ✅ 25GB | ✅ 5GB (12 months) |
| Permanent Storage | ❌ No | ✅ Yes | ✅ Yes |
| Setup Difficulty | ⭐ Easy | ⭐⭐ Medium | ⭐⭐⭐ Hard |
| Best For | Testing | Production | Enterprise |

### 🔗 Helpful Resources

- Cloudinary Documentation: https://cloudinary.com/documentation/node_integration
- Multer Storage Cloudinary: https://www.npmjs.com/package/multer-storage-cloudinary
- AWS S3 with Node.js: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-example-creating-buckets.html

---

**For now**, your application works perfectly for testing, but remember that uploaded files are temporary!
