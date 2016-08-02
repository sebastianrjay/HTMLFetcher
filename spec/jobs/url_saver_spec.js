const expect 					= require('chai').expect;
const kue							= require('kue');
const mongoose 				= require('mongoose');
const SavedUrlContent = require('../../models/saved_url_content');
const URLSaver 				= require('../../queues/jobs/url_saver');

// Connect to MongoDB test database via Mongoose
const dbUriString = 'mongodb://localhost/html_fetcher_test';

mongoose.connect(dbUriString, (err, res) => {
  if (err) console.info ('ERROR connecting to ' + dbUriString, err);
  else console.info ('SUCCESS connecting to: ' + dbUriString);
});

let jobs, queue;
const dummyJob1 = { url: 'https://google.com' };
const dummyJob2 = { url: 'https://nytimes.com' };

describe('URLSaver', () => {
	before(() => {
		queue = kue.createQueue();
		queue.testMode.enter();
		jobs = queue.testMode.jobs;

		new URLSaver(queue);
		queue.createJob('save url', dummyJob1).save();
		queue.createJob('save url', dummyJob2).priority('high').attempts(3).save();
	});

	it("should successfully add two 'save url' jobs to the queue instance", () => {
		expect(jobs.length).to.equal(2);
		expect(jobs[0].type).to.equal('save url');
		expect(jobs[1].type).to.equal('save url');
	});

	it("should retain data inputted to queued jobs, for use in callbacks", () => {
		expect(jobs[0].data.url).to.equal(dummyJob1.url);
		expect(jobs[1].data.url).to.equal(dummyJob2.url);
	});

	after(() => {
		queue.testMode.clear();
		queue.testMode.exit();
	});
});
