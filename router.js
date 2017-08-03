var User = require(__dirname+'/schema.js');
var mongoose = require('mongoose');
module.exports = function(sd) {
	// Initialize
		var router = sd._initRouter('/api/user');
		if(mongoose.connection.readyState==0){
			mongoose.connect(sd._mongoUrl, {
				useMongoClient: true
			});
		}
		sd.User = User;
		sd._passport.serializeUser(function(user, done) {
			done(null, user.id);
		});
		sd._passport.deserializeUser(function(id, done) {
			User.findById(id, function(err, user) {
				done(err, user);
			});
		});
	// Routes
		router.post("/update", sd._ensure, sd._ensureUpdateObject, function(req, res) {
			User.findOne({
				_id: req.body._id
			}, function(err, doc) {
				if (err || !doc) return res.json(false);
				sd._searchInObject(doc, req.body, ['name', 'friends']);
				doc.save(function() {
					res.json(req.body);
				});
			});
		});	
		router.post("/changePassword", sd._ensure, function(req, res) {
			if (!req.user.validPassword(req.body.oldPass)){
				req.user.password = req.user.generateHash(req.body.newPass);
				req.user.save(function(){
					res.json(true);
				});
			}else res.json(false);
		});
		router.post("/changeAvatar", sd._ensure, function(req, res) {
			var base64Data = req.body.dataUrl.replace(/^data:image\/png;base64,/,'').replace(/^data:image\/jpeg;base64,/,'');
			var decodeData=new Buffer(base64Data,'base64');
			var fileName = req.user.email||req.user.username + "_" + Date.now() + '.png';
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
			res.sendFile(__dirname + '/client/avatar.jpg');
		});
	// End of
};