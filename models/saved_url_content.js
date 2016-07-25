var mongoose = require('mongoose');

var SavedUrlContent = new mongoose.Schema({
	url: { type: String, required: true, index: true },
	html: String
},
{ 
	timestamps: true 
});

module.exports = mongoose.model('SavedUrlContent', SavedUrlContent);
