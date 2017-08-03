/*
*	Crud file for client side user
*/
crudServices.User = function($http, $timeout, socket){
	// Initialize
		var srv = {};
	// Routes
		srv.update = function(obj, callback){
			if(!obj) return;
			$timeout.cancel(obj.updateTimeout);
			$http.post('/api/user/update', obj)
			.then(function(){
				if(typeof callback == 'function')
					callback();
			});
		}
		srv.updateAfterWhile = function(obj){
			$timeout.cancel(obj.updateTimeout);
			obj.updateTimeout = $timeout(function(){
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
	// End of service
	return srv;
}
/*
*	End for User Crud.
*/