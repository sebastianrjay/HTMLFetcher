var kue			 	= require('kue');
var logger 	 	= require('morgan');
var mongoose 	= require('mongoose');
var queues  	= require('./queues');

// Instantiate all queues here by calling the constructor exported by 
// ./queues/index.js. Like other npm packages, kue is cached across the app, so 
// there's no need to pass in the singleton kue instance here.
new queues();

// Connect to MongoDB via Mongoose
var uriString = process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL || 'mongodb://localhost/html_fetcher';

mongoose.connect(uriString, function (err, res) {
  if (err) console.log ('ERROR connecting to: ' + uriString + '. ' + err);
  else console.log ('SUCCESS connecting to: ' + uriString);
});

// Force kue to log messages from its dependencies (and theoretically itself)
kue.app.use(logger('combined'));

// Expose Kue's Express-backed UI and REST API app to ./bin/www start script
module.exports = kue.app;
