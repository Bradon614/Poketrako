const fs = require('fs');
const path = require('path');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXTENSIONS = /\.(jpeg|jpg|png|gif|pdf)$/i;
const ALLOWED_MIME_TYPES = /^(image\/(jpeg|jpg|png|gif)|application\/pdf)$/;

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    cb(null, `receipt-${Date.now()}${path.extname(file.originalname)}`);
  }
});

function fileFilter(req, file, cb) {
  const validExtension = ALLOWED_EXTENSIONS.test(path.extname(file.originalname));
  const validMimeType = ALLOWED_MIME_TYPES.test(file.mimetype);

  if (validExtension && validMimeType) {
    return cb(null, true);
  }
  cb(new Error('Seuls les fichiers JPEG, PNG, GIF et PDF sont acceptés'));
}

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 }, // 1MB
  fileFilter
}).single('receipt');

module.exports = upload;
