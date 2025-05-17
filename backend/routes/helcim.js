const express = require('express');
const router = express.Router();
const helcimController = require('../controllers/helcimController');

// Initialize a payment session
router.post('/initialize-payment', helcimController.initializePayment);

// Process a direct purchase
router.post('/process-purchase', helcimController.processPurchase);

// Check payment status
router.get('/payment-status/:helcimPayId', helcimController.checkPaymentStatus);

// Verify a HelcimPay.js payment
router.post('/verify-payment', helcimController.verifyHelcimPayment);

module.exports = router;
