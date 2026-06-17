const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if Supabase is configured
const hasSupabase =
  Boolean(process.env.SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_KEY) &&
  process.env.SUPABASE_URL !== 'https://yourproject.supabase.co';

let supabase = null;
if (hasSupabase) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  console.log('✅ Supabase Storage configured — images will be stored in the cloud');
} else {
  console.log('📁 Using local disk storage for images (uploads/ folder)');
}

// Use memoryStorage when Supabase is active (we stream the buffer),
// otherwise use diskStorage for local file saving.
const storage = hasSupabase
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * Upload a file to Supabase Storage and return the public CDN URL.
 * Falls back to returning a local /uploads/ path if Supabase is not configured.
 */
const uploadImage = async (file) => {
  if (hasSupabase && supabase) {
    const ext = (file.originalname || 'file').split('.').pop().toLowerCase();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

    const { error } = await supabase.storage
      .from('products')
      .upload(filename, file.buffer, { contentType: file.mimetype });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data } = supabase.storage.from('products').getPublicUrl(filename);
    return data.publicUrl; // full https:// CDN URL
  }

  // Local fallback — file already saved to disk by multer diskStorage
  return `/uploads/${file.filename}`;
};

/**
 * Delete an image from Supabase Storage or local disk.
 * @param {string} imageUrl - the stored image URL/path
 */
const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;

  if (hasSupabase && supabase && imageUrl.startsWith('http')) {
    // Extract just the filename from the full Supabase URL
    const filename = imageUrl.split('/').pop();
    await supabase.storage.from('products').remove([filename]);
    return;
  }

  // Local disk cleanup
  if (imageUrl.startsWith('/uploads/')) {
    const localPath = path.join(__dirname, '..', imageUrl);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }
};

module.exports = { upload, uploadImage, deleteImage };
