const express = require('express');

const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//  Middlewares
app.use(morgan('dev')); // middleware for logging data to console
app.use(express.json());

// We use version with api so as in future versions if updates are done the existing version is not broken.

app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

module.exports = app;
