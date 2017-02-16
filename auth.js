var TwitterStrategy = require('passport-twitter').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var VKontakteStrategy= require('passport-vkontakte').Strategy;
var OdnoklassnikiStrategy= require('passport-odnoklassniki').Strategy;
var InstagramStrategy= require('passport-instagram').Strategy;

var CNAME = require(__dirname+'/schema.js');
var api = '/api/NAME';
module.exports = function(app, express, sd) {
	// Initialize
		var router = express.Router();
		app.use(api, router);
	// Google
		if (sd.config.passport.google) {
			router.get('/google', sd.passport.authenticate('google', {
				scope: ['profile', 'email']
			}));
			router.get('/google/callback', sd.passport.authenticate('google', {
				successRedirect: '/',
				failureRedirect: '/'
			}));
			sd.passport.use('google', new GoogleStrategy({
				clientID: sd.config.passport.google.clientID,
				clientSecret: sd.config.passport.google.clientSecret,
				callbackURL: sd.config.passport.google.callbackURL,
				passReqToCallback: true
			}, function(req, token, refreshToken, profile, done) {
				CNAME.findOne({
					_id: req.user._id
				}, function(err, NAME) {
					if (err) return done(err);
					if (NAME) {
						var google = {};
						google.id = profile.id;
						google.url = profile._json.url;
						req.user.saveGoogle(google, function() {});
						return done(null, NAME);
					}
				});
			}));
		}
	// Odnoklasniki
		if(sd.config.passport.odnoklassnikiAuth){
			router.get('/odnoklassniki', sd.passport.authenticate('odnoklassniki', {
				layout: 'w',
				scope: ['uid', 'user_checkins']
			}));
			router.get('/odnoklassniki/callback', sd.passport.authenticate('odnoklassniki', {
				successRedirect: '/',
				failureRedirect: '/'
			}), function(req, res) {
				res.redirect('/');
			});
			sd.passport.use('odnoklassniki',new OdnoklassnikiStrategy({
				clientID : sd.config.passport.odnoklassnikiAuth.clientID,
				clientPublic: sd.config.passport.odnoklassnikiAuth.clientPublic,
				clientSecret : sd.config.passport.odnoklassnikiAuth.clientSecret,
				callbackURL : sd.config.passport.odnoklassnikiAuth.callbackURL,
				passReqToCallback:true
			}, function (req, accessToken, refreshToken, profile, done) {
				CNAME.findOne({
					_id: req.user._id
				}, function(err, NAME) {
					if (err) return done(err);
					if (NAME) {
						var odnoklassniki = {};
						odnoklassniki.profileUrl = profile.profileUrl;
						odnoklassniki.id = profile.id;
						req.user.saveOdnoklassniki(odnoklassniki, function() {});
						return done(null, NAME);
					}
				});
			}));	
		}
	// Instagram
		if(sd.config.passport.instagram){
			router.get('/instagram',
				sd.passport.authenticate('instagram')
			);
			router.get('/instagram/callback', sd.passport.authenticate('instagram', {
				failureRedirect: '/login'
			}), function(req, res) {
				res.redirect('/');
			});
			sd.passport.use('instagram',new InstagramStrategy({
				clientID : sd.config.passport.instagram.clientID,
				clientSecret : sd.config.passport.instagram.clientSecret,
				callbackURL : sd.config.passport.instagram.callbackURL,
				passReqToCallback:true
			}, function (req, accessToken, refreshToken, profile, done) {
				CNAME.findOne({
					_id: req.user._id
				}, function(err, NAME) {
					if (err) return done(err);
					if (NAME) {
						var instagram = {};
						instagram.id = profile.id;
						instagram.username = profile.username;
						req.user.saveInstagram(instagram, function() {});
						return done(null, NAME);
					}
				});
			}));
		}
	// Vk
		if(sd.config.passport.vkontakte){
			sd.passport.use('vkontakte',new VKontakteStrategy({
				clientID : sd.config.passport.vkontakte.clientID,
				clientSecret : sd.config.passport.vkontakte.clientSecret,
				callbackURL : sd.config.passport.vkontakte.callbackURL,
				passReqToCallback:true
			}, function (req,accessToken, refreshToken, profile, done) {
				CNAME.findOne({
					 _id:req.user._id
				}, function (err, NAME) {
					if (err) return done(err);
					if (NAME) {
						var vkontakte={};
						vkontakte.id=profile.id;
						vkontakte.profileUrl=profile.profileUrl;
						req.user.saveVkontakte(vkontakte,function(){
						});
						return done(null, NAME);
					}
				});
			}));
			router.get('/vkontakte', sd.passport.authenticate('vkontakte', {
				display: 'page',
				scope: 'email'
			}));
			router.get('/vkontakte/callback', sd.passport.authenticate('vkontakte', {
				successRedirect: sd.config.passport.vkontakte.successRedirect,
				failureRedirect: sd.config.passport.vkontakte.failureRedirect
			}), function(req, res) {
				res.redirect('/');
			});
		}
	// Facebook
		if(sd.config.passport.facebook){
			router.get('/facebook', sd.passport.authenticate('facebook', {
				display: 'page',
				scope: 'email'
			}));
			router.get('/facebook/callback', sd.passport.authenticate('facebook', {
				failureRedirect: '/login'
			}), function(req, res) {
				res.redirect('/');
			});
			sd.passport.use('facebook',new FacebookStrategy({
				clientID: sd.config.passport.facebook.clientID,
				clientSecret: sd.config.passport.facebook.clientSecret,
				callbackURL: sd.config.passport.facebook.callbackURL,
				profileFields: ['id', 'profileUrl'],
				passReqToCallback:true
			}, function (req,token, refreshToken, profile, done) {
				console.log(profile);
				CNAME.findOne({
					 _id:req.user._id
				 },
				  function (err, NAME) {
					if (err)return done(err);
					if (NAME) {
						var facebook={};
						facebook.profileUrl=profile.profileUrl;
						facebook.id=profile.id;
						req.user.saveFacebook(facebook,function(){
						});
						return done(null, NAME);
					}
				});
			}));
		}
	// Twitter
		if(sd.config.passport.twitter){
			sd.passport.use(new TwitterStrategy({
				consumerKey: sd.config.passport.twitter.consumerKey,
				consumerSecret: sd.config.passport.twitter.consumerSecret,
				callbackURL: sd.config.passport.twitter.callbackURL
			},function(token, tokenSecret, profile, done) {
				process.nextTick(function() {
					CNAME.findOne({
						'twitter.id': profile.id
					}, function(err, NAME) {
						if (err) return done(err);
						else if (NAME) return done(null, NAME);
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
			router.get('/twitter/callback', sd.passport.authenticate('twitter', {
				successRedirect: sd.config.passport.twitter.successRedirect,
				failureRedirect: sd.config.passport.twitter.failureRedirect
			}),function(req, res) {
				res.redirect(sd.config.passport.twitter.successRedirect);
			});
		}
	// Login
		if(sd.config.passport.local){
			router.post('/login', sd.passport.authenticate('local-login', {
				successRedirect: sd.config.passport.local.successRedirect,
				failureRedirect: sd.config.passport.local.failureRedirect
			}));
			sd.passport.use('local-login', new LocalStrategy({
				usernameField : 'username',
				passwordField : 'password',
				passReqToCallback : true
			}, function(req, username, password, done) {
				CNAME.findOne({
					'email' :  username.toLowerCase()
				}, function(err, NAME) {
					if (err) return done(err);
					if (!user) return done(null, false);
					if (!user.validPassword(password)) return done(null, false);
					return done(null, NAME);
				});
			}));
		}
	// Sign up
		if(sd.config.passport.local){
			router.post('/signup', sd.passport.authenticate('local-signup', {
				successRedirect: sd.config.passport.local.successRedirect,
				failureRedirect: sd.config.passport.local.failureRedirect
			}));
			sd.passport.use('local-signup', new LocalStrategy({
				usernameField : 'username',
				passwordField : 'password',
				passReqToCallback : true
			}, function(req, username, password, done) {
				CNAME.findOne({
					'username':username
				},function(err, NAME) {
					if (err) return done(err);
					if (NAME) return done(null, false);
					else {
						var newUser = new User();
						newUser.username = username;
						newUser.fullName = req.body.fullName;
						newUser.email = req.body.email;
						newUser.myRegion = req.body.myRegion || 'Dnipropetrovsk';
						newUser.password = newUser.generateHash(password);
						newUser.profileUrl = 'id'+Date.now();
						newUser.save(function(err) {
							if (err) throw err;
							return done(null, newUser);
						});
					}
				});
			}));
		}
	// End of Crud
};