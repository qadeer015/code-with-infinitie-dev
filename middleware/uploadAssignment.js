const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'temp'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Keep original file names
    }
});

const upload = multer({ storage });

module.exports = upload;
