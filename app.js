const apiRoutes = require('./api/routes');
const bodyParser = require('body-parser');
const express = require('express');
const kue = require('kue');
const logger = require('morgan');
const mongoose = require('mongoose');
const Queues = require('./queues');

const app = express();

// Instantiate all worker queues here by calling the class method exported by 
// ./queues/index.js. Like other npm packages, kue is cached across the app, so 
// there's no need to pass in the singleton kue instance here.
Queues.build();

// Connect to MongoDB via Mongoose
const dbUriString = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL || 'mongodb://localhost/html_fetcher';

mongoose.connect(dbUriString, (err, res) => {
  if (err) console.info ('ERROR connecting to: ' + dbUriString + '. ' + err);
  else console.info ('SUCCESS connecting to: ' + dbUriString);
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api', apiRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});


module.exports = app;
