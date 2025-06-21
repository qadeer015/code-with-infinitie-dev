const express = require('express');
const certificatesController = require('../controllers/certificatesController');
const router = express.Router();

router.get("/", certificatesController.getCertificate);

module.exports = router;