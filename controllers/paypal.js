const express = require('express');
const paypal = require('paypal-rest-sdk');
const axios = require('axios');

const app = express();

const paypalRoute = express.Router();
paypal.configure({
    mode: 'sandbox', // 'sandbox' for testing, 'live' for production
    client_id: 'ASpFDCXBiKQmG2VnWilfhyLeKqxC6OAYWx8sqXriyPjTbN1Yd7YU2W0kN_zY100GscZI4CBPAyzCFL_x',
    client_secret: 'EJubDelmFRfmxBeAKmYo7qml76gTcpVaLIXipgeK6eRwC_pohn8n0vmnOtH3Dre2vPx7Jrtre-0tQelp',
});

app.use(express.json());

// for transaction
const transferFunds = async (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/paypal/success",//change it to your production url 
            "cancel_url": "http://localhost:3000/paypal/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    // example 
                    "name": "Red Sox Hat",
                    "sku": "001",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                // make it dynamic 
                "currency": "USD",
                "total": "25.00"
            },
            // example 
            "description": "Hat for the best team ever"
        }]
    };

    paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    // go to this to fetch payment id and payerId
                    res.send(payment.links[i].href);
                }
            }
        }
    });
}

// to complete the payment process
const success = async (req, res) => {
    const payerId = req.query.PayerID;
    console.log("🚀 ~ file: paypal.js:612 ~ paypalRoute.get ~ payerId:", payerId)
    const paymentId = req.query.paymentId;
    console.log("🚀 ~ file: paypal.js:614 ~ paypalRoute.get ~ paymentId:", paymentId)

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
}

// to cancel the payment process
const cancel = async (req, res) => {res.send('Cancelled')}



// for future purpose
// paypalRoute.post('/transaction-listing', (req, res) => {
//     const axios = require('axios');

//     const clientId = 'ASpFDCXBiKQmG2VnWilfhyLeKqxC6OAYWx8sqXriyPjTbN1Yd7YU2W0kN_zY100GscZI4CBPAyzCFL_x';
//     const clientSecret = 'EJubDelmFRfmxBeAKmYo7qml76gTcpVaLIXipgeK6eRwC_pohn8n0vmnOtH3Dre2vPx7Jrtre-0tQelp';

//     const paypalApiEndpoint = 'https://api.paypal.com';

//     const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
//     const headers = {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         Authorization: `Basic ${authHeader}`,
//     };
//     getTransactionIds()
//     // Function to get a list of transaction IDs
//     async function getTransactionIds() {
//         try {
//             const response = await axios.get(`${paypalApiEndpoint}/v2/checkout/orders`, {
//                 headers,
//             });
//             console.log("🚀 ~ file: paypal.js:109 ~ getTransactionIds ~ response:", response)

//             if (response.status === 200) {
//                 const transactionIds = response.data.orders.map(order => order.id);
//                 // console.log('Transaction IDs:', transactionIds);
//                 res.send('--------------Transaction IDs:', transactionIds)
//             } else {
//                 // console.error('Failed to retrieve transaction IDs:', response.data);
//             }
//         } catch (error) {
//             console.log("****************************************🚀 ~ file: paypal.js:117 ~ getTransactionIds ~ error:", error)
//             // console.error('Error while fetching transaction IDs:', error);
//         }
//     }

// });

const paypalApiEndpoint = 'https://api-m.sandbox.paypal.com'//you need to change it to production url:https://api.paypal.com 
let clientId = "ASpFDCXBiKQmG2VnWilfhyLeKqxC6OAYWx8sqXriyPjTbN1Yd7YU2W0kN_zY100GscZI4CBPAyzCFL_x"
let clientSecret = "EJubDelmFRfmxBeAKmYo7qml76gTcpVaLIXipgeK6eRwC_pohn8n0vmnOtH3Dre2vPx7Jrtre-0tQelp"
const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

// payment refund api
const paymentRefund = async (req, res) => {
    try {
        const transactionId = '0VF39698CM7934820';
        const amount = 5.00; // Replace with the refund amount
        const requestBody = {
            amount: {
                currency_code: 'USD', // Add the currency_code parameter
                value: amount, // Replace with the refund amount
            },
        };
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
        };
        const response = await axios.post(
            `${paypalApiEndpoint}/v2/payments/captures/${transactionId}/refund`,
            requestBody,
            { headers }
        );

        if (response.status === 201) {
            console.log('Refund successful:', response.data);
            res.status(200).json({ message: 'Refund successful' });
        } else {
            console.error('Refund failed:', response.data);
            res.status(400).json({ message: 'Refund failed' });
        }
    } catch (error) {
        console.error('Error while processing refund:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    paymentRefund,
    transferFunds,
    success,
    cancel    
};
