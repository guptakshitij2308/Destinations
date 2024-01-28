const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

// 1) Middlewares
app.use(morgan('dev')); // middleware for logging data to console
app.use(express.json());

const port = 3000;

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// 2) Route Handlers

const getAllTours = (req, res) => {
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
};

const getTour = (req, res) => {
  const id = +req.params.id;

  if (id > tours.length - 1) {
    return res.status(404).json({ status: 'fail', message: 'Invalid Id' });
  }

  const tour = tours.find((tour) => tour.id === id);
  res.status(200).json({ status: 'success', data: { tour } });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (!err)
        res.status(201).json({ status: 'success', data: { tour: newTour } });
      else
        res
          .status(500)
          .json({ status: 'error', message: 'Error creating tour.' });
    }
  );
};

const updateTour = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet implemented.' });
};
const deleteTour = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet implemented.' });
};
const getAllUsers = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet implemented.' });
};
const getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet implemented.' });
};
const createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet implemented.' });
};
const deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet implemented.' });
};
const updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet implemented.' });
};

// 3) Routes

// We use version with api so as in future versions if updates are done the existing version is not broken.

app.route('/api/v1/tours').get(getAllTours).post(createTour);

// For optional parameter add a question mark at the end like :id?
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.route('/api/v1/users').get(getAllUsers).post(createUser);

app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// 4) Start server

app.listen(port, function () {
  console.log(`Server running on port ${port}`);
});

// Representational states transfer ( Rest apis are stateless : state handled entirely on client and not on server )
// Enveloping of responses ( dsend )
