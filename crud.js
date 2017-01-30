var TwitterStrategy = require('passport-twitter').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = require(__dirname+'/schema.js');
var api = '/api/user';
module.exports = function(app, express, sd) {
	// Initialize
		var router = express.Router();
		app.use(api, router);
		if(mongoose.connection.readyState==0){
			mongoose.connect(sd.mongoUrl);
		}
		sd.User = User;
		sd.passport.serializeUser(function(user, done) {
			done(null, user.id);
		});
		sd.passport.deserializeUser(function(id, done) {
			User.findById(id, function(err, user) {
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
			User.remove({
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
				req.user.avatarUrl = '/api/user/avatar/'+fileName;
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
			socket.on('MineUserUpdated', function(user){
				socket.broadcast.to(socket.request.user._id).emit('MineUserUpdated', user);
			});
			socket.on('MineUserDeleted', function(user){
				socket.broadcast.to(socket.request.user._id).emit('MineUserDeleted', user);
			});
		});
	// Twitter
		sd.passport.use(new TwitterStrategy({
			consumerKey: sd.config.passport.twitter.consumerKey,
			consumerSecret: sd.config.passport.twitter.consumerSecret,
			callbackURL: "/api/user/twitter/callback"
		},function(token, tokenSecret, profile, done) {
			process.nextTick(function() {
				User.findOne({
					'twitter.id': profile.id
				}, function(err, user) {
					if (err) return done(err);
					else if (user) return done(null, user);
					else {
						var newUser = new User();
						newUser.twitter = {
							displayName : profile.displayName,
							username : profile.username,
							id : profile.id,
							token : token,
						}
						newUser.save(function(err) {
							console.log(newUser);
							if (err) throw err;
							return done(null, newUser);
						});
					}
				});
			});
		}));
		router.get('/twitter', sd.passport.authenticate('twitter'));
		router.get('/twitter/callback',
		sd.passport.authenticate('twitter', {
			successRedirect: sd.config.passport.twitter.successRedirect,
			failureRedirect: sd.config.passport.twitter.failureRedirect
		}),function(req, res) {
			res.redirect(sd.config.passport.twitter.successRedirect);
		});
	// Login
		router.post('/login', sd.passport.authenticate('local-login', {
			successRedirect: sd.config.passport.local.successRedirect,
			failureRedirect: sd.config.passport.local.failureRedirect
		}));
		sd.passport.use('local-login', new LocalStrategy({
			usernameField : 'username',
			passwordField : 'password',
			passReqToCallback : true
		}, function(req, username, password, done) {
			User.findOne({
				'email' :  username.toLowerCase()
			}, function(err, user) {
				if (err) return done(err);
				if (!user) return done(null, false);
				if (!user.validPassword(password)) return done(null, false);
				return done(null, user);
			});
		}));
	// Sign up
		router.post('/signup', sd.passport.authenticate('local-signup', {
			successRedirect: sd.config.passport.local.successRedirect,
			failureRedirect: sd.config.passport.local.failureRedirect
		}));
		sd.passport.use('local-signup', new LocalStrategy({
			usernameField : 'username',
			passwordField : 'password',
			passReqToCallback : true
		}, function(req, username, password, done) {
			User.findOne({
				'email': username.toLowerCase()
			}, function(err, user) {
				if (err) return done(err);
				if (user) return done(null, false);
				else {
					var newUser = new User();
					newUser.email = username;
					newUser.password = newUser.generateHash(password);
					newUser.save(function(err) {
						if (err) throw err;
						return done(null, newUser);
					});
				}
			});
		}));
	// End of Crud
};