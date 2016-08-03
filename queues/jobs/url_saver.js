const request 				= require('request');
const SavedUrlContent = require('../../models/saved_url_content');

const jobsConcurrentlyProcessed = 10;

// This is the callback that actually performs each queued URL save job
const saveUrl = (job, done) => {
  request(
    job.data.url,
    (reqErr, res) => {
      if (reqErr) return done(reqErr);

      const dbQuery = { url: job.data.url };
      const newData = { html: res.body, jobId: job.id };

      // Create new document if none exists with URL; otherwise update document.
      SavedUrlContent.findOneAndUpdate(dbQuery, newData, { upsert: true },
        (fetchErr, savedUrlContent) => {
          if (fetchErr) return done(fetchErr);

          job.log(`${job.data.url} HTML content successfully fetched and saved`);

          done(savedUrlContent);
        }
      );
    }
  );
};

class URLSaver {
  static create (queue) {
    queue.process('save url', jobsConcurrentlyProcessed, (job, done) => {
      saveUrl(job, done);
    });
  }
}

module.exports = URLSaver;
