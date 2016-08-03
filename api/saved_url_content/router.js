const express = require('express');
const kue = require('kue');
const _ = require('lodash');
const SavedUrlContent = require('../../models/saved_url_content');

const router = express.Router();
const queue = kue.createQueue();

// Works on req params and body; more effective for body, since missing params
// result in 404 from previous error handler
const ensureReqHasAttr = (attr) => (
	(req, res, next) => {
		if (!_.has(req, attr)) {
			return res.status(400).json({ error: `Request must contain ${attr}` });
		}

		next();
	}
);

const handleErr = (res, message, code) => {
	console.error(`ERROR: ${message}`);
	res.status(code || 500).json({ error: message });
};

// View all SavedUrlContent docs as JSON; optionally pass URL for specific doc
router.get('/', (req, res) => {
	SavedUrlContent.find().exec().then(
		savedUrlContents => res.status(200).json(savedUrlContents),
		err => handleErr(res, err.message)
	);
});

// View single SavedUrlContent doc as JSON, by URL
router.get('/:jobId/results', ensureReqHasAttr('params.jobId'), (req, res) => {
	SavedUrlContent.findOne({ jobId: req.params.jobId }).exec().then(
		savedUrlContent => res.status(200).json(savedUrlContent),
		err => handleErr(res, err.message)
	);
});

// View job status corresponding to a SavedUrlContent doc, by URL
router.get('/:jobId/status', ensureReqHasAttr('params.jobId'), (req, res) => {
	kue.Job.get(req.params.jobId, (err, job) => {
		if (err) return handleErr(res, err.message);

		res.status(200).json(job);
	});
});

// Create a new job with the URL, or run that job again (and automatically
// update the MongoDB SavedUrlContent doc with new job results and jobId)
router.post('/', ensureReqHasAttr('body.url'), (req, res) => {
	const job = queue
		.create('save url', { url: req.body.url })
		.priority(req.body.priority || 'high')
		.attempts(req.body.attempts || 3)
		.save(err => {
			if (err) return handleErr(res, "Unable to create new 'save url' job");

			res.status(201).json(job);
		});
});

// Delete a SavedUrlContent doc (and its corresponding job) by URL (hook deletes
// job). Using Mongoose's findOneAndRemove disables its post('remove') hook
router.delete('/:jobId', ensureReqHasAttr('params.jobId'), (req, res) => {
	SavedUrlContent.findOne({ jobId: req.params.jobId }, (err, savedUrlContent) => {
		if (err) return handleErr(res, err.message);
		if (!savedUrlContent) return handleErr(res, 'Invalid job id', 422);

		savedUrlContent.remove().then(
			() => res.sendStatus(204),
			removeErr => handleErr(res, removeErr.message)
		);
	});
});

module.exports = router;
