var kue			 = require('kue');
var logger 	 = require('morgan');
var mongoose = require('mongoose');
var workers  = require('./workers');

// Ensure all queues are defined on same kue instance. (kue should be a 
// singleton instance cached across all calls to require('kue'), but it doesn't 
// hurt to be cautious.)
workers.init(kue);

// connect to Mongoose
var uriString = process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL || 'mongodb://localhost/web_crawler';

mongoose.connect(uriString, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uriString + '. ' + err);
  } else {
  console.log ('SUCCESS connecting to: ' + uriString);
  }
});

kue.app.use(logger('combined'));

module.exports = kue.app;
