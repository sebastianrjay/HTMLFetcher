var urlSaver = require('./queues/url_saver');
// Require other worker queues here

module.exports = {
	init: function(kue) {
		// Define each worker queue on singleton kue instance
		urlSaver.init(kue);
	}
}