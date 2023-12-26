require("dotenv").config();

const app = require('express')();
var http = require('http').Server(app);

const paymentRoute = require('./routes/paymentRoute');
const paypalRoute = require('./routes/paypalRoute');

app.use('/',paymentRoute);
app.use('/paypal',paypalRoute);

http.listen(3000, function(){
    console.log('Server is running');
});