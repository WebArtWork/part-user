var User = require(__dirname+'/schema.js');
module.exports = function(sd) {
	var router = sd._initRouter('/api/user');
	let ensure_admin = sd.ensure_admin = function(req, res, next){
		if(req.user&&req.user.is&&req.user.is.admin) next();
		else res.send(false);
	};
	/*
	*	waw crud : Get Configuration
	*/
		sd['query_get_user'] = function(){return {}};
		sd['select_get_user'] = function(){return 'avatarUrl skills gender name birth'};
		sd['query_get_user_admin'] = function(){return {}};
		sd['select_get_user_admin'] = function(){return '-password'};
	/*
	*	waw crud : Update Configuration
	*/


		/*
		router.post("/update", sd._ensure, function(req, res) {
			User.findOne({
				_id: req.user._id
			}, function(err, doc) {
				if (err || !doc) return res.json(false);
				updateUser(doc, req.body, function(){
					res.json(req.body);
				});
			});
		});
		var updateUser = function(user, newUser, cb){
			user.skills = newUser.skills;
			user.gender = newUser.gender;
			user.name = newUser.name;
			user.birth = newUser.birth;
			user.data = newUser.data;
			if(newUser.avatarUrl.length>100){
				user.avatarUrl = '/api/user/avatar/' + user._id + '.jpg?' + Date.now();
			}
			sd._parallel([function(n){
				user.save(n);
			}, function(n){
				if(!newUser.avatarUrl||newUser.avatarUrl.length<100) return n();
				sd._dataUrlToLocation(newUser.avatarUrl,
				__dirname + '/client/files/', user._id + '.jpg', n);
			}], cb);
		}
		sd._ensureAdmin = function(req, res, next){
			if(req.user&&req.user.isAdmin) next();
			else res.json(false);
		}
		router.get("/admin/users", sd._ensureAdmin, function(req, res) {
			User.find({}).select('-password').populate([{
				path: 'followings'
			},{
				path: 'followers'				
			}]).exec(function(err, users){
				res.json(users||[]);
			});
		});
		router.post("/admin/create", sd._ensureAdmin, function(req, res) {
			var newUser = new User();
			newUser.email = req.body.email.toLowerCase();
			newUser.password = newUser.generateHash(req.body.password);
			newUser.save(function(err) {
				if (err) return res.json(false);
				res.json(newUser);
			});
		});
		router.post("/admin/update", sd._ensureAdmin, function(req, res) {
			User.findOne({
				_id: req.body._id
			}, function(err, doc) {
				if (err || !doc) return res.json(false);
				doc.isAdmin = req.body.isAdmin;
				updateUser(doc, req.body, function(){
					res.json(true);
				});
			});
		});
		*/
	/*
	*	waw crud : Delete Configuration
	*/
		sd['ensure_delete_user_admin'] = ensure_admin;
		sd['query_delete_user_admin'] = function(req, res, next){
			return {
				_id: req.body._id
			}
		};
		sd['query_delete_user'] = function(req, res, next){
			return {
				_id: req.user._id
			}
		};
		sd['files_to_remove_delete_user'] = function(req, res, next){
			return __dirname+'/files/'+req.user._id;
		};
	/*
	*	Custom Routes Management
	*/
		router.get("/me", sd._ensure, function(req, res) {
			res.json({
				followings: req.user.followings,
				followers: req.user.followers,
				avatarUrl: req.user.avatarUrl,
				skills: req.user.skills,
				gender: req.user.gender,
				birth: req.user.birth,
				name: req.user.name,
				date: req.user.date,
				_id: req.user._id
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
		router.post("/admin/changePassword", ensure_admin, function(req, res) {
			User.findOne({_id: req.body._id}, function(err, user){
				user.password = user.generateHash(req.body.newPass);
				user.save(function(){
					res.json(true);
				});
			});
		});
		router.get("/avatar/:file", function(req, res) {
			res.sendFile(__dirname + '/files/' + req.params.file);
		});
		router.get("/default.png", function(req, res) {
			res.sendFile(__dirname + '/files/avatar.png');
		});
	// End of
};