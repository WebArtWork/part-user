var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var schema = mongoose.Schema({
	email: {type: String, unique: true, sparse: true, trim: true},
	reg_email: {type: String, unique: true, sparse: true, trim: true},
	/*
	*	Auth Management
	*/
	is: {},
	kind: {},
	architect: [{
		name: String,
		what: {type: String, enum: ['text', 'bool', 'number']}
	}],
	/*
	*	Custom Updateable fields
	*/
	password: {type: String},
	avatarUrl: {type: String, default: '/api/user/default.png'},

	/*
	*	Follow Management
	*/
	followings: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
	followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
	/*
	*	Updatable fields
	*/
	gender: {type: String, enums: ['male', 'female'], sparse: true},
	name: {type: String},
	birth: {type: Date},
	skills: [{type: String, enum: ['cooking','fishing','painting']}],
	data: {}
});
schema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
schema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model('User', schema);