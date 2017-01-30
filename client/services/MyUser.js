/*
*	MyUser service. Crud is required.
*/
services.MyUser=function(User, $http, $timeout){
	"ngInject";
	User.done = false;
	$http.get('/api/user/myUser')
	.then(function(resp){
		obj.done = true;
		obj.auth = resp.data.auth;
		obj.users = resp.data.users;
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
		if(obj.users){
			for (var i = 0; i < obj.users.length; i++) {
				if(obj.users[i].userUrl==code||obj.users[i]._id==code){
					return obj.userSelected = obj.users[i];
				}
			}
		}
	}
	console.log(obj);
	return obj;
};