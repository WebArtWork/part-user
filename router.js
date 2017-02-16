var User = require(__dirname+'/schema.js');
var api = '/api/NAME';
module.exports = function(app, express, sd) {
	var router = express.Router();
	app.use(api, router);
	router.get('/logout', function(req, res) {
		req.logout();
		res.redirect(sd.config.passport.local.successRedirect);
	});
	router.get("/myCNAME", function(req, res) {
		User.find({
			_id: { $ne: req.user&&req.user._id }
		}).select('-password -twitter').exec(function(err, NAMEs){
			if(req.user){
				res.json({
					auth: true,
					email: req.user.email,
					name: req.user.name,
					isAdmin: req.user.isAdmin,
					twitter: !!req.user.twitter,
					avatarUrl: req.user.avatarUrl,
					NAMEs: NAMEs
				});
			}else{
				res.json({
					auth: false,
					NAMEs: NAMEs
				});
			}
		});
	});
};