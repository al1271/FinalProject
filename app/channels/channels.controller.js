angular.module('schedulizer')
  .controller('ChannelsCtrl', function($state, Auth, Users, profile, channels){
    var channelsCtrl = this;

    channelsCtrl.profile = profile;
    channelsCtrl.channels = channels;
    
    //access all users in database
    channelsCtrl.users = Users.all;
    //getting user info
    channelsCtrl.getDisplayName = Users.getDisplayName;
    channelsCtrl.getGravatar = Users.getGravatar;
    //setting user online based on id
    Users.setOnline(profile.$id);
    //logout using $unauth then sending to home
    channelsCtrl.logout = function(){
        //save that user is no longer online
      channelsCtrl.profile.online = null;
      channelsCtrl.profile.$save().then(function(){
        Auth.$unauth();
        $state.go('home');
      });
    };

    channelsCtrl.newChannel = {
      name: ''
    };
    //adding a new channel then redirecting to channels.messages state based on the Id
    channelsCtrl.createChannel = function() {
      channelsCtrl.channels.$add(channelsCtrl.newChannel).then(function(ref){
          $state.go('channels.messages', {channelId: ref.key()});
        });
    }
  });