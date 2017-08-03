var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var schema = mongoose.Schema({
	friends: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
	avatarUrl: {type: String, default: '/api/user/default.jpg'},
	username: {type: String, unique: true},
	password: {type: String},
	name: {type: String}
});
schema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
schema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model('User', schema);


