var expect 					= require('chai').expect;
var kue							= require('kue');
var mongoose 				= require('mongoose');
var SavedUrlContent = require('../../models/saved_url_content');
var URLSaver 				= require('../../queues/jobs/url_saver');

// Connect to MongoDB test database via Mongoose
var uriString = 'mongodb://localhost/html_fetcher_test';

mongoose.connect(uriString, function (err, res) {
  if (err) console.log ('ERROR connecting to ' + uriString, err);
});

var jobs, queue;
const dummyJob1 = {
	url: "https://google.com"
};
const dummyJob2 = {
  url: "https://nytimes.com"
};

describe('URLSaver', function() {
	before(function() {
		queue = kue.createQueue();
		queue.testMode.enter();
		jobs = queue.testMode.jobs;

		new URLSaver(queue);
		queue.createJob('save url', dummyJob1).save();
		queue.createJob('save url', dummyJob2).priority('high').attempts(3).save();
	});

	it("should successfully add two 'save url' jobs to the queue instance", function() {
		expect(jobs.length).to.equal(2);
		expect(jobs[0].type).to.equal('save url');
		expect(jobs[1].type).to.equal('save url');
	});

	it("should retain data inputted to queued jobs, for use in callbacks", function() {
		expect(jobs[0].data.url).to.equal(dummyJob1.url);
		expect(jobs[1].data.url).to.equal(dummyJob2.url);
	});

	after(function() {
		queue.testMode.clear();
		queue.testMode.exit();
	});
});
