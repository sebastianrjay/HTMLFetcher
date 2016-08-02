const jobs = {
	'URL saver': require('./jobs/url_saver')
	// Require other background jobs here
};
const kue = require('kue');

class Queues {
	// For simplicity, assume each job type receives its own queue. This may not 
	// be desirable in a larger application with more jobs, and more complex jobs.
	static build () {
		for(let jobName in jobs) {
			const Job = jobs[jobName];
			const queue = kue.createQueue();

			new Job(queue);

			queue.watchStuckJobs();

		  queue.on('ready', () => {  
		    console.info(jobName + ' queue is ready!');
		  });

		  queue.on('error', err => {  
		    console.error('There was an error in the ' + jobName + ' queue.');
		    console.error(err);
		    console.error(err.stack);
		  });
		}
	}
}

module.exports = Queues;
