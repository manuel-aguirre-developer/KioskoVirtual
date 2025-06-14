const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/webhook', paymentController.webhook);
router.post('/create-preference', paymentController.createPreference);

module.exports = router;