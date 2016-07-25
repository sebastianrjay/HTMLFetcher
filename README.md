# About
This repository contains Sebastian Jay's Massdrop coding challenge submission.

# Description
This is a Node.js worker queue application that retrieves a website's URL content and saves it to the DB. It relies heavily on [Kue](https://github.com/Automattic/kue), a feature-rich worker queue library for Node.js.

# Directions
1. Assuming MongoDB and its driver are [installed](https://docs.mongodb.com/manual/installation/), run `mongod` in a terminal tab or window to start the MongoDB driver.
2. Assuming [Redis is installed](http://redis.io/topics/quickstart), run `redis-server` in another terminal tab or window.
3. Open a new terminal tab or window and navigate to the root directory of this 
project. Run `npm install` to install this app's required npm packages.
4. Once `npm install` runs successfully, start the local Node server by running 
`npm start`.
5. In a fourth terminal window/tab, make a CURL POST request to `localhost:3000/job` to create a new job. **In this app, only one type of job can be created. It is called 'save url'. Its only required parameter is the URL you wish to fetch.** Example:

```bash
curl -H "Content-Type: application/json" -X POST -d \
    '{
       "type": "save url",
       "data": {
         "url": "https://nytimes.com"
       },
       "options" : {
         "attempts": 3,
         "priority": "high"
       }
     }' http://localhost:3000/job
```

On successful job creation, the curl response should look something like:
```bash
{ "message": "job created", "id": 23 }
```

Open [localhost:3000](http://localhost:3000) in your browser to view the Kue UI, which displays all currently tracked jobs and their statuses. You can also retry or remove jobs.

Check out the [Kue JSON API docs](https://github.com/Automattic/kue#json-api) for instructions on additional CRUD operations. Each URI is appended to [localhost:3000](http://localhost:3000), or wherever you deploy this app, if you choose to deploy it.

# Tests
To run the tests, simply run `npm test` after completing the directions above.

**NOTE: Redis must be running, as per the above instructions.**

# Notes
The latest Kue build is failing, so I had to use version 0.11.0 instead of 
0.11.1.
