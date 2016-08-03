# About
This repository contains Sebastian Jay's Massdrop coding challenge submission.

# Description
This is a Node.js worker queue application that retrieves a website's URL content and saves it to the DB. It relies heavily on [Kue](https://github.com/Automattic/kue), a feature-rich worker queue library for Node.js.

# Setup Directions
1. Assuming MongoDB and its driver are [installed](https://docs.mongodb.com/manual/installation/), run `mongod` in a terminal tab or window to start the MongoDB driver.
2. Assuming nvm and npm are [installed](https://github.com/creationix/nvm), run `nvm use` from the project root directory to use the proper Node.js version.
3. Assuming [Redis is installed](http://redis.io/topics/quickstart), run `redis-server` in another terminal tab or window.
4. Open a new terminal tab or window and navigate to the root directory of this 
project. Run `npm install` to install this app's required npm packages.
5. Once `npm install` runs successfully, start the local Node server by running 
`npm start`.

# REST API
**In this app, only one type of job can be created. It is called 'save url'. Once processed (i.e. executed), it fetches the HTML from the passed-in URL and upserts it into the MongoDB database. Note that the job corresponding to a particular document is deleted when the document is deleted, in a Mongoose post-remove hook.**

1. Create a new job with the URL, or run that job again (and automatically update the MongoDB SavedUrlContent doc with new job results and jobId). URL parameter is required.

```bash
curl -H "Content-Type: application/json" -X POST -d '{ "url": "https://www.google.com" }' http://localhost:3000/api/saved_url_content
```

2. To view the status of a job (JSON response includes job id, to be used with below endpoints):

```bash
curl -H "Content-Type: application/json" -X GET http://localhost:3000/api/saved_url_content/:jobId/status
```

3. To view the DB document corresponding to a job (i.e. the document in the database corresponding to the URL), regardless of completion:

```bash
curl -H "Content-Type: application/json" -X GET -d '{ "url": "https://www.google.com" }' http://localhost:3000/api/saved_url_content/:jobId/results
```

4. To view all DB documents corresponding to the save url job:

```bash
curl -H "Content-Type: application/json" -X GET -d '{ "url": "https://www.google.com" }' http://localhost:3000/api/saved_url_content/
```

5. To delete a job with a jobId, and delete its corresponding document from the DB:

```bash
curl -H "Content-Type: application/json" -X DELETE http://localhost:3000/api/saved_url_content/:jobId
```

On successful job creation, the curl response should look something like:
```bash
{ "message": "job created", "id": 23 }
```

Open [localhost:3000/api/kue](http://localhost:3000/api/kue) in your browser to view the Kue UI, which displays all currently tracked jobs and their statuses. You can also retry or remove jobs.

Check out the [Kue JSON API docs](https://github.com/Automattic/kue#json-api) for instructions on additional CRUD operations via Kue's native REST API. Each URI is appended to [localhost:3000/api/kue](http://localhost:3000/api/kue), or wherever you deploy this app, if you choose to deploy it.

# Tests
To run the tests, simply run `npm test` after completing the directions above.

**NOTE: Redis must be running, as per the above instructions.**

# Notes
The latest Kue build is failing, so I had to use version 0.11.0 instead of 
0.11.1.

I tried to combine job status and results into a single input with a Mongoose .post('init') hook, but couldn't get the hook to properly mutate the document in limited time.
