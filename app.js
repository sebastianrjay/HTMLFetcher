var kue			 	= require('kue');
var logger 	 	= require('morgan');
var mongoose 	= require('mongoose');
var queues  	= require('./queues');

// Instantiate all queues here by calling constructor exported by ./queues/index
new queues();

// Connect to MongoDB via Mongoose
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
