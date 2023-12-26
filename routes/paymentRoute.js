const express = require('express');
const payment_route = express();

const bodyParser = require('body-parser');
payment_route.use(bodyParser.json());
payment_route.use(bodyParser.urlencoded({ extended:false }));

const paymentController = require('../controllers/paymentController');
const paypalController = require('../controllers/paypal');

payment_route.post('/create-customer', paymentController.createCustomer);
payment_route.post('/add-card', paymentController.addNewCard);
payment_route.post('/create-charges', paymentController.createCharges);
payment_route.post("/refund", paymentController.refundCharge);

payment_route.post('/transfer-funds', paypalController.transferFunds);
payment_route.get('/success', paypalController.success);
payment_route.post("/payment-refund", paypalController.paymentRefund);




module.exports = payment_route;