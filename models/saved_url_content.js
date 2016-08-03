const kue = require('kue');
const mongoose = require('mongoose');

const SavedUrlContent = new mongoose.Schema({
	url: { type: String, required: true, index: true },
	html: String,
	jobId: Number
},
{
	timestamps: true
});

SavedUrlContent.post('remove', (savedUrlContent, next) => {
	kue.Job.remove(savedUrlContent.jobId, (err) => {
    if (err) return next(err);

    console.info(`Removed save url job with id ${savedUrlContent.jobId}`);
    next();
  });
});

module.exports = mongoose.model('SavedUrlContent', SavedUrlContent);
