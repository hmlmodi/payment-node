const express = require('express');
const paypal_route = express();

const bodyParser = require('body-parser');
paypal_route.use(bodyParser.json());
paypal_route.use(bodyParser.urlencoded({ extended:false }));

const paypalController = require('../controllers/paypal');

paypal_route.post('/transfer-funds', paypalController.transferFunds);
paypal_route.get('/success', paypalController.success);
paypal_route.post("/payment-refund", paypalController.paymentRefund);

module.exports = paypal_route;