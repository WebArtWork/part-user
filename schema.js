var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var schema = mongoose.Schema({
	email: {type: String, unique: true},
	password: {type: String},
	name: {type: String},
	avatarUrl: {type: String, default: '/api/NAME/default.jpg'},
	userUrl: {type: String},
	isAdmin: {type: Boolean, default: false},
	twitter: {
		displayName: String,
		username: String,
		token: String,
		id: String
	}
});
schema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
schema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};
schema.methods.update = function(obj, callback) {
	this.name = obj.name;
	this.save(callback);
};
module.exports = mongoose.model('CNAME', schema);
