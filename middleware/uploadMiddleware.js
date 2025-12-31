const multer = require('multer');
const path = require('path');

// 1. CHANGE: Use memoryStorage instead of diskStorage
// Vercel does not allow writing to the local 'uploads/' folder.
const storage = multer.memoryStorage();

// 2. Check File Type (Remains the same, but very useful)
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only!'));
  }
}

// 3. Initialize Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;