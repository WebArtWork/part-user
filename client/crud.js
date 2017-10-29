
/*
*	Crud file for client side user
*/
services.User = function($http, $timeout){
	// Initialize
		var self = this, updateTimeout;
		$http.get('/api/user/get').then(function(resp){
			self.avatarUrl = resp.data.avatarUrl;
			self.skills = resp.data.skills;
			self.followings = resp.data.followings;
			self.followers = resp.data.followers;
			self.gender = resp.data.gender;
			self.name = resp.data.name;
			self.birth = resp.data.birth;
			self.date = resp.data.date;
			self._id = resp.data._id;
			$http.get('/api/user/users').then(function(resp){
				self.users = resp.data.users;
			});
		});
	// Skills
		var enum = [];
		this.addSkill = function(skill){

			self.update();
		}
		this.removeSkill = function(skill){

			self.update();
		}
	// Followings
		this.addFollowiner = function(user){

			self.update();
		}
		this.removeFollowiner = function(user){

			self.update();
		}
	// Followers
		this.addFollower = function(user){

			self.update();
		}
		this.removeFollower = function(user){

			self.update();
		}
	// Routes
		this.update = function(){
			$timeout.cancel(updateTimeout);
			$http.post('/api/user/update', {
				avatarUrl: self.avatarUrl,
				skills: self.skills,
				followings: self.followings,
				followers: self.followers,
				gender: self.gender,
				name: self.name,
				birth: self.birth,
				date: self.date,
				_id: self._id
			});
		}
		this.updateAfterWhile = function(){
			$timeout.cancel(updateTimeout);
			obj.updateTimeout = $timeout(self.update, 1000);
		}
		this.delete = function(){
			$http.post('/api/user/delete', {
				_id: self._id
			});
		}
		this.changePassword = function(oldPass, newPass){
			if(!oldPass||!newPass) return;
			$http.post('/api/user/changePassword',{
				oldPass: oldPass,
				newPass: newPass
			});
		}
	// End of service
}
/*
*	End for User Crud.
*/