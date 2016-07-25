var request 				= require('request');
var SavedUrlContent = require('../../models/saved_url_content');

const jobsConcurrentlyProcessed = 10;

// This is the callback that actually performs each queued URL save job
function saveUrl(job, done) {
  request(
    job.data.url,
    function(err, res) {
      if(err) return done(err);

      var newData = { html: res.body }, dbQuery = { url: job.data.url };

      // Create new document if none exists with URL; otherwise update document.
      SavedUrlContent.findOneAndUpdate(dbQuery, newData, { upsert: true }, 
        function(err, savedUrlContent) {
          if(err) return done(err);

          job.log(job.data.url + ' HTML content successfully saved');

          done(savedUrlContent);
        }
      );
    }
  );
};

module.exports = function(queue) {
  queue.process('save url', jobsConcurrentlyProcessed, function(job, done) {
    saveUrl(job, done);
  });
};
