const express = require('express');
const kue = require('kue');
const router = express.Router();
const SavedUrlContent = require('../../models/saved_url_content');

const queue = kue.createQueue();

const requirePresenceOfUrl = (req, next) => {
	if(!req.body.url) next(new Error('Request body must contain url'));
};

// View all SavedUrlContent docs as JSON
router.get('/', (req, res, next) => {
	const dbQuery = (req.body.url ? { url: req.body.url } : {});

	SavedUrlContent.find(dbQuery, (err, savedUrlContents) => {
		if(err) return next(err);

		res.status(200).json(savedUrlContents);
	});
});

// View single SavedUrlContent doc as JSON, by URL
router.post('/results', (req, res, next) => {
	requirePresenceOfUrl(req, next);

	SavedUrlContent.findOne({ url: req.body.url }, (err, savedUrlContent) => {
		if(err) return next(err);

		res.status(200).json(savedUrlContent);
	});
});

// View job status corresponding to a SavedUrlContent doc, by URL
router.post('/status', (req, res, next) => {
	requirePresenceOfUrl(req, next);

	SavedUrlContent.findOne({ url: req.body.url }, (err, savedUrlContent) => {
		if(err) return next(err);

		kue.Job.get(savedUrlContent.jobId, (err, job) => {
	    if(err) return next(err);

	    res.status(200).json(job);
	  });
	});
});

// Create a new 'save url' job, that eventually creates a new SavedUrlContent doc
// NOTE: this is also the update endpoint. When the same URL is POSTed again,
// the app will create a new 'save url' job instance with that URL, fetch the 
// HTML again, and later findOneAndUpdate the corresponding doc (or create it if
// it doesn't exist).
router.post('/', (req, res, next) => {
	requirePresenceOfUrl(req, next);

	const job = queue.create('save url', {
		url: req.body.url
	}).priority(req.body.priority || 'high')
		.attempts(req.body.attempts || 3)
		.save(err => {
			if(err) return next(err);
	});

	res.status(200).json(job);
});

// Delete a SavedUrlContent doc (and its corresponding job) by URL (hook deletes job)
router.delete('/', (req, res, next) => {
	requirePresenceOfUrl(req, next);

	SavedUrlContent.findOne({ url: req.body.url }, (err, savedUrlContent) => {
		if(err) return next(err);

		savedUrlContent.remove().then(
			removedDoc => res.status(200).json(removedDoc),
			err => next(err)
		);
	})
});

module.exports = router;
