const express = require('express');
// This didn't have to be exported from its own file, but I like namespacing
const kueApp = require('./kue/app');
const savedUrlContentRouter = require('./saved_url_content/router');

const router = express.Router();

// Expose Kue's Express-backed UI and REST API to routes starting with /api/kue
router.use('/kue', kueApp);
router.use('/saved_url_content', savedUrlContentRouter);

module.exports = router;
