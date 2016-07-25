var request 				= require('request');
var SavedUrlContent = require('../../models/saved_url_content');

const stuckJobWatchInterval = 2000, jobsConcurrentlyProcessed = 10;

exports = module.exports = {};

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

exports.init = function(kue) {
  var urlSaverQueue = kue.createQueue();

  urlSaverQueue.watchStuckJobs(stuckJobWatchInterval);

  urlSaverQueue.on('ready', function() {  
    console.info('URL saver queue is ready!');
  });

  urlSaverQueue.on('error', function(err) {  
    console.error('There was an error in the URL saver queue.');
    console.error(err);
    console.error(err.stack);
  });

  urlSaverQueue.process('save url', jobsConcurrentlyProcessed, function(job, done) {
    saveUrl(job, done);
  });
};
