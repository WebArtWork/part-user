var User = require(__dirname + '/schema.js');
module.exports = function(waw) {
	/*
	*	Serve Client
	*/
		waw.use(function(req, res, next) {
			let host = req.get('host').toLowerCase();
			if(req.url.indexOf('/api/')==0) return next();
			if(waw.config.user && waw.config.user.urls.indexOf(host)>=0){
				if(req.url.indexOf('.')>-1){
					res.sendFile(process.cwd()+'/client/dist/client'+req.url);
				}else{
					let pages = waw.config.user.pages.split(' ');
					for (var i = 0; i < pages.length; i++) {
						if(req.url.indexOf(pages[i])>=0){
							return res.sendFile(process.cwd()+'/client/dist/client/index.html');
						}
					}
					next();
				}
			}else{
				next();
			}
		});
	/*
	*	Set is on users from config
	*/
		const set_is = (email, is)=>{
			User.findOne({
				email: email
			}, function(err, user){
				if(!user) return;
				if(!user.is) user.is={};
				user.is[is] = true;
				user.markModified('is');
				user.save((err)=>{
					if(err) console.log(err);
				});
			});
		}
		if(waw.config.user && waw.config.user.is){
			for(let is in waw.config.user.is){
				let emails = waw.config.user.is[is].split(' ');
				for (var i = 0; i < emails.length; i++) {
					set_is(emails[i], is);
				}
			}
		}
	/*
	*	Routing
	*/
	var router = waw.router('/api/user');
	waw.crud('user', {
		get: {
			query: function(){
				return {};
			},
			select: function(){
				return '-password';
			}
		},
		fetch: {
			query: function(req){
				return {
					_id: req.user._id
				}
			}
		},
		update: [{
			query: function(req, res, next) {
				return {
					_id: req.user._id
				}
			}
		}, {
			name: 'admin',
			ensure: function(req, res, next){
				if(req.user && req.user.is && req.user.is.admin){
					next();
				}else{
					res.json(false);
				}
			},
			query: function(req, res, next) {
				return {
					_id: req.body._id
				}
			}
		}], delete: {
			name: 'admin',
			ensure: function(req, res, next){
				if(req.user && req.user.is && req.user.is.admin){
					next();
				}else{
					res.json(false);
				}
			},
			query: function(req, res, next) {
				return {
					_id: req.body._id
				}
			}
		}
	});
	router.post("/avatar", function(req, res) {
		req.user.avatarUrl = '/api/user/avatar/' + req.user._id + '.jpg?' + Date.now();
		waw.parallel([function(next) {
			req.user.save(next);
		}, function(next) {
			waw.dataUrlToLocation(req.body.dataUrl, __dirname + '/files/', req.user._id + '.jpg', next);
		}], function() {
			res.json(req.user.avatarUrl);
		});
	});
	router.get("/avatar/:file", function(req, res) {
		res.sendFile(__dirname + '/files/' + req.params.file);
	});
	router.get("/default.png", function(req, res) {
		res.sendFile(__dirname + '/files/avatar.png');
	});
};