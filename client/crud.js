/*
* Crud file for client side user
*/
crudServices.User = function($http, $timeout, socket){
	// Initialize
	var srv = {},
		updateTimeout;
	// Routes
		srv.update = function(obj, callback){
			if(!obj) return;
			var userUpdate = {
				name: user.name
			}
			$timeout.cancel(updateTimeout);
			$http.post('/api/user/update', userUpdate)
			.then(function(){
				if(typeof callback == 'function')
					callback();
				socket.emit('MineUserUpdated', userUpdate);
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
			$http.post('/api/user/delete', obj)
			.then(function(){
				if(typeof callback == 'function')
					callback();
				socket.emit('MineUserDeleted', obj);
			});
		}
		srv.logout = function(callback){
			if(!obj) return;
			$http.post('/api/user/logout')
			.then(function(){
				if(typeof callback == 'function')
					callback();
			});
		}
		srv.changePassword = function(oldPass, newPass){
			if(!oldPass||!newPass) return;
			$http.post('/api/user/changePassword',{
				oldPass: oldPass,
				newPass: newPass
			}).then(function(resp){
				if(resp.data){
					socket.emit('MineUserUpdated', {
						logout: true
					});
				}
			});
		}
		srv.addLocalAccount = function(user, email, pass){
			if(!email||!pass) return;
			user.email = email;
			$http.post('/api/user/addLocalAccount',{
				email: email,
				password: pass
			}).then(function(resp){
				if(resp.data){
					socket.emit('MineUserUpdated', {
						email: email
					});
				}
			});
		}
		srv.changeAvatar = function(user, dataUrl){
			$timeout(function(){
				user.avatarUrl = dataUrl;
			});
			$http.post('/api/user/changeAvatar', {
				dataUrl: dataUrl
			}).then(function(resp){
				if(resp.data){							
					$timeout(function(){
						user.avatarUrl = resp.data;
						socket.emit('MineUserUpdated', {
							avatarUrl: resp.data
						});
					});
				}
			});
		}
	// Sockets
		socket.on('MineUserUpdated', function(user){
			if(user.logout) return srv.logout(function(){
				location.reload();
			});
			if(typeof srv.MineUserUpdated == 'function'){
				srv.MineUserUpdated(user);
			}
		});
		socket.on('MineUserDeleted', function(user){
			srv.logout(function(){
				location.reload();
			});
		});
	// End of service
	return srv;
}