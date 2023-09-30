const express = require('express');
const morgan = require('morgan');
const app = express();

const authJwt = require('./helpers/jwt');


// db connection
const { connect } = require('./dbConnection');

// initliaze env variables
require('dotenv').config();
const API_URL_V1 = process.env.API_URL_V1;

// routes
const productRoutes = require('./routes/productRoutes');
const categoriesRoutes = require("./routes/categoryRoutes");
const usersRoutes = require("./routes/userRoutes");
const ordersRoutes = require("./routes/orderRoutes");





// middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(authJwt());



app.use(`${API_URL_V1}/products`, productRoutes)
app.use(`${API_URL_V1}/categories`, categoriesRoutes);
app.use(`${API_URL_V1}/users`, usersRoutes);
app.use(`${API_URL_V1}/orders`, ordersRoutes);



// db connection
connect();

app.listen(3000, () => {
  console.log(process.env.DB_URI)
  console.log(`Server Version : 1 is running on http://localhost:3000${API_URL_V1}`);
});