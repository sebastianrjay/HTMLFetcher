const express = require('express');
const kue = require('kue');
const router = express.Router();
const SavedUrlContent = require('../../models/saved_url_content');

const queue = kue.createQueue();

const ensurePresenceOfUrl = () => {
	return (req, res, next) => {
		if(!req.body.url) {
			return res.status(400).json({ error: 'Request body must contain url' });
		}

		next();
	}
};

const handleErr = (res, message, code) => {
  console.error("ERROR: " + message);
  res.status(code || 500).json({ error: message });
};

// View all SavedUrlContent docs as JSON; optionally pass URL for specific doc
router.get('/', (req, res, next) => {
	const dbQuery = (req.body.url ? { url: req.body.url } : {});
	
	SavedUrlContent.find(dbQuery).exec().then(
		savedUrlContents => res.status(200).json(savedUrlContents),
		err => handleErr(res, err.message)
	);
});

// View single SavedUrlContent doc as JSON, by URL
router.post('/results', ensurePresenceOfUrl(), (req, res, next) => {
	SavedUrlContent.findOne({ url: req.body.url }).exec().then(
		savedUrlContent => res.status(200).json(savedUrlContent),
		err => handleErr(res, err.message)
	);
});

// View job status corresponding to a SavedUrlContent doc, by URL
router.post('/status', ensurePresenceOfUrl(), (req, res, next) => {
	SavedUrlContent.findOne({ url: req.body.url }, (err, savedUrlContent) => {
		if(err) return handleErr(res, err.message);

		kue.Job.get(savedUrlContent.jobId, (err, job) => {
	    if(err) return handleErr(res, err.message);

	    res.status(200).json(job);
	  });
	});
});

// Create a new 'save url' job, that eventually creates a new SavedUrlContent doc
// NOTE: this is also the update endpoint. When the same URL is POSTed again,
// the app will create a new 'save url' job instance with that URL, fetch the 
// HTML again, and later findOneAndUpdate the corresponding doc (or create it if
// it doesn't exist).
router.post('/', ensurePresenceOfUrl(), (req, res, next) => {
	let errorOccurred = false;

	const job = queue.create('save url', {
		url: req.body.url
	}).priority(req.body.priority || 'high')
		.attempts(req.body.attempts || 3)
		.save((err, job) => {
			if(err) errorOccurred = true;
		});

	if(errorOccurred) handleErr(res, "Unable to create new 'save url' job");
	else res.status(200).json(job);
});

// Delete a SavedUrlContent doc (and its corresponding job) by URL (hook deletes job)
router.delete('/', ensurePresenceOfUrl(), (req, res, next) => {
	SavedUrlContent.findOne({ url: req.body.url }, (err, savedUrlContent) => {
		if(err) return handleErr(res, err.message);

		savedUrlContent.remove().then(
			removedDoc => res.status(200).json(removedDoc),
			err => handleErr(res, err.message)
		);
	})
});

module.exports = router;
