/*
*	Crud file for client side NAME
*/
crudServices.CNAME = function($http, $timeout, socket){
	// Initialize
	var srv = {},
		updateTimeout;
	// Routes
		srv.update = function(obj, callback){
			if(!obj) return;
			$timeout.cancel(updateTimeout);
			$http.post('/api/NAME/update', obj)
			.then(function(){
				if(typeof callback == 'function')
					callback();
				socket.emit('MineCNAMEUpdated', obj);
			});		
		}
		srv.updateAfterWhile = function(obj){
			$timeout.cancel(updateTimeout);
			updateTimeout = $timeout(function(){
				srv.update(obj);
			}, 1000);
		}
		srv.delete = function(obj, callback){
			if(!obj) return;
			$http.post('/api/NAME/delete', obj)
			.then(function(){
				if(typeof callback == 'function')
					callback();
				socket.emit('MineCNAMEDeleted', obj);
			});
		}
		srv.logout = function(callback){
			if(!obj) return;
			$http.post('/api/NAME/logout')
			.then(function(){
				if(typeof callback == 'function')
					callback();
			});
		}
		srv.changePassword = function(oldPass, newPass){
			if(!oldPass||!newPass) return;
			$http.post('/api/NAME/changePassword',{
				oldPass: oldPass,
				newPass: newPass
			}).then(function(resp){
				if(resp.data){
					socket.emit('MineCNAMEUpdated', {
						logout: true
					});
				}
			});
		}
		srv.addLocalAccount = function(NAME, email, pass){
			if(!email||!pass) return;
			NAME.email = email;
			$http.post('/api/NAME/addLocalAccount',{
				email: email,
				password: pass
			}).then(function(resp){
				if(resp.data){
					socket.emit('MineCNAMEUpdated', {
						email: email
					});
				}
			});
		}
		srv.changeAvatar = function(NAME, dataUrl){
			$timeout(function(){
				NAME.avatarUrl = dataUrl;
			});
			$http.post('/api/NAME/changeAvatar', {
				dataUrl: dataUrl
			}).then(function(resp){
				if(resp.data){							
					$timeout(function(){
						NAME.avatarUrl = resp.data;
						socket.emit('MineCNAMEUpdated', {
							avatarUrl: resp.data
						});
					});
				}
			});
		}
	// Sockets
		socket.on('MineCNAMEUpdated', function(NAME){
			if(NAME.logout) return srv.logout(function(){
				location.reload();
			});
			if(typeof srv.MineCNAMEUpdated == 'function'){
				srv.MineCNAMEUpdated(NAME);
			}
		});
		socket.on('MineCNAMEDeleted', function(NAME){
			srv.logout(function(){
				location.reload();
			});
		});
	// End of service
	return srv;
}
/*
*	img service.
*/
services.Image = function($http){
	"ngInject";
	var obj = {};
	obj.resizeUpTo = function(info, callback){
		if(!info.file) return console.log('No image');
		info.width = info.width || 1920;
		info.height = info.height || 1080;
		if(info.file.type!="image/jpeg" && info.file.type!="image/png")
			return console.log("You must upload file only JPEG or PNG format.");
		var reader = new FileReader();
		reader.onload = function (loadEvent) {
			var ratioToFloat = function(val) {
				var r = val.toString(),
					xIndex = r.search(/[x:]/i);
				if (xIndex > -1) {
					r = parseFloat(r.substring(0, xIndex)) / parseFloat(r.substring(xIndex + 1));
				} else {
					r = parseFloat(r);
				}
				return r;
			};
			var canvasElement = document.createElement('canvas');
			var imageElement = document.createElement('img');
			imageElement.onload = function() {
				var ratioFloat = ratioToFloat(info.width/info.height);
				var imgRatio = imageElement.width / imageElement.height;
				if (imgRatio < ratioFloat) {
					width = info.width;
					height = width / imgRatio;
				} else {
					height = info.height;
					width = height * imgRatio;
				}
				canvasElement.width = width;
				canvasElement.height = height;
				var context = canvasElement.getContext('2d');
				context.drawImage(imageElement, 0, 0 , width, height);
				callback(canvasElement.toDataURL('image/png', 1));
			};
			imageElement.src = loadEvent.target.result;
		};
		reader.readAsDataURL(info.file);
	}
	return obj;
};
/*
*	MyCNAME service. Crud is required.
*/
services.MyCNAME = function(CNAME, $http, $timeout){
	"ngInject";
	CNAME.done = false;
	$http.get('/api/NAME/myCNAME')
	.then(function(resp){
		obj.done = true;
		obj.auth = resp.data.auth;
		obj.NAMEs = resp.data.NAMEs;
		if(obj.selectedUserCode) obj.selectUser(obj.selectedUserCode);
		if(obj.auth){
			obj.isAdmin = resp.data.isAdmin;
			obj.email = resp.data.email;
			obj.twitter = resp.data.twitter;
			obj.name = resp.data.name;
			obj.avatarUrl = resp.data.avatarUrl;
		}
	});
	obj.selectUser = function(code){
		obj.selectedUserCode = code;
		if(obj.NAMEs){
			for (var i = 0; i < obj.NAMEs.length; i++) {
				if(obj.NAMEs[i].userUrl==code||obj.NAMEs[i]._id==code){
					return obj.NAMESelected = obj.NAMEs[i];
				}
			}
		}
	}
	console.log(obj);
	return obj;
};
/*
*	End for User Crud.
*/