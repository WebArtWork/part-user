var TwitterStrategy = require('passport-twitter').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var CNAME = require(__dirname+'/schema.js');
var api = '/api/NAME';
module.exports = function(app, express, sd) {
	// Initialize
		var router = express.Router();
		app.use(api, router);
		if(mongoose.connection.readyState==0){
			mongoose.connect(sd.mongoUrl);
		}
		sd.CNAME = CNAME;
		sd.passport.serializeUser(function(user, done) {
			done(null, user.id);
		});
		sd.passport.deserializeUser(function(id, done) {
			CNAME.findById(id, function(err, user) {
				done(err, user);
			});
		});
	// Support
		var ensure = function(req, res, next){
			if(req.user) next();
			else res.json(false);
		}
	// Routes
		router.post("/update", ensure, function(req, res) {
			req.user.update(req.body, function(err){
				if(err) return res.json(false);
				res.json(true);
			});
		});
		router.post("/delete", ensure, function(req, res) {
			CNAME.remove({
				_id: req.body._id
			}, function(err){
				req.logout();
				if(err) res.json(false);
				else res.json(true);
			});
		});
		router.post('/logout', function(req, res) {
			req.logout();
			res.json(true);
		});
		router.post("/changePassword", ensure, function(req, res) {
			if (!req.user.validPassword(req.body.oldPass)){
				req.user.password = req.user.generateHash(req.body.newPass);
				req.user.save(function(){
					res.json(true);
				});
			}else res.json(false);
		});
		router.post("/addLocalAccount", ensure, function(req, res) {
			if(!req.user.email){
				req.user.email = req.body.email;
				req.user.password = req.user.generateHash(req.body.password);
				req.user.save(function(){
					res.json(true);
				});
			}else res.json(false);
		});
		router.post("/changeAvatar", ensure, function(req, res) {
			var base64Data = req.body.dataUrl.replace(/^data:image\/png;base64,/,'').replace(/^data:image\/jpeg;base64,/,'');
			var decodeData=new Buffer(base64Data,'base64');
			var fileName = req.user.email + "_" + Date.now() + '.png';
			fs.writeFile(__dirname + '/client/files/' + fileName, decodeData, function(err) {
				req.user.avatarUrl = '/api/NAME/avatar/'+fileName;
				req.user.save(function(){
					res.json(req.user.avatarUrl);
				});
			});
		});
		router.get("/avatar/:file", function(req, res) {
			res.sendFile(__dirname + '/client/files/' + req.params.file);
		});
		router.get("/default.jpg", function(req, res) {
			res.sendFile(__dirname + '/client/img/avatar.jpg');
		});
	// Socket Management
		sd.io.on('connection', function(socket) {
			if(socket.request.user._id) socket.join(socket.request.user._id);
			socket.on('MineCNAMEUpdated', function(user){
				socket.broadcast.to(socket.request.user._id).emit('MineCNAMEUpdated', user);
			});
			socket.on('MineCNAMEDeleted', function(user){
				socket.broadcast.to(socket.request.user._id).emit('MineCNAMEDeleted', user);
			});
		});
	// End of Crud
};