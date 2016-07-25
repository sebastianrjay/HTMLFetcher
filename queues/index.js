var jobs = {
	'URL saver': require('./jobs/url_saver')
	// Require other background jobs here
};
var kue = require('kue');

// For simplicity, assume each job type receives its own queue. This may not be 
// desirable in a larger application with more jobs, and more complex jobs.
module.exports = function() {
	for(var jobName in jobs) {
		var Job = jobs[jobName];
		var queue = kue.createQueue();

		new Job(queue);

		queue.watchStuckJobs();

	  queue.on('ready', function() {  
	    console.info(jobName + ' queue is ready!');
	  });

	  queue.on('error', function(err) {  
	    console.error('There was an error in the ' + jobName + ' queue.');
	    console.error(err);
	    console.error(err.stack);
	  });
	}
}
