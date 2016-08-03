/* eslint-disable import/no-extraneous-dependencies, no-undef, one-var,
one-var-declaration-per-line */
const expect = require('chai').expect;
const kue	= require('kue');
const URLSaver = require('../../queues/jobs/url_saver');

let jobs, queue;
const dummyJob1 = { url: 'https://google.com' };
const dummyJob2 = { url: 'https://nytimes.com' };

describe('URLSaver', () => {
	before(() => {
		queue = kue.createQueue();
		queue.testMode.enter();
		jobs = queue.testMode.jobs;

		URLSaver.create(queue);
		queue.createJob('save url', dummyJob1).save();
		queue.createJob('save url', dummyJob2).priority('high').attempts(3).save();
	});

	it("should successfully add two 'save url' jobs to the queue instance", () => {
		expect(jobs.length).to.equal(2);
		expect(jobs[0].type).to.equal('save url');
		expect(jobs[1].type).to.equal('save url');
	});

	it('should retain data inputted to queued jobs, for use in callbacks', () => {
		expect(jobs[0].data.url).to.equal(dummyJob1.url);
		expect(jobs[1].data.url).to.equal(dummyJob2.url);
	});

	after(() => {
		queue.testMode.clear();
		queue.testMode.exit();
	});
});
