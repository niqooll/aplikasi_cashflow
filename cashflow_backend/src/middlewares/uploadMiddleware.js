const multer = require('multer');
const path = require('path');

// Atur storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    // Buat nama file yang unik untuk menghindari konflik
    // format: fieldname-timestamp-extension
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Inisialisasi upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 }, // Batas ukuran file 2MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('receipt'); // 'receipt' adalah nama field di form-data

// Fungsi untuk memeriksa tipe file
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

module.exports = upload;